const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/authMiddlware');
const logger = require('../utils/logger'); 


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

    // Recalculate Average Rating for Tradesperson
    const allReviews = await Review.find({ targetUserId });
    const totalReviews = allReviews.length;
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    const User = require('../models/User');
    await User.findByIdAndUpdate(targetUserId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: totalReviews
    });

    logger.info(`Review posted: ${rating} Stars for User ${targetUserId}. New Average: ${averageRating.toFixed(1)}`, {
        meta: { type: 'review_created', jobId }
    });

    res.json(newReview);
  } catch (error) {
    logger.error(`Error posting review: ${error.message}`);
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
    logger.error(`Error fetching reviews for User ${req.params.userId}: ${error.message}`);
    res.status(500).json(error);
  }
});

module.exports = router;