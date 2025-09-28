const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "https://codeconnect-zeta-pied.vercel.app"], // Frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "https://codeconnect-zeta-pied.vercel.app"], // allow frontend
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());
// app.use(express.static('../frontend/build')); // Serve React build later - commented for separate deployment

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeconnect');
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Server will start without DB - features limited to in-memory only.');
  }
}

// Call connectDB before starting server
connectDB();

// Room Schema
const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true },
  code: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  messages: [{
    userId: String,
    content: String,
    type: { type: String, enum: ['text', 'voice', 'file'], default: 'text' },
    fileUrl: String,
    duration: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  users: [{ userId: String, joinedAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now }
});

const Room = mongoose.model('Room', roomSchema);

// Track active users per room (in-memory for real-time)
const activeRooms = new Map(); // roomId -> Set of userIds (socket.ids)

// Generate unique room ID
function generateRoomId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join Room
  socket.on('join-room', async (roomId, userId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Initialize active users set for room if not exists
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    activeRooms.get(roomId).add(userId);

    // Check if room exists, create if not
    let room = await Room.findOne({ roomId });
    if (!room) {
      room = new Room({ roomId });
      await room.save();
    }

    // Add user to persistent room users
    if (!room.users.find(u => u.userId === userId)) {
      room.users.push({ userId });
      await room.save();
    }

    const activeCount = activeRooms.get(roomId).size;
    const activeParticipants = Array.from(activeRooms.get(roomId));

    // Send room data to user including messages and active participants
    socket.emit('room-joined', { 
      roomId, 
      code: room.code, 
      language: room.language,
      messages: room.messages || [],
      participants: activeParticipants,
      users: activeCount 
    });

    // Notify others about new user
    socket.to(roomId).emit('user-joined', userId);
    // Broadcast updated count to all in room
    io.to(roomId).emit('user-count', activeCount);
  });

  // End Room
  socket.on('end-room', async (roomId, userId) => {
    console.log(`User ${userId} ended room ${roomId}`);

    // Clear room data
    await Room.updateOne({ roomId }, { 
      code: '', 
      language: 'javascript',
      messages: [],
      endedAt: new Date()
    });

    // Notify all users in room
    io.to(roomId).emit('room-ended', { roomId, message: 'Room has been ended by a participant.' });

    // Clean up active users
    if (activeRooms.has(roomId)) {
      activeRooms.delete(roomId);
    }
  });

  // Code Change
  socket.on('code-change', async (data) => {
    const { roomId, code, language } = data;
    await Room.updateOne({ roomId }, { code, language });
    socket.to(roomId).emit('code-update', { code, language });
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { roomId, userId, isTyping } = data;
    socket.to(roomId).emit('user-typing', { userId, isTyping });
  });

  // Chat Message
  socket.on('send-message', async (data) => {
    const { roomId, id, content, userId, type = 'text', fileUrl, duration } = data;
    const newMessage = { id, userId, content, type, fileUrl, duration, timestamp: new Date() };

    // Save to DB
    await Room.updateOne(
      { roomId },
      { $push: { messages: newMessage } }
    );

    // Broadcast to all including sender
    io.to(roomId).emit('new-message', newMessage);
  });

  // Cursor Update
  socket.on('cursor-update', (data) => {
    const { roomId, userId, line, column } = data;
    socket.to(roomId).emit('cursor-update', { userId, line, column });
  });

  // Cursor Leave
  socket.on('cursor-leave', (userId) => {
    // Find which room the user is in and broadcast cursor-leave
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('cursor-leave', userId);
      }
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from all rooms the socket was in
    for (const roomId of socket.rooms) {
      if (activeRooms.has(roomId) && roomId !== socket.id) { // Ignore the default room
        activeRooms.get(roomId).delete(socket.id);
        const newCount = activeRooms.get(roomId).size;
        
        // Broadcast updated count to remaining users in room
        io.to(roomId).emit('user-count', newCount);
        
        // Emit user-left to remaining users
        socket.to(roomId).emit('user-left', socket.id);
        
        // Clean up empty rooms
        if (newCount === 0) {
          activeRooms.delete(roomId);
        }
      }
    }
  });
});

// API Routes
app.post('/api/create-room', async (req, res) => {
  const roomId = generateRoomId();
  const room = new Room({ roomId });
  await room.save();
  res.json({ roomId });
});

app.get('/api/room/:roomId', async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId });
  if (room) {
    res.json(room);
  } else {
    res.json({ code: '', language: 'javascript', messages: [] });
  }
});

app.post('/api/upload-file', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
