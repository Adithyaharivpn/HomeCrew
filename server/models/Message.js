// Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ChatRoom', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  text: { type: String },
  type: { 
    type: String, 
    enum: ['text', 'appointment', 'system'], 
    default: 'text' 
  },
  price: { type: Number }, 
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment' 
  },
  appointmentDate: { type: Date },
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true }); 

module.exports = mongoose.model('Message', messageSchema);