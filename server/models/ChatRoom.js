const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tradespersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

chatRoomSchema.index({ jobId: 1, tradespersonId: 1 }, { unique: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);