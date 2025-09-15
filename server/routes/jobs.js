const express = require('express');
const router = express.Router();
const { postJob } = require('../controller/PostJob');


router.post('/', postJob);


// router.get('/', getAllJobs);

module.exports = router;
