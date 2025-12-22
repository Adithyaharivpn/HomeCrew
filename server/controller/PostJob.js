const Job = require('../models/JobsModel');
const User = require('../models/User');
const logger = require('../utils/logger'); 

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
        status: 'assigned' 
    })
    .populate('user', 'name email profilePictureUrl') 
    .sort({ updatedAt: -1 });

    res.json(jobs);
  } catch (error) {
    logger.error(`Error fetching active jobs: ${error.message}`);
    res.status(500).json(error);
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
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        job.isPaid = true;
        job.paymentId = req.body.paymentId;
        
        job.completionCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        await job.save();
        
        res.json({ success: true, message: "Payment recorded & Code generated" });
    } catch (error) {
        logger.error("Error in markJobAsPaid:", error);
        res.status(500).send('Server Error');
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
  markJobAsPaid
};