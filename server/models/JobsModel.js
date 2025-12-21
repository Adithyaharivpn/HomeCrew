const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'completed'],
    default: 'open',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null
  },
completionCode: { 
    type: String, 
    select: false,
    default: function() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
  },

  isCompleted: { type: Boolean, default: false },

}, {
  timestamps: true 
});

module.exports = mongoose.model('Job', jobSchema);