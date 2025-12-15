const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddlware'); // Your auth middleware
const Message = require('../models/Message');


router.get('/:roomId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: 'asc' }); 

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;