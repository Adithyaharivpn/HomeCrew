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
  // These fields are only for tradespeople
  tradeCategory: {
    type: String,
  },
  experience: {
   
    type: Number, 
  },
  location: {
    type: String,
  },
}, { 
  
  timestamps: true 
});

const User = mongoose.model('User', userSchema);
module.exports = User;