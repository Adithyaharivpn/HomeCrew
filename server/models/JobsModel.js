const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  city: { type: String, required: true }, 
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'assigned', 'in_progress', 'completed','cancelled'], default: 'open' },
  proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number },
  fundsDeposited: { type: Boolean, default: false }, // Simulates Escrow
  isPaid: { type: Boolean, default: false },
  paymentId: { type: String },
  completionCode: { type: String, select: false },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
scheduledDate: {
    type: Date,
    default: null
  },
});

module.exports = mongoose.model('Job', JobSchema);