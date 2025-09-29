const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
require('./database')


const authRoutes = require('./routes/auth');
const jobs = require('./routes/jobs');
const services = require('./routes/service');
const admin = require('./routes/admin');
const user = require('./routes/user');  

const PORT = process.env.PORT || 8080;

const app = express();

//cors
const allowedOrigins = ['https://college-project-git-feature-jobpage-adithyaharivpns-projects.vercel.app', 'http://localhost:3000' ,'http://localhost:5173']; // frontend URLs here

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobs);
app.use('/api/service', services);
app.use('/api/admin', admin); // Admin routes
app.use('/api/users', user);  // User profile routes

app.get('/', (req, res) => {
  res.send('College Project API Server - Running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  

});