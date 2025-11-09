const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  // An array containing the ObjectId of the two users in the chat
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);