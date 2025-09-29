const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signup = async (req, res) => {
  console.log("--- SIGNUP REQUEST RECEIVED ---");
  console.log("REQUEST BODY:", req.body); // This should show your text fields
  console.log("REQUEST FILE:", req.file);   // This should show your file from multer
  console.log("-----------------------------");
  const { name, email, password, role, tradeCategory, experience, location } =
    req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
    };
    if (req.file) {
      userData.profilePictureUrl = req.file.path;
    }

    if (role === "tradesperson") {
      userData.tradeCategory = tradeCategory;
      userData.experience = experience;
      userData.location = location;
    }

    // Save user to DB
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
        // Send a success message AND the token
        res
          .status(201)
          .json({ token, message: "User registered successfully!" });
      }
    );

    
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 2. Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 3. If credentials are correct, create a JWT
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
        res.json({ token, message: "Logged in successfully" });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

module.exports = { signup, login };
