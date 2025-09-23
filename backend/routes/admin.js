const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/users', adminController.getAllUsers);
router.get('/bookings', adminController.getAllBookings);
router.get('/reviews', adminController.getAllReviews);
router.delete('/user/:id', adminController.deleteUser);
router.delete('/booking/:id', adminController.deleteBooking);
router.delete('/review/:id', adminController.deleteReview);

module.exports = router;
