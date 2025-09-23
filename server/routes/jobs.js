const express = require('express');
const router = express.Router();
const { postJob,getJobs } = require('../controller/PostJob');
const authMiddleware = require('../middleware/authMiddlware');

router.post('/', authMiddleware, postJob);
router.get('/', authMiddleware, getJobs);

module.exports = router;
