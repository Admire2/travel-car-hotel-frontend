// Reviews routes with TripAdvisor-style functionality
const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const auth = require('../middleware/auth');

// Public routes
// Get reviews for a specific entity (hotel, flight, car, bundle, vacation-rental)
router.get('/', reviewsController.getReviews);

// Get review statistics for an entity
router.get('/stats/:entityType/:entityId', reviewsController.getReviewStats);

// Get popular reviewed entities by type
router.get('/popular/:entityType', reviewsController.getPopularReviewed);

// Protected routes (require authentication)
// Submit a new review
router.post('/', auth, reviewsController.submitReview);

// Mark review as helpful
router.put('/helpful/:reviewId', auth, reviewsController.markHelpful);

// Report a review
router.put('/report/:reviewId', auth, reviewsController.reportReview);

// Get user's reviews
router.get('/user/:userId', auth, reviewsController.getUserReviews);

// Legacy routes for backward compatibility
router.post('/create', auth, reviewsController.createReview);
router.get('/all', reviewsController.getAllReviews);

module.exports = router;
