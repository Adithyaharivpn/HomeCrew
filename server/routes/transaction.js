const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/authMiddlware');


router.get('/my-transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ user: req.user.id }, { tradesperson: req.user.id }]
        })
        .populate('job', 'title')
        .populate('tradesperson', 'name email')
        .sort({ date: -1 });

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;