// Bundle deals routes
const express = require('express');
const router = express.Router();
const bundleDealsController = require('../controllers/bundleDealsController');
const auth = require('../middleware/auth');

// Public routes
// Search bundle deals
router.post('/search', bundleDealsController.searchBundles);

// Get bundle details by ID
router.get('/details/:bundleId', bundleDealsController.getBundleDetails);

// Get popular destinations
router.get('/destinations', bundleDealsController.getPopularDestinations);

// Protected routes (require authentication)
// Book bundle package
router.post('/book', auth, bundleDealsController.bookBundle);

// Get user's bundle bookings
router.get('/user/:userId', auth, bundleDealsController.getUserBundles);

// Cancel bundle booking
router.put('/cancel/:bookingId', auth, bundleDealsController.cancelBundle);

module.exports = router;