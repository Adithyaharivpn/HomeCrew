const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddlware'); 
const { 
    getDashboardStats, 
    getAllUsers, 
    deactivateUser, 
    updateUser, 
    reactivateUser, 
    getAllJobs,
    deleteJob,
    getSystemLogs, 
    getTradespeopleList,
    changeVerificationStatus
} = require('../controller/admincontroller'); 


const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); 
  } else {
    res.status(403).json({ msg: 'Access denied. Not an admin.' });
  }
};


// Dashboard Stats
router.get('/dashboard', auth, authorizeAdmin, getDashboardStats);

// Logs
router.get('/logs', auth, authorizeAdmin, getSystemLogs);

// User Management
router.get('/users', auth, authorizeAdmin, getAllUsers);
router.delete('/users/:id', auth, authorizeAdmin, deactivateUser);
router.put('/users/:id', auth, authorizeAdmin, updateUser);
router.patch('/users/:id/reactivate', auth, authorizeAdmin, reactivateUser);

// Tradespeople Management
router.get('/tradespeople', auth, authorizeAdmin, getTradespeopleList);
router.put('/verify', auth, authorizeAdmin, changeVerificationStatus);

//job management
router.get('/jobs', auth, authorizeAdmin, getAllJobs);
router.delete('/jobs/:id', auth, authorizeAdmin, deleteJob);

module.exports = router;