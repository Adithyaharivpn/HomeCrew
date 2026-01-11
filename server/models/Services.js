const mongoose = require('mongoose');


const serviceSchema = new mongoose.Schema({
  service_name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String], 
    required: true,
  }
});


module.exports = mongoose.model('Service', serviceSchema);