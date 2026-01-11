const Job = require('../models/JobsModel');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger'); 
const axios = require('axios');

const postJob = async (req, res) => {
  try {
    const { title, category, description, city, location } = req.body;
    const userId = req.user.id; 

    if (!title || !category || !description || !city) {
      logger.warn(`Job post failed: Missing fields by User ${userId}`);
      return res.status(400).json({ message: 'Please fill out all required fields.' });
    }
    
    const newJob = new Job({
      title,
      category,
      description,
      city,
      location,
      user: userId, 
    });

    await newJob.save();
    logger.info(`Job posted: "${title}" by User ${userId}`, { meta: { jobId: newJob._id } });

    res.status(201).json({ message: 'Job posted successfully!', job: newJob });

  } catch (error) {
    logger.error(`Error posting job: ${error.message}`);
    res.status(500).json({ message: 'Error, please try again later.' });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .populate('user', 'name') 
      .sort({ createdAt: -1 }); 

    res.status(200).json(jobs);
  } catch (error) {
    logger.error(`Error fetching jobs: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id })
      .populate('user', 'name') 
      .sort({ createdAt: -1 })
      .select('+completionCode');
       res.json(jobs);
  } catch (err) {
    logger.error(`Error fetching my jobs: ${err.message}`);
    res.status(500).send('Server Error');
  }
};

const getTradespersonFeed = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
    .populate('user') 
    .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    logger.error(`Error fetching tradesperson feed: ${err.message}`);
    res.status(500).send('Server Error');
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('user', 'name profilePictureUrl')
      .populate('assignedTo', 'name profilePictureUrl')
      .select('+completionCode');

    if (!job) return res.status(404).json({ msg: 'Job not found' });

    let jobData = job.toObject();
    const currentUserId = req.user ? req.user.id.toString() : '';
    const jobOwnerId = job.user._id ? job.user._id.toString() : job.user.toString();
    
    const isOwner = currentUserId === jobOwnerId;
    if (!isOwner || !job.isPaid) {
       delete jobData.completionCode; 
    }

    res.json(jobData);
  } catch (err) {
    console.error(`Error fetching job details: ${err.message}`);
    res.status(500).send('Server Error');
  }
};
const getTradespersonActivejobs = async (req, res) => {
  const currentUserId = req.user.id; 

  try {
    const jobs = await Job.find({ 
        assignedTo: currentUserId, 
        status: { $in: ['assigned', 'completed', 'in_progress', 'cancelled'] } 
    })
    .populate('user', 'name email profilePictureUrl') 
    .sort({ updatedAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error(`Error fetching tradesperson works: ${error.message}`);
    res.status(500).json({ message: "Server error fetching jobs" });
  }
};

const updateJob = async (req, res) => {
  try {
    const { title, description, category, city } = req.body;
    
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.user.toString() !== req.user.id) {
      logger.warn(`Unauthorized job update attempt by User ${req.user.id} on Job ${req.params.id}`);
      return res.status(401).json({ message: 'Not authorized to edit this job' });
    }
    job.title = title || job.title;
    job.description = description || job.description;
    job.category = category || job.category;
    job.city = city || job.city;

    await job.save();
    
    logger.info(`Job updated: ${req.params.id} by User ${req.user.id}`);
    res.json(job);
  } catch (error) {
    logger.error(`Error updating job: ${error.message}`);
    res.status(500).send('Server Error');
  }
};

const completeJob = async (req, res) => {
  const { jobId, code } = req.body;
  try {
    const job = await Job.findById(jobId).select('+completionCode');

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.completionCode !== code) {
      logger.warn(`Job completion failed: Invalid code for Job ${jobId}`);
      return res.status(400).json({ message: "Invalid Code! Ask the customer for the correct code." });
    }

    job.status = 'completed';
    job.isCompleted = true;
    await job.save();
    logger.info(`Job successfully completed: ${jobId}`, { meta: { type: 'job_complete' } });

    res.json({ message: "Job Verified & Completed!", success: true });
  } catch (error) {
    logger.error(`Error completing job: ${error.message}`);
    res.status(500).json(error);
  }
};

const markJobAsPaid = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const job = await Job.findById(req.params.id).populate('user').populate('assignedTo');

        if (!job) return res.status(404).json({ message: 'Job not found' });

        const amountPaid = job.price || 0; 
        const newTransaction = new Transaction({
            user: job.user._id, 
            tradesperson: job.assignedTo ? job.assignedTo._id : null, 
            job: job._id,
            stripePaymentId: paymentId,
            amount: amountPaid,
            status: 'success'
        });
        
        await newTransaction.save();
        job.isPaid = true;
        job.paymentId = paymentId;
        job.completionCode = Math.floor(100000 + Math.random() * 900000).toString();
        await job.save();
        
        logger.info(`Payment Transaction Saved: ${newTransaction._id}`);

        res.json({ 
            success: true, 
            message: "Payment recorded & Code generated",
            completionCode: job.completionCode 
        });

    } catch (error) {
        logger.error("Error in markJobAsPaid:", error);
        res.status(500).send('Server Error');
    }
};

const searchLocation = async (req, res) => {
    try {
        const { q } = req.query;
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`, {
            headers: { 'User-Agent': 'HomeCrew-App' }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const rescheduleJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only owner or assigned tradesperson may reschedule
    const currentUserId = req.user.id.toString();
    const isOwner = job.user.toString() === currentUserId;
    const isAssigned = job.assignedTo && job.assignedTo.toString() === currentUserId;

    if (!isOwner && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to reschedule this job' });
    }

    job.scheduledDate = scheduledDate;
    await job.save();

    res.status(200).json({ 
      message: "Job rescheduled successfully", 
      scheduledDate: job.scheduledDate 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const cancelJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status === 'completed') {
      return res.status(400).json({ message: "Cannot cancel a finished job" });
    }

    // Only job owner may cancel
    const currentUserId = req.user.id.toString();
    if (job.user.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Only job owner can cancel this job' });
    }

    job.status = 'cancelled';
    await job.save();

    res.status(200).json({ message: "Job has been cancelled", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Return completion code only if paid and requester is owner
const getJobCode = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).select('+completionCode');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const currentUserId = req.user.id.toString();
    if (job.user.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to view completion code' });
    }

    if (!job.isPaid || job.status !== 'assigned') {
      return res.status(400).json({ message: 'Completion code is not available' });
    }

    res.json({ completionCode: job.completionCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  postJob, 
  getJobs, 
  getMyJobs, 
  getTradespersonFeed, 
  getJobById, 
  getTradespersonActivejobs, 
  updateJob, 
  completeJob, 
  markJobAsPaid, 
  searchLocation,
  cancelJob,
  rescheduleJob
};
// export getJobCode
module.exports.getJobCode = getJobCode;