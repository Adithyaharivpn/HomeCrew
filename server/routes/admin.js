const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddlware'); // Your auth middleware
const User = require('../models/User'); // Assuming your User model
const Job = require('../models/JobsModel');   // Assuming your Job model

// Middleware to ensure only admins can access these routes
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); 
  } else {
    res.status(403).json({ msg: 'Access denied. Not an admin.' });
  }
};


router.get('/dashboard', auth, authorizeAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTradespeople = await User.countDocuments({ role: 'tradesperson' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalJobs = await Job.countDocuments();
    // You can add more complex queries here, e.g., recent jobs, new users

    res.json({
      totalUsers,
      totalTradespeople,
      totalCustomers,
      totalJobs,
      recentActivity: [] 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;