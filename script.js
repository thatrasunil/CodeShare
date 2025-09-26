// ====== Replace this config with your Firebase project config ======
// const firebaseConfig = {
//   apiKey: "<YOUR_API_KEY>",
//   authDomain: "<YOUR_AUTH_DOMAIN>",
//   databaseURL: "<YOUR_DATABASE_URL>", // important for Realtime Database
//   projectId: "<YOUR_PROJECT_ID>",
//   appId: "<YOUR_APP_ID>"
// };
// ==================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase, ref, set, onValue, onDisconnect, get, update, push
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

    // ELEMENTS
    const htmlEditor = document.getElementById('htmlEditor');
    const cssEditor = document.getElementById('cssEditor');
    const jsEditor = document.getElementById('jsEditor');
    const preview = document.getElementById('preview');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinBtn = document.getElementById('joinBtn');
    const roomInput = document.getElementById('roomInput');
    const statusEl = document.getElementById('status');
    const roomLabel = document.getElementById('roomLabel');
    const usersCount = document.getElementById('usersCount');
    const runBtn = document.getElementById('runBtn');
    const shareBtn = document.getElementById('shareBtn');

    // Chat elements
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessage');
    const toggleChatBtn = document.getElementById('toggleChat');
    const chatPane = document.querySelector('.chat-pane');
    const chatUsers = document.getElementById('chatUsers');
    const userStatus = document.getElementById('userStatus');

    // Chat state
    let messages = [];
    let isChatOpen = true;

    // Add emoji function
    window.addEmoji = function(emoji) {
      const input = messageInput;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const textBefore = input.value.substring(0, start);
      const textAfter = input.value.substring(end);
      input.value = textBefore + emoji + textAfter;
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    };

    // Format message
    function formatMessage(message) {
      const time = new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const userName = message.userId.substring(0, 6); // Temp user name from sessionId
      return `<div class="message">
        <span class="user-name">${userName}:</span>
        <span class="message-text">${message.message}</span>
        <span class="message-time">${time}</span>
      </div>`;
    }

    // Add message to UI
    function addMessageToUI(message) {
      messages.push(message);
      chatMessages.innerHTML += formatMessage(message);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message
    function sendMessage() {
      const messageText = messageInput.value.trim();
      if (!messageText || !currentRoom) return;

      const message = {
        userId: mySessionId,
        message: messageText,
        timestamp: Date.now()
      };

      // Send to Firebase
      const messagesRef = ref(db, `rooms/${currentRoom}/messages`);
      push(messagesRef, message);

      messageInput.value = '';
    }

    // Toggle chat
    function toggleChat() {
      isChatOpen = !isChatOpen;
      chatPane.style.display = isChatOpen ? 'flex' : 'none';
      toggleChatBtn.textContent = isChatOpen ? '−' : '+';
    }

// STATE
let currentRoom = null;
let mySessionId = generateId(10);
let listeners = [];

// UTILS
function generateId(n = 6) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i=0;i<n;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

// Debounce helper to reduce writes
function debounce(fn, wait=300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(()=>fn(...args), wait);
  }
}

// Compose preview HTML
function composePreview(html, css, js) {
  return `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <style>${css || ''}</style>
    </head>
    <body>
      ${html || ''}
      <script>
        try {
          ${js || ''}
        } catch (e) {
          document.body.insertAdjacentHTML('beforeend', '<pre style="color:red">'+String(e)+'</pre>');
        }
      </script>
    </body>
    </html>
  `;
}

