// 1. Your Firebase configuration (replace with your actual config from Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 2. Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// === Utility/State ===
let myId = Math.random().toString(36).slice(2, 9);
let myName = "You";
let myRoomCode = null;
let isHost = false;
let chatListener = null;

// === UI Elements ===
const $chatHistory = document.getElementById('chatHistory');
const $chatForm = document.getElementById('chatForm');
const $chatInput = document.getElementById('chatInput');
const $createRoomBtn = document.getElementById('createRoomBtn');
const $joinRoomBtn = document.getElementById('joinRoomBtn');
const $confirmCreateBtn = document.getElementById('confirmCreateBtn');
const $confirmJoinBtn = document.getElementById('confirmJoinBtn');
const $leaveRoomBtn = document.getElementById('leaveRoomBtn');
const $roomCodeDisplay = document.getElementById('roomCodeDisplay');
const $qrCanvas = document.getElementById('qrCanvas');
const $maxSizeInput = document.getElementById('maxSizeInput');
const $joinCodeInput = document.getElementById('joinCodeInput');
const $createError = document.getElementById('createError');
const $joinError = document.getElementById('joinError');

// === Navigation/Screen logic ===
function show(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screen).classList.add('active');
}
document.getElementById('splashEnter').onclick = () => show('menu');
document.getElementById('splash').onclick = () => show('menu');
$createRoomBtn.onclick = () => show('createRoomScreen');
$joinRoomBtn.onclick = () => show('joinRoomScreen');
document.getElementById('backToMenuFromCreate').onclick = () => {
  $createError.textContent = "";
  show('menu');
};
document.getElementById('backToMenuFromJoin').onclick = () => {
  $joinError.textContent = "";
  show('menu');
};

// === Room and Chat Logic ===

// Helper: Generate random 6-char code (A-Z, 2-9)
function makeRoomCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; ++i) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Create Room
$confirmCreateBtn.onclick = async () => {
  const max = parseInt($maxSizeInput.value);
  if (!(max >= 2 && max <= 9)) {
    $createError.textContent = "Choose a size between 2 and 9.";
    return;
  }
  let code = "";
  let codeExists = true;
  // Find unique code
  while (codeExists) {
    code = makeRoomCode();
    const snap = await db.ref('rooms/' + code).once('value');
    codeExists = snap.exists();
  }
  myRoomCode = code;
  isHost = true;

  // Create room in DB
  await db.ref('rooms/' + code).set({
    size: max,
    members: {
      [myId]: { id: myId, name: myName }
    },
    hostId: myId,
    chat: {}
  });
  enterRoom(code);
};

// Join Room
$confirmJoinBtn.onclick = async () => {
  const code = $joinCodeInput.value.trim().toUpperCase();
  $joinError.textContent = "";
  if (!/^[A-Z2-9]{6}$/.test(code)) {
    $joinError.textContent = "Invalid code format.";
    return;
  }
  const roomSnap = await db.ref('rooms/' + code).once('value');
  if (!roomSnap.exists()) {
    $joinError.textContent = "Room not found or no longer exists.";
    return;
  }
  const room = roomSnap.val();
  if (room.members && Object.keys(room.members).length >= room.size) {
    $joinError.textContent = "Room is full.";
    return;
  }
  myRoomCode = code;
  isHost = false;
  // Add to members in DB
  await db.ref(`rooms/${code}/members/${myId}`).set({ id: myId, name: myName });
  enterRoom(code);
};

// Enter Room
function enterRoom(code) {
  // QR
  new QRious({
    element: $qrCanvas,
    value: code,
    size: 180,
    background: '#fff',
    foreground: '#111'
  });
  $roomCodeDisplay.textContent = code.split('').join(' ');
  show('roomScreen');
  listenToChat(code);
}

// Leave Room
$leaveRoomBtn.onclick = async () => {
  if (myRoomCode) {
    // Remove self from members
    await db.ref(`rooms/${myRoomCode}/members/${myId}`).remove();
    // If host and last member, delete room
    if (isHost) {
      const snap = await db.ref(`rooms/${myRoomCode}/members`).once('value');
      if (!snap.exists() || Object.keys(snap.val()).length === 0) {
        await db.ref(`rooms/${myRoomCode}`).remove();
      }
    }
    myRoomCode = null;
    isHost = false;
    if (chatListener) {
      chatListener.off();
      chatListener = null;
    }
    $chatHistory.innerHTML = "";
    show('menu');
  }
};

// Listen for chat updates in room
function listenToChat(code) {
  if (chatListener) chatListener.off();
  chatListener = db.ref(`rooms/${code}/chat`);
  $chatHistory.innerHTML = "";
  chatListener.on('child_added', function(snapshot) {
    const msg = snapshot.val();
    addMessage(msg.who, msg.text, msg.timestamp);
  });
}

// Send message
$chatForm.onsubmit = function(e) {
  e.preventDefault();
  if (!myRoomCode) return;
  const text = $chatInput.value.trim();
  if (!text) return;
  db.ref(`rooms/${myRoomCode}/chat`).push({
    who: myName,
    text: text,
    timestamp: Date.now()
  });
  $chatInput.value = "";
};

// Show messages
function addMessage(who, text, ts) {
  const d = ts ? new Date(ts) : new Date();
  const time = d.toLocaleTimeString();
  const div = document.createElement('div');
  div.className = "chat-message" + (who === myName ? " me" : "");
  div.textContent = `[${time}] ${who}: ${text}`;
  $chatHistory.appendChild(div);
  $chatHistory.scrollTop = $chatHistory.scrollHeight;
}

// Optional: Handle window unload (leave room)
window.onbeforeunload = async () => {
  if (myRoomCode) {
    await db.ref(`rooms/${myRoomCode}/members/${myId}`).remove();
    if (isHost) {
      const snap = await db.ref(`rooms/${myRoomCode}/members`).once('value');
      if (!snap.exists() || Object.keys(snap.val()).length === 0) {
        await db.ref(`rooms/${myRoomCode}`).remove();
      }
    }
  }
};
