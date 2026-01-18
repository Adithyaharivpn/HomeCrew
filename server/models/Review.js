const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  
  visibility: { 
    type: String, 
    enum: ['public', 'internal'], 
    default: 'public' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);