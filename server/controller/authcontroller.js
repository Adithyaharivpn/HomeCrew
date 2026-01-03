const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cloudinary = require("../middleware/cloudinary");
const logger = require('../utils/logger'); 

const signup = async (req, res) => {
  const { name, email, password, role, tradeCategory, experience, location } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Signup failed: Email already registered ${email}`);
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'profile_pics'
      });
      userData.profilePictureUrl = result.secure_url;
    }

    if (role === "tradesperson") {
      userData.tradeCategory = tradeCategory;
      userData.experience = experience;
      userData.location = location;
    }
    const user = new User(userData);
    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        profilePictureUrl: user.profilePictureUrl
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "3h" },
      (err, token) => {
        if (err) throw err;
        logger.info(`New user registered: ${email}`, { meta: { userId: user.id, role } });

        res
          .status(201)
          .json({ token, message: "User registered successfully!" });
      }
    );
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true  });
    
    if (!user) {
      logger.warn(`Login failed for ${email}: User not found or inactive`);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed for ${email}: Invalid password`);
      return res.status(400).json({ error: "Invalid credentials or user deactivated" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        profilePictureUrl: user.profilePictureUrl
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "3h" },
      (err, token) => {
        if (err) throw err;
        logger.info(`User logged in: ${user.email}`, { meta: { userId: user.id } });

        res.json({ token, message: "Logged in successfully" });
      }
    );
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).send("Server error");
  }
};

module.exports = { signup, login };