const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const logger = require('../utils/logger'); 

router.post('/', async (req, res) => {
  try {
    const { roomId, providerId, date, price, status } = req.body;
    
    const newAppointment = new Appointment({
      roomId,
      providerId,
      date,
      price,
      status
    });

    const savedAppointment = await newAppointment.save();
    logger.info(`New appointment created: ${date} for Provider ${providerId}`, { 
        meta: { type: 'appointment_create', roomId } 
    });

    res.status(201).json(savedAppointment);
  } catch (err) {
    logger.error(`Error creating appointment: ${err.message}`);
    res.status(500).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { status: req.body.status } 
      },
      { new: true } 
    );
    
    logger.info(`Appointment ${req.params.id} updated to status: ${req.body.status}`);

    res.status(200).json(updatedAppointment);
  } catch (err) {
    logger.error(`Error updating appointment: ${err.message}`);
    res.status(500).json(err);
  }
});

module.exports = router;