const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// Car search and listing routes
router.get('/search', carController.searchCars);
router.get('/', carController.searchCars); // Fallback for basic listing
router.get('/:carId', carController.getCarDetails);

// Car booking routes
router.post('/reserve', carController.bookCar); // Legacy endpoint
router.post('/book', carController.bookCar); // New endpoint for CarRental component

// Car cancellation routes
router.post('/cancel', carController.cancelCarBooking);

module.exports = router;
