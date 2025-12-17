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
       res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const getTradespersonFeed = async (req, res) => {
  try {
    const tradesperson = await User.findById(req.user.id);
    // if (!tradesperson || !tradesperson.tradeCategory) {
    //   return res.status(400).json({ error: 'User trade category not found.' });
    // }

    const jobs = await Job.find({ 
      // category: tradesperson.tradeCategory, 
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

//job postted by user id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
       .populate('user', 'name profilePictureUrl')
       .populate('assignedTo', 'name profilePictureUrl')
       .select('+completionCode'); 

    if (!job) return res.status(404).json({ msg: 'Job not found' });

    let jobData = job.toObject();

    if (req.user && job.user._id.toString() !== req.user.id) {
        delete jobData.completionCode; 
    }

    res.json(jobData);
  } catch (err) {
    console.error(err);
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
      return res.status(401).json({ message: 'Not authorized to edit this job' });
    }

    // 3. Update fields
    job.title = title || job.title;
    job.description = description || job.description;
    job.category = category || job.category;
    job.city = city || job.city;

    await job.save();
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const completeJob = async (req, res) => {
  const { jobId, code } = req.body;
  try {
    
    const job = await Job.findById(jobId).select('+completionCode');

    if (!job) return res.status(404).json({ message: "Job not found" });

   
    if (job.completionCode !== code) {
      return res.status(400).json({ message: "Invalid Code! Ask the customer for the correct code." });
    }

    job.status = 'completed';
    job.isCompleted = true;
    await job.save();

    res.json({ message: "Job Verified & Completed!", success: true });
  } catch (error) {
    res.status(500).json(error);
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
  completeJob
};