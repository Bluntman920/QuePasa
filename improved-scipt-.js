console.log('QUE PASA APP Script loaded');

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIZaSyDNz_qKPgZlfhVcXtKKtCTU-ynfBkLOSC4",
  authDomain: "quepasaapp-2e0f7.firebaseapp.com",
  databaseURL: "https://quepasaapp-2e0f7-default-rtdb.firebaseio.com",
  projectId: "quepasaapp-2e0f7",
  storageBucket: "quepasaapp-2e0f7.appspot.com",
  messagingSenderId: "500826556029",
  appId: "1:500826556029:web:707b10faf864433d71d314"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- Global State ---
let myId = Math.random().toString(36).slice(2, 9);
let myName = "Anon";
let myRoomCode = null;
let isHost = false;
let chatListener = null;
let leftRoom = false;

// --- DOM Elements ---
const $mainWrap = document.getElementById('mainWrap');
const $splash = document.getElementById('splash');
const $roomCodeDisplay = document.getElementById('roomCodeDisplay');
const $qrCanvas = document.getElementById('qrCanvas');
const $showQrBtn = document.getElementById('showQrBtn');
const $qrFullscreenOverlay = document.getElementById('qrFullscreenOverlay');
const $qrFullscreenCanvas = document.getElementById('qrFullscreenCanvas');
const $closeQrBtn = document.getElementById('closeQrBtn');
const $chatHistory = document.getElementById('chatHistory');
const $chatForm = document.getElementById('chatForm');
const $chatInput = document.getElementById('chatInput');
const $leaveRoomBtn = document.getElementById('leaveRoomBtn');
const $bombBtn = document.getElementById('bombBtn');
const $fuseBar = document.getElementById('fuseBar');
const $joinRoomBtn = document.getElementById('joinRoomBtn');
const $joinCodeInput = document.getElementById('joinCodeInput');

// --- Utility: Room Code Generator ---
async function makeRoomCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  let codeExists = true;
  while (codeExists) {
    code = "";
    for (let i = 0; i < 6; ++i) code += chars[Math.floor(Math.random() * chars.length)];
    const snap = await db.ref('rooms/' + code).once('value');
    codeExists = snap.exists();
  }
  return code;
}

// --- Create Room & Enter ---
async function createRoomAndEnter() {
  myRoomCode = await makeRoomCode();
  isHost = true;
  leftRoom = false;
  await db.ref('rooms/' + myRoomCode).set({
    size: 2,
    members: { [myId]: { id: myId } },
    hostId: myId,
    chat: {}
  });
  displayRoomInfo();
  listenToChat(myRoomCode);
  showMainWrap();
}

// --- Show Main Chat Area ---
function showMainWrap() {
  if ($splash) $splash.style.display = 'none';
  if ($mainWrap) $mainWrap.style.display = 'flex';
}

// --- Display Room Info, QR, Code ---
function displayRoomInfo() {
  if (!myRoomCode) return;
  $roomCodeDisplay.textContent = myRoomCode.split('').join(' ');
  if (window.QRious) {
    new QRious({
      element: $qrCanvas,
      value: getRoomURL(),
      size: 180,
      background: '#fff',
      foreground: '#23272a'
    });
    $qrCanvas.style.display = "block";
  } else {
    $qrCanvas.style.display = "none";
  }
}

// --- Room URL for QR ---
function getRoomURL() {
  return window.location.origin + window.location.pathname + '?room=' + myRoomCode;
}

// --- Listen to Chat Changes ---
function listenToChat(code) {
  if (chatListener) chatListener.off();
  chatListener = db.ref(`rooms/${code}/chat`);
  $chatHistory.innerHTML = "";
  chatListener.on('child_added', function(snapshot) {
    if (leftRoom) return;
    const msg = snapshot.val();
    addMessage(msg.who, msg.text, msg.timestamp, msg.senderId === myId);
  });
}

// --- Add Message to DOM (WhatsApp style) ---
function addMessage(who, text, ts, isMine) {
  const d = ts ? new Date(ts) : new Date();
  const time = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const div = document.createElement('div');
  div.className = "chat-bubble" + (isMine ? " me" : " other");
  div.innerHTML = `<span class="msg-text">${text}</span><span class="msg-meta">${time}</span>`;
  $chatHistory.appendChild(div);
  $chatHistory.scrollTop = $chatHistory.scrollHeight;
}

