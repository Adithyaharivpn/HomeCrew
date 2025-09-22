const express = require('express');
const router = express.Router();

const { signup } = require('../controller/authcontroller'); // note exact filename and export name
const { SignupvalidateRules, validate } = require('../middleware/validate');

router.post('/signup', SignupvalidateRules(), validate, signup);

module.exports = router;
