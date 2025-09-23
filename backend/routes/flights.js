const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

// Search flights - support both GET (legacy) and POST (new FlightSearch component)
router.get('/search', flightController.searchFlights);
router.post('/search', flightController.searchFlights);

// Book flight
router.post('/book', flightController.bookFlight);

// Cancel flight booking
router.post('/cancel', flightController.cancelFlightBooking);

module.exports = router;
