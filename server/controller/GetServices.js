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

const createService = async (req, res) => {
  try {
    const { service_name, description, keywords } = req.body;
    const newService = new Services({ service_name, description, keywords });
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    logger.error('Error creating service:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteService = async (req, res) => {
  try {
    await Services.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Service deleted' });
  } catch (error) {
    logger.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getServices, createService, deleteService };