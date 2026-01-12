const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddlware');
const Job = require('../models/JobsModel');
const { getRoleDashboardStats } = require('../controller/admincontroller');

router.get('/stats', authMiddleware, getRoleDashboardStats);

router.get('/recent-activity', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        let query = {};

        if (role === 'admin') query = {};
        else if (role === 'tradesperson') query = { assignedTo: userId };
        else query = { user: userId };

        const recentJobs = await Job.find(query)
            .sort({ updatedAt: -1 })
            .limit(5);

        const activities = recentJobs.map(job => ({
            type: "status_update",
            message: `Job "${job.title}" shifted to ${job.status.toUpperCase()}`,
            createdAt: job.updatedAt
        }));

        res.json(activities);
    } catch (err) {
        res.status(500).json([]);
    }
});

module.exports = router;
