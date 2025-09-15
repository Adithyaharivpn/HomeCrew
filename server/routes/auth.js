const express = require('express');
const router = express.Router();

// Define your routes
router.get('/', (req, res) => {
  res.send('This is the job route!');
});


module.exports = router;