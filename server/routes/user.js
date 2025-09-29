const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddlware'); // Your auth middleware
const { getMyProfile, updateMyProfile } = require('../controller/userController');


router.get('/me', auth, getMyProfile);

router.put('/me', auth, updateMyProfile);

module.exports = router;