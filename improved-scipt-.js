<script>
  // Firebase configuration (leave as-is)
  const firebaseConfig = {
    apiKey: "AIZaSyDNz_qKPgZlfhVcXtKKtCTU-ynfBkLOSC4",
    authDomain: "quepasaapp-2e0f7.firebaseapp.com",
    databaseURL: "https://quepasaapp-2e0f7-default-rtdb.firebaseio.com",
    projectId: "quepasaapp-2e0f7",
    storageBucket: "quepasaapp-2e0f7.appspot.com",
    messagingSenderId: "500826556029",
    appId: "1:500826556029:web:707b10faf864433d71d314",
    measurementId: "G-ZL2TN8H31C"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  let myId = Math.random().toString(36).slice(2, 9);
  let myName = "Anon" + myId.slice(-3); // Give each user a unique default name
  let myRoomCode = null;
  let isHost = false;
  let chatListener = null;
  let leftRoom = false;

  const $chatHistory = document.getElementById('chatHistory');
  const $chatForm = document.getElementById('chatForm');
  const $chatInput = document.getElementById('chatInput');
  const $leaveRoomBtn = document.getElementById('leaveRoomBtn');
  const $roomCodeDisplay = document.getElementById('roomCodeDisplay');
  const $qrCanvas = document.getElementById('qrCanvas');
  const $chatBar = document.getElementById('chatBar');
  const $joinRoomBtn = document.getElementById('joinRoomBtn');
  const $joinCodeInput = document.getElementById('joinCodeInput');

  function addMessage(who, text, ts) {
    const d = ts ? new Date(ts) : new Date();
    const time = d.toLocaleTimeString();
    const div = document.createElement('div');
    div.className = "chat-message" + (who === myName ? " me" : "");
    div.textContent = `[${time}] ${who}: ${text}`;
    $chatHistory.appendChild(div);
    $chatHistory.scrollTop = $chatHistory.scrollHeight;
  }

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
  }

  async function joinRoomByCode(code) {
    code = code.toUpperCase().replace(/[^A-Z0-9]/g,'');
    if (!code || code.length !== 6) return alert("Please enter a valid 6-character room code.");
    const snap = await db.ref('rooms/' + code).once('value');
    if (!snap.exists()) return alert("That room doesn't exist.");
    myRoomCode = code;
    isHost = false;
    leftRoom = false;
    await db.ref(`rooms/${myRoomCode}/members/${myId}`).set({ id: myId });
    displayRoomInfo();
    listenToChat(myRoomCode);
    $chatHistory.innerHTML = "";
  }

  function displayRoomInfo() {
    if (!myRoomCode) return;
    $roomCodeDisplay.textContent = myRoomCode.split('').join(' ');
    // Generate QR code for the room code
    if (window.QRious) {
      new QRious({
        element: $qrCanvas,
        value: myRoomCode,
        size: 220,
        background: '#fff',
        foreground: '#23272a'
      });
      $qrCanvas.style.display = "block";
    } else {
      $qrCanvas.style.display = "none";
    }
  }

  (async function init() {
    await createRoomAndEnter();
  })();

  function listenToChat(code) {
    if (chatListener) chatListener.off();
    chatListener = db.ref(`rooms/${code}/chat`);
    $chatHistory.innerHTML = "";
    chatListener.on('child_added', function(snapshot) {
      if (leftRoom) return;
      const msg = snapshot.val();
      addMessage(msg.who, msg.text, msg.timestamp);
    });
  }

  $chatForm.onsubmit = function(e) {
    e.preventDefault();
    if (!myRoomCode || leftRoom) return;
    const text = $chatInput.value.trim();
    if (!text) return;
    db.ref(`rooms/${myRoomCode}/chat`).push({
      who: myName,
      text: text,
      timestamp: Date.now()
    });
    $chatInput.value = "";
  };

  $joinRoomBtn.onclick = async () => {
    if (leftRoom) return;
    const code = $joinCodeInput.value.trim();
    await joinRoomByCode(code);
  };

  $joinCodeInput.addEventListener('keyup', function(e) {
    if (e.key === "Enter") $joinRoomBtn.click();
  });

  $leaveRoomBtn.onclick = async () => {
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
      $chatBar.innerHTML = `<div class="disconnected-message">You have disconnected and the chat room is closed.<br>Refresh the page to start a new chat!</div>`;
    }
  };

  window.onbeforeunload = async () => {
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
    }
  };
</script>
