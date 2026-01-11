const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddlware');
const { getMyProfile, updateMyProfile,getUserById,requestVerification, getTradespeoplePublic } = require('../controller/userController');
const upload = require('../middleware/multer');

router.get('/me', auth, getMyProfile);

router.put('/me', auth,upload.single('profilePicture'), updateMyProfile);

router.post('/request-verification', auth, upload.array('documents', 3), requestVerification);

router.get('/public/tradespeople', getTradespeoplePublic);

router.get('/:id', auth, getUserById);



module.exports = router;