// Write room content to DB (debounced)
const writeRoom = debounce(async (roomId, patch) => {
  if (!roomId) return;
  const roomRef = ref(db, `rooms/${roomId}`);
  try {
    await update(roomRef, { ...patch, lastUpdated: Date.now() });
  } catch(e) {
    console.error('Write failed', e);
  }
}, 300);

    // Subscribe to room realtime updates
    function subscribeToRoom(roomId) {
      clearListeners();
      currentRoom = roomId;
      roomLabel.textContent = `Room: ${roomId}`;
      statusEl.textContent = 'Connected';
      const roomRef = ref(db, `rooms/${roomId}`);

      // Listen for the room object
      const unsubscribeRoom = onValue(roomRef, snapshot => {
        const data = snapshot.val() || {};
        // populate editors only if remote is different
        if (data.html !== undefined && htmlEditor.value !== data.html) htmlEditor.value = data.html;
        if (data.css !== undefined && cssEditor.value !== data.css) cssEditor.value = data.css;
        if (data.js !== undefined && jsEditor.value !== data.js) jsEditor.value = data.js;
        // update preview automatically
        preview.srcdoc = composePreview(data.html||'', data.css||'', data.js||'');
      });
      listeners.push(unsubscribeRoom);

      // Presence tracking: add session id into /rooms/<roomId>/users/<sessionId> = true
      const userRef = ref(db, `rooms/${roomId}/users/${mySessionId}`);
      set(userRef, true);
      onDisconnect(userRef).remove(); // remove on disconnect

      // watch users count
      const usersRef = ref(db, `rooms/${roomId}/users`);
      const unsubscribeUsers = onValue(usersRef, snap=>{
        const u = snap.val() || {};
        const count = Object.keys(u).length;
        usersCount.textContent = `Users: ${count}`;
        chatUsers.textContent = `(${count} online)`;
      });
      listeners.push(unsubscribeUsers);

      // Chat messages listener
      const messagesRef = ref(db, `rooms/${roomId}/messages`);
      const unsubscribeMessages = onValue(messagesRef, (snap) => {
        const data = snap.val();
        if (data) {
          messages = Object.values(data);
          chatMessages.innerHTML = messages.map(formatMessage).join('');
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      });
      listeners.push(unsubscribeMessages);

      // Load existing messages
      get(messagesRef).then((snap) => {
        const data = snap.val();
        if (data) {
          messages = Object.values(data);
          chatMessages.innerHTML = messages.map(formatMessage).join('');
        }
      });
    }

function clearListeners() {
  // There is no explicit off for onValue in modular 'onValue' returns a function? In this code: onValue returns unsubscribe function.
  // We stored unsubscribe functions; call them.
  listeners.forEach(unsub => {
    try { unsub(); } catch(e){ }
  });
  listeners = [];
  usersCount.textContent = '';
  roomLabel.textContent = '';
  statusEl.textContent = 'Not connected';
  currentRoom = null;
}

// UI actions
createRoomBtn.addEventListener('click', async ()=>{
  const roomId = generateId(6);
  // initialize room with default content
  const roomRef = ref(db, `rooms/${roomId}`);
  await set(roomRef, {
    createdAt: Date.now(),
    ownerId: null,
    html: '<h1>Hello from CodeShare</h1>',
    css: 'body { font-family: system-ui; padding:16px }',
    js: "console.log('Welcome')",
    lastUpdated: Date.now()
  });
  const link = `${location.origin}${location.pathname}#${roomId}`;
  roomInput.value = link;
  subscribeToRoom(roomId);
  // push shallow history state
  history.replaceState(null, '', `#${roomId}`);
});

joinBtn.addEventListener('click', ()=>{
  let input = roomInput.value.trim();
  if (!input) return alert('Enter a room id or link');
  // if full URL or hash, extract last part after slash or hash
  try {
    const u = new URL(input, location.origin);
    if (u.hash) input = u.hash.replace('#','');
    else {
      // path: /room/<id> maybe
      const parts = u.pathname.split('/').filter(Boolean);
      input = parts[parts.length-1] || input;
    }
  } catch(e){
    // not a URL -> treat as id
  }
  subscribeToRoom(input);
  history.replaceState(null, '', `#${input}`);
});

// If url contains hash, auto-join
if (location.hash) {
  const maybe = location.hash.replace('#','');
  roomInput.value = maybe;
  // auto-join for convenience
  subscribeToRoom(maybe);
}

// When user types, write to DB (debounced)
htmlEditor.addEventListener('input', ()=> {
  if (!currentRoom) return;
  writeRoom(currentRoom, { html: htmlEditor.value });
});
cssEditor.addEventListener('input', ()=> {
  if (!currentRoom) return;
  writeRoom(currentRoom, { css: cssEditor.value });
});
jsEditor.addEventListener('input', ()=> {
  if (!currentRoom) return;
  writeRoom(currentRoom, { js: jsEditor.value });
});

// Run preview (also fires automatically when DB updates)
runBtn.addEventListener('click', ()=>{
  preview.srcdoc = composePreview(htmlEditor.value, cssEditor.value, jsEditor.value);
});

// Share link
shareBtn.addEventListener('click', ()=>{
  if (!currentRoom) return alert('Join or create a room first');
  const link = `${location.origin}${location.pathname}#${currentRoom}`;
  navigator.clipboard.writeText(link).then(()=> alert('Link copied to clipboard'));
});
