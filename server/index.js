const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
require('./database');
const http = require('http');
const { Server } = require("socket.io");

const logger = require('./utils/logger'); 

const authRoutes = require('./routes/auth');
const jobs = require('./routes/jobs');
const services = require('./routes/service');
const admin = require('./routes/admin');
const user = require('./routes/user'); 
const chatRoutes = require('./routes/chat');
const dashboardRoutes = require('./routes/dashboard');
const Message = require('./models/Message');
const ChatRoom = require('./models/ChatRoom');     
const Notification = require('./models/Notification');
const appointmentRoutes = require('./routes/appointment');
const reviewRoutes = require('./routes/review');
const notficationRoutes = require('./routes/notification');
const paymentRoutes = require('./routes/payment');
const transactionRoutes = require('./routes/transaction');

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);

// Cors
const allowedOrigins = ['https://college-project-git-feature-jobpage-adithyaharivpns-projects.vercel.app', 'http://localhost:3000' ,'http://localhost:5173' , 'https://college-project-git-shadcn-version-adithyaharivpns-projects.vercel.app' ]; 

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
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notficationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.send('College Project API Server - Running!');
});

io.on('connection', (socket) => {
  
  logger.info(`New Socket Connected: ${socket.id}`);
  
  socket.on('addUser', (userId) => {
    if (userId) {
        socket.join(userId); 
        logger.info(`User ${userId} joined notification room`, { meta: { userId, event: 'socket_join' } });
    }
  });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    logger.info(`Socket ${socket.id} joined chat room ${roomId}`);
  });

  socket.on('sendMessage', async (data) => {
  
    logger.info(` Socket Message Received for Room: ${data.roomId}`);

    try {
      const realSenderId = data.senderId || (data.sender && data.sender._id) || data.sender;

      if (!realSenderId) {
          logger.error(`❌ Socket Error: Sender ID is missing in data packet`);
          return;
      }

      const msgPayload = {
        roomId: data.roomId,
        sender: realSenderId, 
        text: data.text,
        type: data.type || 'text',
      };

      if (data.price) msgPayload.price = Number(data.price);
      if (data.appointmentId) msgPayload.appointmentId = data.appointmentId;
      if (data.appointmentDate) msgPayload.appointmentDate = data.appointmentDate;

      const newMessage = new Message(msgPayload);
      const savedMessage = await newMessage.save();
      
      
      logger.info(` Message Saved to DB: ${savedMessage._id}`); 

      await savedMessage.populate('sender', 'name profilePictureUrl');
      io.to(data.roomId).emit('receiveMessage', savedMessage);

      const room = await ChatRoom.findById(data.roomId);
      if (room) {
          const receiverId = room.customerId.toString() === realSenderId.toString()
            ? room.tradespersonId 
            : room.customerId;

          const notif = await Notification.create({
            recipient: receiverId,
            sender: realSenderId,
            message: `New message: ${data.text.substring(0, 30)}...`,
            link: `/chat/${data.roomId}`
          });
          
          logger.info(`🔔 Notification sent to user ${receiverId}`);
          io.to(receiverId.toString()).emit("receiveNotification", notif);
      }
      
    } catch (error) {
  
      logger.error(` Socket Database Error: ${error.message}`);
    }
  });

  socket.on('disconnect', () => {

      logger.info(`Socket Disconnected: ${socket.id}`);
  });

});

server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});