const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "tradesperson", "admin"],
    required: true,
  },
  profilePictureUrl: {
    type: String,
    default: '',
  },

  tradeCategory: {
    type: String,
  },
  experience: {
   
    type: Number, 
  },
  location: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPaid: {
        type: Boolean,
        default: false
    },
    paymentId: {
        type: String ,
    }
}, { 
  
  timestamps: true 
});

const User = mongoose.model('User', userSchema);
module.exports = User;