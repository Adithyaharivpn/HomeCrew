const Services = require('../models/Services'); // Assuming you have a Service model

const getServices = async (req, res) => {
  try {
    const services = await Services.find({});
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getServices };