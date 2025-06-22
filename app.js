// ==== Firebase config (REPLACE with your actual credentials) ====
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const room = "testroom1"; // You can change this to any room name you want

// Listen for new messages
const chatBox = document.getElementById('chatBox');
db.ref('rooms/' + room + '/messages').on('child_added', snap => {
  const msg = snap.val();
  const div = document.createElement('div');
  div.textContent = `${msg.from}: ${msg.text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Send message
function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  db.ref('rooms/' + room + '/messages').push({
    from: "You",
    text: text,
    timestamp: Date.now()
  });
  input.value = "";
}

document.getElementById('sendBtn').onclick = sendMessage;

// Enter = send (Shift+Enter = newline)
document.getElementById('chatInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
