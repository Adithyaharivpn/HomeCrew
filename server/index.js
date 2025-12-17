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
const chatRoutes = require('./routes/chat')
const Message = require('./models/Message');
const ChatRoom = require('./models/ChatRoom');     
const Notification = require('./models/Notification');
const appointmentRoutes = require('./routes/appointment');
const reviewRoutes = require('./routes/review');
const notficationRoutes = require('./routes/notification');

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


app.set('io', io); 

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobs);
app.use('/api/service', services);
app.use('/api/admin', admin); 
app.use('/api/users', user);  
app.use('/api/chat', chatRoutes)
app.use('/api/appointments',appointmentRoutes );
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications',notficationRoutes);


app.get('/', (req, res) => {
  res.send('College Project API Server - Running!');
});

io.on('connection', (socket) => {
  
  socket.on('addUser', (userId) => {
    if (userId) {
        socket.join(userId); 
        console.log(`User ${userId} joined notification room`);
    }
  });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const newMessage = new Message({
        roomId: data.roomId,
        sender: data.sender._id || data.sender, 
        text: data.text,
        type: data.type || 'text',
        appointmentId: data.appointmentId || null,
        appointmentDate: data.appointmentDate || null
      });

      const savedMessage = await newMessage.save();
      await savedMessage.populate('sender', 'name profilePictureUrl');

      
      io.to(data.roomId).emit('receiveMessage', savedMessage);

      const room = await ChatRoom.findById(data.roomId);
      if (room) {
          const senderId = data.sender._id || data.sender;
          
          const receiverId = room.customerId.toString() === senderId.toString()
            ? room.tradespersonId 
            : room.customerId;

          const notif = await Notification.create({
            recipient: receiverId,
            sender: senderId,
            message: `New message: ${data.text.substring(0, 30)}...`,
            link: `/chat/${data.roomId}`
          });

          console.log(`Sending notification to room: ${receiverId}`);
          io.to(receiverId.toString()).emit("receiveNotification", notif);
      }
      
    } catch (error) {
      console.error("Error saving message/notification:", error);
    }
});
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});