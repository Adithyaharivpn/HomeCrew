const User = require('../models/User');
const Job = require('../models/JobsModel'); 
const Review = require('../models/Review');
const mongoose = require('mongoose');
const logger = require('../utils/logger'); 

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTradespeople = await User.countDocuments({ role: 'tradesperson' });
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalJobs = await Job.countDocuments();

        const totalRevenueAgg = await mongoose.connection.collection('transactions').aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();
        const totalRevenue = (totalRevenueAgg[0] && totalRevenueAgg[0].total) || 0;

        res.json({
            totalUsers,
            totalTradespeople,
            totalCustomers,
            totalJobs,
            totalRevenue
        });
    } catch (err) {
        logger.error(`Error fetching dashboard stats: ${err.message}`);
        res.status(500).send('Server Error');
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        logger.error(`Error fetching users: ${err.message}`);
        res.status(500).send('Server Error');
    }
};


const deactivateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        logger.info(`Admin ${req.user.id} deactivated user: ${user.email}`, { 
            meta: { action: 'deactivate_user', targetUserId: user._id, adminId: req.user.id } 
        });

        res.json({ msg: 'User has been deactivated' });
    } catch (err) {
        logger.error(`Error deactivating user: ${err.message}`);
        res.status(500).send('Server Error');
    }
};


const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const updatedData = {};
        if (name) updatedData.name = name;
        if (email) updatedData.email = email;
        if (role) updatedData.role = role;

        const user = await User.findByIdAndUpdate(req.params.id, { $set: updatedData }, { new: true }).select('-password');
        logger.info(`Admin ${req.user.id} updated user: ${user.email}`, {
            meta: { action: 'update_user', targetUserId: user._id, changes: updatedData }
        });

        res.json(user);
    } catch (err) {
        logger.error(`Error updating user: ${err.message}`);
        res.status(500).send('Server Error');
    }
};


const reactivateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select('-password');
        logger.info(`Admin ${req.user.id} reactivated user: ${user.email}`, {
            meta: { action: 'reactivate_user', targetUserId: user._id }
        });
        res.json(user);
    } catch (err) {
        logger.error(`Error reactivating user: ${err.message}`);
        res.status(500).send('Server Error');
    }
};

const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        logger.error(`Error fetching all jobs: ${err.message}`);
        res.status(500).send('Server Error');
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });
        
        logger.info(`Admin deleted job: ${job.title}`, { meta: { adminId: req.user.id } });
        res.json({ msg: 'Job removed' });
    } catch (err) {
        logger.error(`Error deleting job: ${err.message}`);
        res.status(500).send('Server Error');
    }
};

const getSystemLogs = async (req, res) => {
    try {
        const collection = mongoose.connection.collection('logs');
        const logs = await collection.find({})
            .sort({ timestamp: -1 })
            .limit(50)
            .toArray();

        res.json(logs);
    } catch (err) {
        console.error("Error fetching logs:", err); 
        res.status(500).json({ message: "Error fetching logs" });
    }
};

const getTradespeopleList = async (req, res) => {
    try {
        const users = await User.find({ role: 'tradesperson' })
            .select('-password') 
            .sort({ createdAt: -1 }); 
        res.json(users);
    } catch (err) {
        logger.error(`Error fetching tradespeople: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
};

const changeVerificationStatus = async (req, res) => {
    try {
        const { userId, status } = req.body; 
        const isVerified = status === 'approved';

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { 
                verificationStatus: status,
                isVerified: isVerified
            },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        logger.info(`Admin ${req.user.id} changed verification for ${updatedUser.email} to ${status}`);
        res.json({ message: `User ${status}`, user: updatedUser });
    } catch (err) {
        logger.error(`Error changing verification: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
};

const getRoleDashboardStats = async (req, res) => {
    try {
        const role = req.user.role;

        if (role === 'admin') {
            const totalRevenueAgg = await mongoose.connection.collection('transactions').aggregate([
                { $match: { status: 'success' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).toArray();
            
            const totalUsers = await User.countDocuments();
            const totalTradespeople = await User.countDocuments({ role: 'tradesperson' });
            const totalCustomers = await User.countDocuments({ role: 'customer' });
            const totalJobs = await Job.countDocuments();

            const pendingVerifications = await User.countDocuments({ 
                role: 'tradesperson', 
                verificationStatus: 'pending' 
            });

            return res.json({ 
                totalRevenue: (totalRevenueAgg[0] && totalRevenueAgg[0].total) || 0, 
                totalUsers,
                totalTradespeople,
                totalCustomers,
                totalJobs,
                pendingVerifications 
            });
        }


        if (role === 'tradesperson') {
            const tradespersonId = req.user.id;
            const earningsAgg = await mongoose.connection.collection('transactions').aggregate([
                { $match: { tradesperson: new mongoose.Types.ObjectId(tradespersonId), status: 'success' } },
                { $group: { _id: null, totalEarnings: { $sum: '$amount' } } }
            ]).toArray();

            const totalEarned = (earningsAgg[0] && earningsAgg[0].totalEarnings) || 0;
            const activeJobs = await Job.countDocuments({ 
                assignedTo: tradespersonId, 
                status: { $in: ['assigned', 'in_progress'] } 
            });

            // Calculate live rating from reviews
            const reviews = await Review.find({ targetUserId: tradespersonId });
            const averageRating = reviews.length > 0 
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
                : 0;

            return res.json({ 
                totalEarned, 
                activeJobs,
                rating: parseFloat(averageRating.toFixed(1)) 
            });
        }

        if (role === 'customer') {
            const customerId = req.user.id;
            const spentAgg = await mongoose.connection.collection('transactions').aggregate([
                { $match: { user: new mongoose.Types.ObjectId(customerId), status: 'success' } },
                { $group: { _id: null, totalSpent: { $sum: '$amount' } } }
            ]).toArray();

            const totalSpent = (spentAgg[0] && spentAgg[0].totalSpent) || 0;
            const ongoingTasks = await Job.countDocuments({ 
                user: customerId, 
                status: { $in: ['assigned', 'in_progress'] } 
            });
            const totalJobs = await Job.countDocuments({ user: customerId });

            return res.json({ 
                totalSpent, 
                ongoingTasks,
                totalJobs
            });
        }

    } catch (err) {
        logger.error(`Error fetching role dashboard stats: ${err.message}`);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getDashboardStats,
    getRoleDashboardStats,
    getAllUsers,
    deactivateUser,
    updateUser,
    reactivateUser,
    getAllJobs,
    deleteJob,
    getSystemLogs,
    getTradespeopleList,
    changeVerificationStatus,
};

