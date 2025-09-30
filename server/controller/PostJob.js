const Job = require('../models/JobsModel');
const User = require('../models/User');

const postJob = async (req, res) => {
  try {
    
    const { title, category, description, city } = req.body;

    const userId = req.user.id; 
    

    
    if (!title || !category || !description || !city) {
      return res.status(400).json({ message: 'Please fill out all required fields.' });
    }

    const newJob = new Job({
      title,
      category,
      description,
      city,
      user: userId, 
    });

    
    await newJob.save();

    
    res.status(201).json({ message: 'Job posted successfully!', job: newJob });

  } catch (error) {
    console.error('Error posting job:', error);
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
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id })
      .populate('user', 'name') 
      .sort({ createdAt: -1 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const getTradespersonFeed = async (req, res) => {
  try {
    const tradesperson = await User.findById(req.user.id);
    if (!tradesperson || !tradesperson.tradeCategory) {
      return res.status(400).json({ error: 'User trade category not found.' });
    }

    const jobs = await Job.find({ 
      category: tradesperson.tradeCategory, 
      status: 'open' 
    })
    .populate('user') 
    .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('user', 'name profilePictureUrl');
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
};

module.exports = { 
  postJob, 
  getJobs, 
  getMyJobs, 
  getTradespersonFeed,
  getJobById
};