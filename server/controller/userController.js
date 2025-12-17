const User = require('../models/User');

// Get current user's profile
const getMyProfile = async (req, res) => {
  try {
  
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
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

    res.json(user);
  } catch (err) {
    console.error(err.message);
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
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

module.exports = { getMyProfile, updateMyProfile, getUserById };