// --- Send Message ---
$chatForm.onsubmit = function(e) {
  e.preventDefault();
  if (!myRoomCode || leftRoom) return;
  const text = $chatInput.value.trim();
  if (!text) return;
  db.ref(`rooms/${myRoomCode}/chat`).push({
    who: myName,
    text: text,
    timestamp: Date.now(),
    senderId: myId
  });
  $chatInput.value = "";
};

// --- Join Room by Code ---
$joinRoomBtn.onclick = async () => {
  if (leftRoom) return;
  const code = $joinCodeInput.value.trim();
  await joinRoomByCode(code);
};

async function joinRoomByCode(code) {
  code = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!code || code.length !== 6) return alert("Enter valid 6-character code.");
  const snap = await db.ref('rooms/' + code).once('value');
  if (!snap.exists()) return alert("Room doesn't exist.");
  const data = snap.val();
  if (data.members && Object.keys(data.members).length >= 2) {
    return alert("Room is full (max 2 users).");
  }
  myRoomCode = code;
  isHost = false;
  leftRoom = false;
  await db.ref(`rooms/${myRoomCode}/members/${myId}`).set({ id: myId });
  displayRoomInfo();
  listenToChat(myRoomCode);
  showMainWrap();
}

$joinCodeInput.addEventListener('keyup', function(e) {
  if (e.key === "Enter") $joinRoomBtn.click();
});

// --- Leave/Disconnect Logic ---
$leaveRoomBtn.onclick = async () => {
  await leaveRoom();
  showDisconnected();
};

async function leaveRoom() {
  if (myRoomCode && !leftRoom) {
    leftRoom = true;
    try {
      await db.ref(`rooms/${myRoomCode}/members/${myId}`).remove();
      if (isHost) {
        const snap = await db.ref(`rooms/${myRoomCode}/members`).once('value');
        if (!snap.exists() || Object.keys(snap.val()).length === 0) {
          await db.ref(`rooms/${myRoomCode}`).remove();
        }
      }
    } catch (e) {}
    myRoomCode = null;
    isHost = false;
    if (chatListener) {
      chatListener.off();
      chatListener = null;
    }
  }
}

function showDisconnected() {
  $mainWrap.innerHTML = `<div class="disconnected-message">💣 Chat closed.<br>Refresh to start again.</div>`;
}

// --- Splash: Create Room on Load ---
window.addEventListener('load', async () => {
  setTimeout(async () => {
    if ($splash) $splash.style.display = 'none';
    if ($mainWrap) $mainWrap.style.display = 'flex';
    // If ?room= param exists, join that room
    const params = new URLSearchParams(window.location.search);
    const joinRoom = params.get("room");
    if (joinRoom) {
      await joinRoomByCode(joinRoom);
    } else {
      await createRoomAndEnter();
    }
  }, 1500);
});

// --- On Unload: Clean up room ---
window.onbeforeunload = async () => {
  await leaveRoom();
};

// --- QR Fullscreen Toggle ---
$showQrBtn.onclick = () => {
  $qrFullscreenOverlay.style.display = "flex";
  if (window.QRious) {
    new QRious({
      element: $qrFullscreenCanvas,
      value: getRoomURL(),
      size: 320,
      background: '#fff',
      foreground: '#23272a'
    });
  }
};
$closeQrBtn.onclick = () => {
  $qrFullscreenOverlay.style.display = "none";
};

// --- Bomb Button (Hold to Disconnect) ---
let fuseInterval = null, fusePercent = 100;
$bombBtn.onmousedown = () => {
  fusePercent = 100;
  $fuseBar.style.height = fusePercent + "%";
  $fuseBar.style.background = "linear-gradient(to top, orange, yellow)";
  fuseInterval = setInterval(async () => {
    fusePercent -= 5;
    $fuseBar.style.height = Math.max(0, fusePercent) + "%";
    if (fusePercent <= 0) {
      clearInterval(fuseInterval);
      await leaveRoom();
      window.location = "https://www.google.com";
    }
  }, 80);
};
$bombBtn.onmouseup = $bombBtn.onmouseleave = () => {
  clearInterval(fuseInterval);
  $fuseBar.style.height = "100%";
  $fuseBar.style.background = "linear-gradient(to top, orange, yellow)";
};
