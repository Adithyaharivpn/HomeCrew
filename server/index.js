const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
require('./database')


const authRoutes = require('./routes/auth');
const jobs = require('./routes/jobs');


const PORT = process.env.PORT || 8080;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobs);

app.get('/', (req, res) => {
  res.send('College Project API Server - Running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});