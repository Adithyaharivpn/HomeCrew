const express = require('express');
const router = express.Router();
const { postJob,getJobs } = require('../controller/PostJob');


router.post('/', postJob);
router.get('/', getJobs);

module.exports = router;
