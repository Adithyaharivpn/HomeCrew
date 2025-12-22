const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddlware');
const logger = require('../utils/logger'); 


router.get('/', auth, async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20); 
    res.json(notifs);
  } catch (err) {
    logger.error(`Error fetching notifications for User ${req.user.id}: ${err.message}`);
    res.status(500).json(err);
  }
});


router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    logger.error(`Error reading notification: ${err.message}`);
    res.status(500).json(err);
  }
});

module.exports = router;