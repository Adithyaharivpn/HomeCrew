const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Job = require('../models/JobsModel'); 
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification'); 


router.post('/initiate', async (req, res) => {
  const { jobId, customerId, tradespersonId } = req.body; 

  try {
    const job = await Job.findById(jobId);
    if (job.status === 'assigned' && job.assignedTo.toString() !== tradespersonId) {
      return res.status(403).json({ message: "Job is closed." });
    }
    
    let room = await ChatRoom.findOne({ jobId, tradespersonId });
    
    if (!room) {
      room = new ChatRoom({ jobId, customerId, tradespersonId });
      await room.save();


      const notif = await Notification.create({
        recipient: customerId, 
        sender: tradespersonId,
        message: `New Proposal received for your job: "${job.title}"`,
        link: `/my-job-proposals/${jobId}` 
      });


      const io = req.app.get('io');
      if (io) {
          io.to(customerId.toString()).emit("receiveNotification", notif);
      }
    }
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// GET MESSAGES 
router.get('/messages/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'name profilePictureUrl email');
    res.json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
});

//  GET ROOMS 
router.get('/job/:jobId', async (req, res) => {
  try {
    const rooms = await ChatRoom.find({ jobId: req.params.jobId })
      .populate('tradespersonId', 'name profilePictureUrl')
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (error) {
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

    const secretCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Appointment.findByIdAndUpdate(appointmentId, { status: 'confirmed' });

    await ChatRoom.updateMany(
      { jobId: jobId, tradespersonId: { $ne: tradespersonId } }, 
      { $set: { isArchived: true } }
    );

    await Job.findByIdAndUpdate(jobId, { 
      status: 'assigned', 
      assignedTo: tradespersonId,
      completionCode: secretCode 
    });

    const sysMsg = new Message({
      roomId: room._id,
      sender: tradespersonId, 
      text: "System: Job Confirmed. This chat is now the official channel.",
      type: "system"
    });
    await sysMsg.save();


    const notif = await Notification.create({
      recipient: tradespersonId,
      message: `Congratulations! Your appointment has been confirmed. Check "My Works".`,
      link: `/my-works` 
    });


    const io = req.app.get('io');
    if (io) {
        io.to(tradespersonId.toString()).emit("receiveNotification", notif);
        io.to(room._id.toString()).emit("receiveMessage", sysMsg);
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

module.exports = router;