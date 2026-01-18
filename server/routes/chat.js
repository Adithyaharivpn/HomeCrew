const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Job = require('../models/JobsModel'); 
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification'); 
const logger = require('../utils/logger'); 
const authMiddleware = require('../middleware/authMiddlware');


router.post('/initiate', authMiddleware, async (req, res) => {
  const { jobId, customerId, tradespersonId } = req.body; 

  try {
    // Enforce Verification Check
    if (req.user.role === 'tradesperson' && !req.user.isVerified) {
        logger.warn(`Chat init blocked: User ${req.user.id} not verified.`);
        return res.status(403).json({ message: "Verification required to start chats." });
    }

    const job = await Job.findById(jobId);
    if (job.status === 'assigned' && job.assignedTo.toString() !== tradespersonId) {
      logger.warn(`Chat init blocked: Job ${jobId} is closed. User: ${tradespersonId}`);
      return res.status(403).json({ message: "Job is closed." });
    }

    if (job.status === 'completed' || job.status === 'cancelled') {
        logger.warn(`Chat init blocked: Job ${jobId} is ${job.status}`);
        return res.status(403).json({ message: "Job is closed. Chat disabled." });
    }
    
    let room = await ChatRoom.findOne({ jobId, tradespersonId });
    
    if (!room) {
      room = new ChatRoom({ jobId, customerId, tradespersonId });
      await room.save();

      const notif = await Notification.create({
        recipient: customerId, 
        sender: tradespersonId,
        message: `New Proposal received for your job: "${job.title}"`,
        link: `/dashboard/my-job-proposals/${jobId}` 
      });
      logger.info(`New Chat Proposal initiated for Job ${jobId} by Tradesperson ${tradespersonId}`, {
         meta: { type: 'chat_proposal', customerId }
      });

      const io = req.app.get('io');
      if (io) {
          io.to(customerId.toString()).emit("receiveNotification", notif);
      }
    }
    res.json(room);
  } catch (error) {
    logger.error(`Error initiating chat: ${error.message}`);
    res.status(500).json(error);
  }
});

 
// Unread message count for current user
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // find chat rooms where the user is a participant
    const rooms = await ChatRoom.find({
      $or: [ { customerId: userId }, { tradespersonId: userId } ]
    }).select('_id');

    const roomIds = rooms.map(r => r._id);

    const count = await Message.countDocuments({
      roomId: { $in: roomIds },
      sender: { $ne: userId },
      seenBy: { $ne: userId }
    });

    res.json({ count });
  } catch (error) {
    logger.error(`Error fetching unread count: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/messages/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'name profilePictureUrl email')
      .populate('appointmentId');
    res.json(messages);
  } catch (error) {
    logger.error(`Error fetching messages for room ${req.params.roomId}: ${error.message}`);
    res.status(500).json(error);
  }
});


router.get('/job/:jobId', async (req, res) => {
  try {
    const rooms = await ChatRoom.find({ jobId: req.params.jobId })
      .populate('tradespersonId', 'name profilePictureUrl')
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (error) {
    logger.error(`Error fetching chat rooms for job ${req.params.jobId}: ${error.message}`);
    res.status(500).json(error);
  }
});


router.get('/:roomId', async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    logger.error(`Error fetching room details: ${error.message}`);
    res.status(500).json(error);
  }
});


router.post('/confirm-appointment', async (req, res) => {
  const { appointmentId, tradespersonId } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const room = await ChatRoom.findById(appointment.roomId);
    if (!room) return res.status(404).json({ message: "Chat Room not found" });

    const jobId = room.jobId; 

    await Appointment.findByIdAndUpdate(appointmentId, { status: 'confirmed' });

    await ChatRoom.updateMany(
      { jobId: jobId, tradespersonId: { $ne: tradespersonId } }, 
      { $set: { isArchived: true } }
    );
    
    await Job.findByIdAndUpdate(jobId, { 
      status: 'assigned', 
      assignedTo: tradespersonId,
      price: appointment.price 
    });


    const sysMsg = new Message({
      roomId: room._id,
      sender: tradespersonId, 
      text: `System: Appointment Confirmed for ₹${appointment.price}.`,
      type: "system"
    });
    await sysMsg.save();


    const io = req.app.get('io');
    if (io) io.to(room._id.toString()).emit("receiveMessage", sysMsg);

    res.json({ success: true });
  } catch (error) {
    logger.error(`Error confirming appointment: ${error.message}`);
    res.status(500).json(error);
  }
});


module.exports = router;
