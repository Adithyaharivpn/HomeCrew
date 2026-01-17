var mongoose = require('mongoose');
var dotenv = require('dotenv');
const logger = require('./utils/logger'); 

dotenv.config();

mongoose.connect(process.env.mongodb_url,{
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000, 
})
  .then(() => {
    logger.info("Database Connected Successfully");
  })
  .catch((error) => {
    logger.error(`Database Connection Failed: ${error.message}`);
  });