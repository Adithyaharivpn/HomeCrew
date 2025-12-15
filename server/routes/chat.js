const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Job = require('../models/JobsModel'); 
const Appointment = require('../models/Appointment');


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
    }
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});


router.get('/messages/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'name profilePictureUrl email');
    res.json(messages);
  } catch (error) {
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

    await Job.findByIdAndUpdate(jobId, { 
      status: 'assigned', 
      assignedTo: tradespersonId 
    });

    await ChatRoom.updateMany(
      { jobId: jobId, tradespersonId: { $ne: tradespersonId } }, 
      { $set: { isArchived: true } }
    );

 
    const sysMsg = new Message({
      roomId: room._id,
      sender: tradespersonId, 
      text: "System: Job Confirmed. This chat is now the official channel.",
      type: "system"
    });
    await sysMsg.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

module.exports = router;