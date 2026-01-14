const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddlware');
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin only.' });
  }
}; 
const upload = require('../middleware/multer');
const { submitReport, getReports, updateReportStatus } = require('../controller/reportController');

// Submit a report (Authenticated users)
router.post('/', authenticateToken, upload.single('evidence'), submitReport);

// Get all reports (Admin only)
router.get('/', authenticateToken, isAdmin, getReports);

// Update report status (Admin only)
router.put('/:id', authenticateToken, isAdmin, updateReportStatus);

module.exports = router;
