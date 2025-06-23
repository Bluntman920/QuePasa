// QUE PASA APP - Main Script

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

// --- DOM Element References ---
const $roomCodeDisplay = document.getElementById('roomCodeDisplay');
const $qrCanvas = document.getElementById('qrCanvas');
const $showQrBtn = document.getElementById('showQrBtn');
const $qrOverlay = document.getElementById('qrOverlay');
const $qrFullscreenCanvas = document.getElementById('qrFullscreenCanvas');
const $closeQrBtn = document.getElementById('closeQrBtn');
const $chatHistory = document.getElementById('chatHistory');
const $chatForm = document.getElementById('chatForm');
const $chatInput = document.getElementById('chatInput');
const $bombBtn = document.getElementById('bombBtn');
const $fuseBar = document.getElementById('fuseBar');

// --- Global State ---
let myId = Math.random().toString(36).slice(2, 9);
let myRoomCode = null;
let isHost = false;
let chatListener = null;
let leftRoom = false;

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

// --- Create Room & Enter (or join if ?room=) ---
async function startChat() {
  const params = new URLSearchParams(window.location.search);
  let room = params.get("room");
  if (!room) {
    room = await makeRoomCode();
    window.history.replaceState({}, '', '?room=' + room);
    isHost = true;
    await db.ref('rooms/' + room).set({
      size: 2,
      members: { [myId]: { id: myId } },
      hostId: myId,
      chat: {}
    });
  } else {
    // Try to join existing room (enforce 2 users)
    const snap = await db.ref('rooms/' + room).once('value');
    if (!snap.exists()) {
      alert("Room doesn't exist. Reloading...");
      window.location = window.location.pathname;
      return;
    }
    const data = snap.val();
    if (data.members && Object.keys(data.members).length >= 2) {
      alert("Room is full (max 2 users).");
      window.location = window.location.pathname;
      return;
    }
    await db.ref(`rooms/${room}/members/${myId}`).set({ id: myId });
    isHost = false;
  }
  myRoomCode = room;
  displayRoomInfo();
  listenToChat(room);
}

// --- Display Room Info & QR ---
function displayRoomInfo() {
  $roomCodeDisplay.textContent = myRoomCode;
  if (window.QRious) {
    new QRious({
      element: $qrCanvas,
      value: getRoomURL(),
      size: 120,
      background: '#fff',
      foreground: '#23272a'
    });
  }
}
function getRoomURL() {
  return window.location.origin + window.location.pathname + '?room=' + myRoomCode;
}

// --- Chat Listener ---
function listenToChat(code) {
  if (chatListener) chatListener.off();
  chatListener = db.ref(`rooms/${code}/chat`);
  $chatHistory.innerHTML = "";
  chatListener.on('child_added', function(snapshot) {
    if (leftRoom) return;
    const msg = snapshot.val();
    addMessage(msg.senderId === myId, msg.text, msg.timestamp);
  });
}

// --- Add Message ---
function addMessage(isMine, text, ts) {
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
    text: text,
    timestamp: Date.now(),
    senderId: myId
  });
  $chatInput.value = "";
};

// --- QR Fullscreen Toggle ---
$showQrBtn.onclick = () => {
  $qrOverlay.style.display = "flex";
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
  $qrOverlay.style.display = "none";
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

// --- Leave/Disconnect Logic ---
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
    $chatHistory.innerHTML = `<div class="disconnected-message">💣 Chat closed.<br>Refresh to start again.</div>`;
  }
}
window.onbeforeunload = async () => { await leaveRoom(); };

// --- Start Chat on Load ---
window.addEventListener('DOMContentLoaded', startChat);
