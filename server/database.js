var mongoose = require('mongoose');
var dotenv = require('dotenv');
const logger = require('./utils/logger'); 

dotenv.config();

mongoose.connect(process.env.mongodb_url)
  .then(() => {
    logger.info("Database Connected Successfully");
  })
  .catch((error) => {
    logger.error(`Database Connection Failed: ${error.message}`);
  });