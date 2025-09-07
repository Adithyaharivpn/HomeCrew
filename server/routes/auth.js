const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Signup route
router.post('/signup', async (req, res) => {
  try {
    console.log('📝 Signup request received:', req.body);
    const { 
      userType, 
      firstName, 
      lastName, 
      email, 
      phone, 
      password,
      // Employee fields
      skills,
      experience,
      hourlyRate,
      serviceArea,
      companyName,
      // Customer fields
      address
    } = req.body;

    // Check if user already exists
    console.log('🔍 Checking if user exists with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate required fields based on user type
    if (userType === 'employee') {
      if (!skills || skills.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Skills are required for trades people'
        });
      }
      if (!experience || !hourlyRate || !serviceArea) {
        return res.status(400).json({
          success: false,
          message: 'Experience, hourly rate, and service area are required for trades people'
        });
      }
    } else if (userType === 'customer') {
      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'Address is required for customers'
        });
      }
    }

    // Create new user
    console.log('✅ Creating new user with type:', userType);
    const newUser = new User({
      userType,
      firstName,
      lastName,
      email,
      phone,
      password, // Will be hashed by the pre-save middleware
      ...(userType === 'employee' && {
        skills,
        experience: parseInt(experience),
        hourlyRate: parseFloat(hourlyRate),
        serviceArea,
        companyName
      }),
      ...(userType === 'customer' && {
        address
      })
    });

    console.log('💾 Saving user to database...');
    await newUser.save();
    console.log('🎉 User saved successfully with ID:', newUser._id);

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        userType: newUser.userType,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get user profile route
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;
