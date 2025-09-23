const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Hotel search and listing routes
router.get('/search', hotelController.searchHotels);
router.get('/', hotelController.searchHotels); // Fallback for basic listing
router.get('/:hotelId', hotelController.getHotelDetails);

// Hotel booking routes
router.post('/reserve', hotelController.bookHotel); // Legacy endpoint
router.post('/book', hotelController.bookHotel); // New endpoint for HotelSearch component

// Hotel cancellation routes
router.post('/cancel', hotelController.cancelHotelBooking);

module.exports = router;
