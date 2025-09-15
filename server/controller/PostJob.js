const Job = require('../models/JobsModel');

const postJob = async (req, res) => {
  try {
    //Get data from the body(frontend)
    const { title, category, description, city } = req.body;

    // const userId = req.user.id; 
    const placeholderUserId = "60d0fe4f5311236168a109ca"; //temp chnage it once user route is done 

    
    if (!title || !category || !description || !city) {
      return res.status(400).json({ message: 'Please fill out all required fields.' });
    }

    const newJob = new Job({
      title,
      category,
      description,
      city,
      user: placeholderUserId, // Use the real userId once auth is ready
    });

    
    await newJob.save();

    
    res.status(201).json({ message: 'Job posted successfully!', job: newJob });

  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Error, please try again later.' });
  }
};

module.exports = { postJob };