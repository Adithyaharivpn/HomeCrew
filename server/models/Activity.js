const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['job_posted', 'job_assigned', 'payment_received', 'verification_submitted'] 
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });