const express = require('express');
const router = express.Router();

const { signup , login } = require('../controller/authcontroller'); 
const { SignupvalidateRules, validate } = require('../middleware/validate');

router.post('/signup', SignupvalidateRules(), validate, signup);
router.post('/login', login);

module.exports = router;
