const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddlware'); 
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const Notification = require('../models/Notification');


router.get('/:roomId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'name profilePictureUrl') // Helpful to show avatars
      .sort({ createdAt: 'asc' }); 

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { roomId, text } = req.body;
  const senderId = req.user.id; 

  try {
    const newMessage = new Message({ 
        roomId, 
        sender: senderId, 
        text 
    });
    await newMessage.save();
    await newMessage.populate('sender', 'name profilePictureUrl');
    const room = await ChatRoom.findById(roomId);
    const receiverId = room.customerId.toString() === senderId 
        ? room.tradespersonId 
        : room.customerId;


    const notif = await Notification.create({
        recipient: receiverId,
        sender: senderId,
        message: `New message: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`, 
        link: `/chat/${roomId}`
    });

    const io = req.app.get('io');
    
    if (io) {
        io.to(roomId).emit("receiveMessage", newMessage);
        io.to(receiverId.toString()).emit("receiveNotification", notif);
    }

    res.json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;