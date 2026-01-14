const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddlware');
const { getServices, createService, deleteService } = require('../controller/GetServices');

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); 
  } else {
    res.status(403).json({ msg: 'Access denied. Not an admin.' });
  }
};

router.get('/', getServices);
router.post('/', auth, authorizeAdmin, createService);
router.delete('/:id', auth, authorizeAdmin, deleteService);

module.exports = router;