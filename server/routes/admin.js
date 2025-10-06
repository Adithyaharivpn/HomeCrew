const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddlware'); // Your auth middleware
const User = require('../models/User'); // Assuming your User model
const Job = require('../models/JobsModel');   // Assuming your Job model
const { updateUser, reactivateUser } = require('../controller/admincontroller');

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

    res.json({
      totalUsers,
      totalTradespeople,
      totalCustomers,
      totalJobs,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/users', auth, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/users/:id', auth, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ msg: 'User has been deactivated' });
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/users/:id', auth, authorizeAdmin, updateUser);

router.patch('/users/:id/reactivate', auth, authorizeAdmin, reactivateUser);


module.exports = router;