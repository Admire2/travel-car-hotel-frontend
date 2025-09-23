const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Unified search endpoint for flights, hotels, cars
router.post('/travel', async (req, res) => {
	const { flightParams, hotelParams, carParams } = req.body;
	try {
		const results = await travelService.searchTravelOptions(flightParams, hotelParams, carParams);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
