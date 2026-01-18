const winston = require('winston');
require('winston-mongodb');
const dotenv = require('dotenv');
dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format((info) => {
      delete info._id;
      return info;
    })(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [

    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }),
    
    new winston.transports.MongoDB({
      db: process.env.mongodb_url,
      collection: 'logs', 
      level: 'info', 
      storeHost: true,
      capped: true, 
      cappedSize: 10000000, 
      metaKey: 'meta' 
    })
  ],
});

module.exports = logger;