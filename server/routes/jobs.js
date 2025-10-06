const express = require('express');
const router = express.Router();
const { postJob, getJobs, getMyJobs, getTradespersonFeed, getJobById} = require('../controller/PostJob');
const authMiddleware = require('../middleware/authMiddlware');


router.get('/', getJobs);

router.get('/userjob', authMiddleware, getMyJobs);

router.get('/feed', authMiddleware, getTradespersonFeed);

router.get('/:id', getJobById);

router.post('/', authMiddleware, postJob);



module.exports = router;
