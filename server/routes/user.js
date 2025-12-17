const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddlware'); // Your auth middleware
const { getMyProfile, updateMyProfile,getUserById } = require('../controller/userController');
const upload = require('../middleware/multer');

router.get('/me', auth, getMyProfile);

router.put('/me', auth,upload.single('profilePicture'), updateMyProfile);

router.get('/:id', auth, getUserById);

module.exports = router;