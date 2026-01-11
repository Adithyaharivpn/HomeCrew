const express = require('express');
const router = express.Router();

const { signup , login } = require('../controller/authcontroller'); 
const { SignupvalidateRules, validate } = require('../middleware/validate');
const upload = require('../middleware/multer')

router.post('/signup',  upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'documents', maxCount: 3 } ]), SignupvalidateRules(), validate,signup);
router.post('/login', login);

module.exports = router;
