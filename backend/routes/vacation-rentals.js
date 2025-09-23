// vacation-rentals.js - Routes for vacation rental bookings

const express = require('express');
const router = express.Router();
const {
  searchVacationRentals,
  getLocationSuggestions,
  getVacationRentalDetails,
  bookVacationRental,
  getFeaturedVacationRentals
} = require('../controllers/vacationRentalController');

// Middleware for logging vacation rental requests
const logVacationRentalRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Vacation Rental API: ${req.method} ${req.path}`);
  next();
};

// Apply logging middleware to all routes
router.use(logVacationRentalRequest);

// Search vacation rentals
// GET /api/vacation-rentals/search
router.get('/search', searchVacationRentals);

// Get location suggestions for autocomplete
// GET /api/vacation-rentals/locations
router.get('/locations', getLocationSuggestions);

// Get featured vacation rentals
// GET /api/vacation-rentals/featured
router.get('/featured', getFeaturedVacationRentals);

// Get vacation rental details by ID
// GET /api/vacation-rentals/:id
router.get('/:id', getVacationRentalDetails);

// Book vacation rental
// POST /api/vacation-rentals/book
router.post('/book', bookVacationRental);

module.exports = router;