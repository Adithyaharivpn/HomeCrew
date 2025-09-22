const mongoose = require("mongoose");
const Userschema = new mongoose.Schema({
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
      // only one user per email
  },
  role: {
    type: String,
    enum: ["customer", "tradesperson"],
    required: true,
  },
  tradeCategory: {
    type: String,
    default: null, // only one user per email
  },
  experience: {
    type: String,
    type: Number,
    default: null //
  },
  location: {
    type: String,
    default: null 
  },
  createdat: {
    type: Date,
    required: true,
    default: Date.now
  },
});


const User =mongoose.model('User',Userschema)
module.exports=User;


