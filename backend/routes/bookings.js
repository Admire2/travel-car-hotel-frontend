const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');

// Original booking routes (preserved for compatibility)
router.post('/', bookingsController.createBooking);
router.get('/', bookingsController.getAllBookings);
router.get('/:id', bookingsController.getBookingById);
router.put('/:id', bookingsController.updateBooking);
router.delete('/:id', bookingsController.cancelBooking);

// Enhanced MyBookings routes
router.get('/user', bookingsController.getUserBookings);
router.get('/user/:bookingId/details', bookingsController.getBookingDetails);
router.post('/user/:bookingId/cancel', bookingsController.cancelUserBooking);
router.put('/user/:bookingId/modify', bookingsController.modifyUserBooking);

// Booking status and management routes
router.get('/user/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const userId = req.user?.id || req.headers['user-id'];
    
    // This would filter bookings by status
    const statusBookings = [
      {
        id: '1',
        type: 'flight',
        status: status,
        title: `${status.charAt(0).toUpperCase() + status.slice(1)} Flight`,
        totalPrice: 599,
        currency: 'USD'
      }
    ];
    
    res.json({
      success: true,
      bookings: statusBookings,
      status: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings by status'
    });
  }
});

// Booking statistics endpoint
router.get('/user/stats', async (req, res) => {
  try {
    const userId = req.user?.id || req.headers['user-id'];
    
    const stats = {
      totalBookings: 15,
      upcomingTrips: 3,
      completedTrips: 10,
      cancelledBookings: 2,
      totalSpent: 4250,
      currency: 'USD',
      favoriteDestinations: ['London', 'Paris', 'Tokyo'],
      bookingsByType: {
        flights: 8,
        hotels: 5,
        cars: 2
      }
    };
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics'
    });
  }
});

// Booking notifications
router.get('/user/notifications', async (req, res) => {
  try {
    const notifications = [
      {
        id: '1',
        type: 'reminder',
        title: 'Flight Check-in Available',
        message: 'Your flight to London is ready for check-in',
        bookingId: '670f7a1b2c3d4e5f67890abc',
        createdAt: new Date(),
        read: false,
        priority: 'high'
      }
    ];
    
    res.json({
      success: true,
      notifications: notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

module.exports = router;
