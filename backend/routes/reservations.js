const express = require('express');
const router = express.Router();
const reservationsController = require('../controllers/reservationsController');

router.get('/:userId', reservationsController.listUserReservations);

module.exports = router;
