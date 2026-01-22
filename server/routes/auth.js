const express = require('express');
const router = express.Router();

const { signup , login, getMe, checkUserUnique } = require('../controller/authcontroller'); 
const { SignupvalidateRules, validate } = require('../middleware/validate');
const upload = require('../middleware/multer');
const auth = require('../middleware/authMiddlware');

router.post('/signup',  upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'documents', maxCount: 3 } ]), SignupvalidateRules(), validate,signup);
router.post('/check-unique', checkUserUnique);
router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;
