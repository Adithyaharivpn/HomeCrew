const User = require('../models/User');
const logger = require('../utils/logger'); 

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    logger.error(`Error fetching profile: ${err.message}`);
    res.status(500).send('Server Error');
  }
};

const updateMyProfile = async (req, res) => {
  const { name, location, experience, tradeCategory } = req.body;
  
  const profileFields = {};
  if (name) profileFields.name = name;
  if (location) profileFields.location = location;
  if (experience) profileFields.experience = experience;
  if (tradeCategory) profileFields.tradeCategory = tradeCategory;
  if (req.file) {
    profileFields.profilePictureUrl = req.file.path;
  }
  
  try {
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true } 
    ).select('-password');

    logger.info(`User profile updated: ${req.user.id}`, { meta: { action: 'profile_update' } });
    res.json(user);
  } catch (err) {
    logger.error(`Error updating profile: ${err.message}`);
    res.status(500).send('Server Error');
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    logger.error(`Error fetching user by ID: ${err.message}`);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

const requestVerification = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Please upload at least one document." });
        }
        
        // Map the files to get their Cloudinary URLs
        const docUrls = req.files.map(file => file.path); 

        const user = await User.findById(req.user.id);
        
        user.verificationStatus = 'pending';
        user.verificationDocuments = docUrls;

        await user.save();

        res.json({ message: "Verification request submitted!", status: user.verificationStatus });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const getTradespeoplePublic = async (req, res) => {
    try {
        const users = await User.find({ 
            role: 'tradesperson', 
            'mapLocation.lat': { $exists: true } 
        }).select('name tradeCategory location mapLocation profilePictureUrl');
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tradespeople" });
    }
};

module.exports = { getMyProfile, updateMyProfile, getUserById , requestVerification, getTradespeoplePublic };