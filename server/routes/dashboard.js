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

        const activities = recentJobs.map(job => {
            const statusMap = {
                'pending': 'Pending',
                'assigned': 'Assigned',
                'in_progress': 'In Progress',
                'completed': 'Completed',
                'cancelled': 'Cancelled'
            };
            const friendlyStatus = statusMap[job.status] || job.status;
            
            return {
                type: "status_update",
                message: `Job "${job.title}" is now ${friendlyStatus}`,
                createdAt: job.updatedAt
            };
        });

        res.json(activities);
    } catch (err) {
        res.status(500).json([]);
    }
});

module.exports = router;
