const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');


router.post('/', async (req, res) => {
  try {
    const { roomId, providerId, date, status } = req.body;
    
    const newAppointment = new Appointment({
      roomId,
      providerId,
      date,
      status
    });

    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (err) {
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
    res.status(200).json(updatedAppointment);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;