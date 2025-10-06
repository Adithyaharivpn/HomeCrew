const User = require('../models/User');


const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
      const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (role) updatedData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updatedData }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Reactivate a user
const reactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { updateUser, reactivateUser };