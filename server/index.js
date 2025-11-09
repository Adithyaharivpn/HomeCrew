const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
require('./database')
const http = require('http');
const { Server } = require("socket.io");

const authRoutes = require('./routes/auth');
const jobs = require('./routes/jobs');
const services = require('./routes/service');
const admin = require('./routes/admin');
const user = require('./routes/user');  

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);

//cors
const allowedOrigins = ['https://college-project-git-feature-jobpage-adithyaharivpns-projects.vercel.app', 'http://localhost:3000' ,'http://localhost:5173']; // frontend URLs here

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobs);
app.use('/api/service', services);
app.use('/api/admin', admin); // Admin routes
app.use('/api/users', user);  // User profile routes

app.get('/', (req, res) => {
  res.send('College Project API Server - Running!');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', (data) => {
    // Broadcast to others in the room
    socket.to(data.roomId).emit('receiveMessage', data);
    // You would also save the message to the DB here
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  

});