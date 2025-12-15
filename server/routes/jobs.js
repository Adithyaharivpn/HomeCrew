const express = require('express');
const router = express.Router();
const { postJob, getJobs, getMyJobs, getTradespersonFeed, getJobById, getTradespersonActivejobs, updateJob} = require('../controller/PostJob');
const authMiddleware = require('../middleware/authMiddlware');


router.get('/', getJobs);

router.get('/userjob', authMiddleware, getMyJobs);

router.get('/feed', authMiddleware, getTradespersonFeed);

router.get('/tradesperson/my-works', authMiddleware, getTradespersonActivejobs);

router.post('/', authMiddleware, postJob);

router.put('/:id', authMiddleware, updateJob);

router.get('/:id', getJobById);







module.exports = router;
