const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

require('./database')


const authRoutes = require('./routes/auth');
const jobs = require('./routes/jobs');
const services = require('./routes/service');

const PORT = process.env.PORT || 8080;

const app = express();

//cors
const allowedOrigins = ['https://college-project-git-feature-jobpage-adithyaharivpns-projects.vercel.app', 'http://localhost:5173'];

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
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobs);
app.use('/api/service', services);

app.get('/', (req, res) => {
  res.send('College Project API Server - Running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});