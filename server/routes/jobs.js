const express = require('express');
const router = express.Router();
const { postJob, getJobs, getMyJobs, getTradespersonFeed} = require('../controller/PostJob');
const authMiddleware = require('../middleware/authMiddlware');


router.get('/', getJobs);

router.get('/userjob', authMiddleware, getMyJobs);

router.get('/feed', authMiddleware, getTradespersonFeed);

router.post('/', authMiddleware, postJob);

module.exports = router;
