const Services = require('../models/Services');
const logger = require('../utils/logger'); 

const getServices = async (req, res) => {
  try {
    const services = await Services.find({});
    res.status(200).json(services);
  } catch (error) {
    logger.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getServices };