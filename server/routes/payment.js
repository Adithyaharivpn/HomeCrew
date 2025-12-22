const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controller/paymentcontroller'); // Check path
const auth = require('../middleware/authMiddlware');


router.post('/create-payment-intent', auth, createPaymentIntent);

module.exports = router;