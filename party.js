<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>QUE PASA</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link rel="icon" href="QuePasaLogo.png" type="image/png">
  <style>
    html, body {
      background: #23272a;
      color: #fff;
      font-family: 'Segoe UI', Arial, sans-serif;
      margin: 0;
      min-height: 100vh;
      width: 100vw;
      overflow-x: hidden;
      height: 100vh;
    }
    .screen { display: none; min-height: 100vh; }
    .screen.active { display: flex; }
    .splash-container {
      max-width: 450px;
      margin: 90px auto;
      padding: 28px 18px;
      background: #252a2e;
      border-radius: 18px;
      box-shadow: 0 2px 20px #000b;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .capasa-btn {
      width: 100%;
      background: #1da365;
      color: #fff;
      font-size: 2.3em;
      font-weight: bold;
      padding: 38px 0;
      border: none;
      border-radius: 20px;
      margin: 40px 0 30px 0;
      box-shadow: 0 2px 20px #1da36544;
      cursor: pointer;
      letter-spacing: 0.12em;
      transition: background 0.15s, transform 0.16s;
      text-shadow: 0 2px 18px #0008;
    }
    .capasa-btn:hover {
      background: #119355;
      transform: scale(1.04);
    }
    .cashapp-support {
      margin: 20px 0 20px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      background: #151a1d;
      border-radius: 18px;
      padding: 22px 12px 14px 12px;
      box-shadow: 0 2px 24px #00d64b33;
      width: 100%;
      max-width: 420px;
    }
    .cashapp-btn {
      display: flex;
      align-items: center;
      gap: 22px;
      background: #00d64b;
      color: #fff;
      font-size: 1.3em;
      font-weight: bold;
      border: none;
      border-radius: 12px;
      padding: 16px 30px;
      cursor: pointer;
      box-shadow: 0 2px 8px #0003;
      text-decoration: none;
      transition: background 0.18s, transform 0.15s;
    }
    .cashapp-btn:hover {
      background: #009c34;
      transform: scale(1.03);
      text-decoration: none;
      color: #fff;
    }
    .cashapp-logo {
      width: 70px;
      height: 70px;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 1px 8px #0002;
      object-fit: cover;
      border: 2px solid #fff;
    }
    .cashapp-desc {
      font-size: 1.13em;
      color: #fff8;
      margin-top: 2px;
      margin-bottom: 0;
      line-height: 1.4em;
      text-align: center;
    }
    /* Chat room layout */
    .room-bg {
      flex: 1 1 auto;
      width: 100vw;
      min-height: 100vh;
      /* Tiled logo as background */
      background: url('QuePasaLogo.png');
      background-repeat: repeat;
      background-size: 120px 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .room-flex {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      width: 100vw;
      max-width: 1100px;
      min-height: 80vh;
      justify-content: center;
      padding: 0 12px;
      gap: 28px;
    }
    .sidebox {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      flex: 0 0 220px;
      min-width: 160px;
      max-width: 260px;
      margin-top: 80px;
      gap: 36px;
    }
    .disconnect-btn {
      background: #e74c3c;
      color: #fff;
      font-size: 1.1em;
      font-weight: bold;
      border: none;
      border-radius: 16px;
      padding: 20px 32px;
      box-shadow: 0 2px 12px #c0392b33;
      cursor: pointer;
      letter-spacing: 0.08em;
      margin-top: 40px;
      margin-bottom: 0;
      transition: background 0.18s, transform 0.15s;
    }
    .disconnect-btn:hover { background: #c0392b; transform: scale(1.04);}
    .chatbox {
      flex: 1 1 360px;
      max-width: 460px;
      min-width: 260px;
      background: #23272aee;
      border-radius: 28px;
      box-shadow: 0 2px 22px #000d;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: stretch;
      padding: 58px 24px 28px 24px;
      margin-top: 44px;
      min-height: 470px;
    }
    .room-code {
      font-size: 1.15em;
      color: #1da365;
      letter-spacing: 0.17em;
      margin: 0 0 13px 0;
      font-family: 'Courier New', monospace;
      text-align: center;
      user-select: all;
    }
    .chat-history {
      background: #191f1c;
      min-height: 170px;
      max-height: 220px;
      overflow-y: auto;
      width: 100%;
      border-radius: 14px;
      padding: 10px 10px 2px 14px;
      margin-bottom: 10px;
      margin-top: 6px;
      font-size: 1.11em;
      flex: 1 1 auto;
    }
    .chat-message {
      margin: 6px 0;
      padding: 7px 13px;
      border-radius: 9px;
      background: #1da36522;
      color: #fff;
      word-break: break-word;
      max-width: 90%;
      box-shadow: 0 1px 2px #0001;
    }
    .chat-message.me {
      background: #1da365;
      color: #fff;
      font-weight: bold;
      margin-left: auto;
      text-align: right;
    }
    .chat-form-row {
      display: flex;
      gap: 8px;
      margin-bottom: 0;
      width: 100%;
      margin-top: 10px;
    }
    #chatInput {
      flex: 1;
      background: #31343a;
      color: #fff;
      border-radius: 9px;
      border: none;
      padding: 13px 12px;
      font-size: 1.11em;
    }
    .send-btn {
      background: #1da365;
      color: #fff;
      font-weight: bold;
      border: none;
      border-radius: 8px;
      padding: 11px 20px;
      font-size: 1em;
      margin-left: 3px;
      transition: background 0.14s;
      cursor: pointer;
    }
    .send-btn:hover { background: #119355; }
    #qrCanvas {
      margin: 6px auto 10px auto;
      display: block;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px #0004;
    }
    @media (max-width:900px) {
      .room-flex { flex-direction: column; align-items: center; gap: 12px;}
      .sidebox { flex-direction: row; min-width: 0; max-width: none; margin-top: 0; justify-content: center; }
      .disconnect-btn { margin-top: 18px;}
      .container, .chatbox { min-width: 0; }
    }
    @media (max-width:600px) {
      .splash-container { max-width: 98vw; padding: 4vw 1vw; }
      .chatbox { max-width: 97vw; padding: 28px 4vw 28px 4vw;}
      .cashapp-logo { width: 48px; height: 48px;}
      .room-bg { background-size: 70px 70px;}
    }
  </style>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js"></script>
</head>
<body>
  <!-- Splash Screen -->
  <div class="screen active" id="splash">
    <div class="splash-container">
      <button class="capasa-btn" id="capasaBtn">QUE PASA</button>
      <div class="cashapp-support">
        <a class="cashapp-btn" href="https://cash.app/$QuePasaAPP" target="_blank" rel="noopener">
          <img class="cashapp-logo" src="CashappQR.png" alt="Cash App Logo"/>
          Donate / Support (Cash App)
        </a>
        <div class="cashapp-desc">
          Want to support the party? Every bit helps! Thanks bro!
        </div>
      </div>
    </div>
  </div>

  <!-- Chat Room Screen -->
  <div class="screen" id="roomScreen">
    <div class="room-bg">
      <div class="room-flex">
        <!-- Left Side: Donate & Disconnect -->
        <div class="sidebox">
          <div class="cashapp-support">
            <a class="cashapp-btn" href="https://cash.app/$QuePasaAPP" target="_blank" rel="noopener">
              <img class="cashapp-logo" src="CashappQR.png" alt="Cash App Logo"/>
              Donate
            </a>
          </div>
          <button class="disconnect-btn" id="leaveRoomBtnLeft">Disconnect</button>
        </div>
        <!-- Center Chat Box -->
        <div class="chatbox">
          <canvas id="qrCanvas" width="160" height="160"></canvas>
          <div class="room-code" id="roomCodeDisplay"></div>
          <div class="chat-history" id="chatHistory"></div>
          <form id="chatForm" class="chat-form-row" autocomplete="off">
            <input id="chatInput" type="text" placeholder="Type a message..." autocomplete="off" />
            <button type="submit" class="send-btn">Send</button>
          </form>
        </div>
        <!-- Right Side: Donate & Disconnect -->
        <div class="sidebox">
          <div class="cashapp-support">
            <a class="cashapp-btn" href="https://cash.app/$QuePasaAPP" target="_blank" rel="noopener">
              <img class="cashapp-logo" src="CashappQR.png" alt="Cash App Logo"/>
              Donate
            </a>
          </div>
          <button class="disconnect-btn" id="leaveRoomBtnRight">Disconnect</button>
        </div>
      </div>
    </div>
  </div>

  <script>
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
    let myName = "Anon";
    let myRoomCode = null;
    let isHost = false;
    let chatListener = null;

    // === UI Elements ===
    const $chatHistory = document.getElementById('chatHistory');
    const $chatForm = document.getElementById('chatForm');
    const $chatInput = document.getElementById('chatInput');
    const $leaveRoomBtnLeft = document.getElementById('leaveRoomBtnLeft');
    const $leaveRoomBtnRight = document.getElementById('leaveRoomBtnRight');
    const $roomCodeDisplay = document.getElementById('roomCodeDisplay');
    const $qrCanvas = document.getElementById('qrCanvas');
    const $capasaBtn = document.getElementById('capasaBtn');

    // === Navigation/Screen logic ===
    function show(screen) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(screen).classList.add('active');
    }

    async function createRoomAndEnter() {
      // Generate random room code
      let code = "";
      let codeExists = true;
      while (codeExists) {
        code = makeRoomCode();
        const snap = await db.ref('rooms/' + code).once('value');
        codeExists = snap.exists();
      }
      myRoomCode = code;
      isHost = true;
      // Create a 2-person room in DB
      await db.ref('rooms/' + code).set({
        size: 2,
        members: {
          [myId]: { id: myId }
        },
        hostId: myId,
        chat: {}
      });
      enterRoom(code);
    }

    $capasaBtn.onclick = createRoomAndEnter;

    // Disconnect logic both sides
    const leaveRoom = async () => {
      if (myRoomCode) {
        // Remove self from members
        await db.ref(`rooms/${myRoomCode}/members/${myId}`).remove();
        // If host and last member, delete room & chat
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
        show('splash');
      }
    };
    $leaveRoomBtnLeft.onclick = leaveRoom;
    $leaveRoomBtnRight.onclick = leaveRoom;

    // === Room and Chat Logic ===

    function makeRoomCode() {
      const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 6; ++i) code += chars[Math.floor(Math.random() * chars.length)];
      return code;
    }

    // Enter Room
    function enterRoom(code) {
      // QR code
      new QRious({
        element: $qrCanvas,
        value: code,
        size: 160,
        background: '#fff',
        foreground: '#111'
      });
      $roomCodeDisplay.textContent = code.split('').join(' ');
      show('roomScreen');
      listenToChat(code);
    }

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
      div.textContent = `[${time}] Party: ${text}`;
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
  </script>
</body>
</html>
