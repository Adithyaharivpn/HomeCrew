const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/authMiddlware');

// POST a Review
router.post('/', auth, async (req, res) => {
  try {
    const { jobId, targetUserId, rating, comment, visibility } = req.body;
    
    const newReview = new Review({
      jobId,
      reviewerId: req.user.id,
      targetUserId,
      rating,
      comment,
      visibility 
    });

    await newReview.save();
    res.json(newReview);
  } catch (error) {
    res.status(500).json(error);
  }
});


router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params; 
    const viewerId = req.user.id;  
    const viewerRole = req.user.role;

    let query = { targetUserId: userId };
    if (viewerRole === 'customer' && viewerId !== userId) {
      query.visibility = 'public';
    }

    const reviews = await Review.find(query)
      .populate('reviewerId', 'name profilePictureUrl')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;