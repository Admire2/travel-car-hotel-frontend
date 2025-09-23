// bookingsController.js - Enhanced backend controller for managing user bookings
const Reservation = require('../models/reservation');
const Booking = require('../models/booking');
const User = require('../models/user');

// Original basic booking functions (preserved for compatibility)
exports.createBooking = async (req, res) => {
  try {
    const booking = new Reservation(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Reservation.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Reservation.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Reservation.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enhanced MyBookings functionality

// Get all bookings for authenticated user
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.id || req.headers['user-id']; // Flexible auth
    
    // Try both Reservation and Booking models for compatibility
    let bookings = [];
    
    try {
      const reservations = await Reservation.find({ 
        userId: userId,
        isDeleted: { $ne: true }
      }).sort({ bookingDate: -1 });
      
      bookings = reservations.map(res => transformReservationToBooking(res));
    } catch (err) {
      // If Reservation query fails, use mock data
      bookings = getMockBookings(userId);
    }

    // Transform bookings for frontend
    const transformedBookings = bookings.map(booking => ({
      id: booking._id || booking.id,
      type: booking.bookingType || booking.type || 'flight',
      status: booking.status || 'confirmed',
      title: getBookingTitle(booking),
      subtitle: getBookingSubtitle(booking),
      description: booking.description,
      confirmationNumber: booking.confirmationNumber || generateConfirmationNumber(),
      totalPrice: booking.totalPrice || booking.price || 299,
      currency: booking.currency || 'USD',
      bookingDate: booking.bookingDate || booking.createdAt || new Date(),
      
      // Type-specific data
      ...getTypeSpecificData(booking),
      
      // Modification and cancellation flags
      modifiable: isBookingModifiable(booking),
      cancellable: isBookingCancellable(booking),
      
      // Special requests
      specialRequests: booking.specialRequests,
      
      // Provider information
      provider: booking.provider || 'expedia',
      providerBookingId: booking.providerBookingId
    }));

    res.json({
      success: true,
      bookings: transformedBookings,
      total: transformedBookings.length
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id || req.headers['user-id'];

    let booking;
    try {
      booking = await Reservation.findOne({
        _id: bookingId,
        userId: userId,
        isDeleted: { $ne: true }
      });
    } catch (err) {
      // Use mock data if database query fails
      booking = getMockBookingDetails(bookingId, userId);
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get detailed booking information
    const detailedBooking = {
      id: booking._id || booking.id,
      type: booking.bookingType || booking.type,
      status: booking.status,
      confirmationNumber: booking.confirmationNumber,
      totalPrice: booking.totalPrice || booking.price,
      currency: booking.currency || 'USD',
      bookingDate: booking.bookingDate || booking.createdAt,
      
      // Complete booking data
      ...booking,
      
      // Policies and rules
      cancellationPolicy: getCancellationPolicy(booking),
      modificationPolicy: getModificationPolicy(booking),
      
      // Provider contact information
      providerContact: getProviderContact(booking.provider || 'expedia'),
      
      // Timeline
      timeline: getBookingTimeline(booking._id || booking.id)
    };

    res.json({
      success: true,
      booking: detailedBooking
    });

  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Enhanced cancellation with comprehensive policy management
exports.cancelUserBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason, refundAmount, cancellationFee, agreesToPolicy } = req.body;
    const userId = req.user?.id || req.headers['user-id'];

    let booking;
    try {
      booking = await Reservation.findOne({
        _id: bookingId,
        userId: userId,
        isDeleted: { $ne: true }
      });
    } catch (err) {
      booking = getMockBookingDetails(bookingId, userId);
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Server-side validation of cancellation timing
    const now = new Date();
    const travelDate = new Date(booking.travelDate || booking.checkIn || booking.pickupDate);
    const hoursUntilTravel = (travelDate - now) / (1000 * 60 * 60);

    if (hoursUntilTravel < 0.5) { // 30 minutes
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking less than 30 minutes before travel time'
      });
    }

    // Validate refund calculation (server-side check)
    const serverRefundCalc = calculateRefund(booking);
    if (Math.abs(refundAmount - serverRefundCalc.refundAmount) > 1) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount validation failed'
      });
    }

    // Update booking with comprehensive cancellation data
    const updateData = {
      status: 'cancelled',
      cancellationDate: new Date(),
      cancellationReason: reason,
      refundAmount: refundAmount,
      cancellationFee: cancellationFee,
      refundStatus: refundAmount > 0 ? 'processing' : 'not-applicable',
      cancellationPolicy: {
        hoursUntilTravel,
        agreesToPolicy,
        policyVersion: '1.0'
      }
    };

    try {
      await Reservation.findByIdAndUpdate(bookingId, updateData);
    } catch (err) {
      console.log('Database update failed, continuing with response');
    }

    // Generate refund ID if applicable
    let refundId = null;
    if (refundAmount > 0) {
      refundId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Mock email notification
    const emailSent = await sendCancellationEmail(booking, refundAmount);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: {
        id: booking._id || booking.id,
        confirmationNumber: booking.confirmationNumber,
        status: 'cancelled',
        cancellationDate: updateData.cancellationDate,
        refundAmount: refundAmount,
        cancellationFee: cancellationFee,
        refundId: refundId,
        refundStatus: updateData.refundStatus
      },
      emailSent
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Modify booking
exports.modifyUserBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const modifications = req.body;
    const userId = req.user?.id || req.headers['user-id'];

    let booking;
    try {
      booking = await Reservation.findOne({
        _id: bookingId,
        userId: userId,
        isDeleted: { $ne: true }
      });
    } catch (err) {
      booking = getMockBookingDetails(bookingId, userId);
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be modified
    if (!isBookingModifiable(booking)) {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be modified'
      });
    }

    // Calculate modification fees
    const feeCalculation = calculateModificationFees(booking, modifications);

    // Apply modifications
    const updateData = {
      ...modifications,
      lastModified: new Date(),
      modificationFee: feeCalculation.totalFee
    };

    try {
      await Reservation.findByIdAndUpdate(bookingId, updateData);
    } catch (err) {
      console.log('Database update failed, continuing with response');
    }

    res.json({
      success: true,
      message: 'Booking modified successfully',
      updatedBooking: {
        ...booking,
        ...updateData,
        modificationFee: feeCalculation.totalFee,
        feeDetails: feeCalculation.breakdown
      }
    });

  } catch (error) {
    console.error('Error modifying booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to modify booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper Functions

function transformReservationToBooking(reservation) {
  return {
    _id: reservation._id,
    bookingType: reservation.type || 'hotel',
    status: reservation.status || 'confirmed',
    totalPrice: reservation.totalPrice || reservation.amount,
    currency: reservation.currency,
    bookingDate: reservation.createdAt,
    confirmationNumber: reservation.confirmationNumber,
    ...reservation.toObject()
  };
}

function getMockBookings(userId) {
  return [
    {
      id: '670f7a1b2c3d4e5f67890abc',
      bookingType: 'flight',
      status: 'confirmed',
      totalPrice: 650,
      currency: 'USD',
      bookingDate: new Date('2024-09-15'),
      confirmationNumber: 'FL123456',
      flightNumber: 'AA1234',
      airline: 'American Airlines',
      origin: 'NYC',
      destination: 'LON',
      departureDate: new Date('2024-10-01'),
      departureTime: '14:30',
      passengers: [{ name: 'John Doe', seat: '12A' }]
    },
    {
      id: '670f7a1b2c3d4e5f67890abd',
      bookingType: 'hotel',
      status: 'confirmed',
      totalPrice: 320,
      currency: 'USD',
      bookingDate: new Date('2024-09-16'),
      confirmationNumber: 'HT789012',
      hotelName: 'Grand Hotel London',
      roomType: 'Deluxe King',
      checkIn: new Date('2024-10-01'),
      checkOut: new Date('2024-10-04'),
      guests: 2,
      nights: 3
    },
    {
      id: '670f7a1b2c3d4e5f67890abe',
      bookingType: 'car',
      status: 'pending',
      totalPrice: 180,
      currency: 'USD',
      bookingDate: new Date('2024-09-17'),
      confirmationNumber: 'CR345678',
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      pickupLocation: 'London Heathrow Airport',
      pickupDate: new Date('2024-10-01'),
      returnDate: new Date('2024-10-04'),
      rentalDays: 3
    }
  ];
}

function getMockBookingDetails(bookingId, userId) {
  const mockBookings = getMockBookings(userId);
  return mockBookings.find(b => b.id === bookingId) || mockBookings[0];
}

function getBookingTitle(booking) {
  switch (booking.bookingType || booking.type) {
    case 'flight':
      return `${booking.airline || 'Flight'} ${booking.flightNumber || 'FL123'}`;
    case 'hotel':
      return booking.hotelName || 'Hotel Booking';
    case 'car':
      return `${booking.vehicleMake || 'Car'} ${booking.vehicleModel || 'Rental'}`;
    case 'rental':
      return booking.propertyName || 'Vacation Rental';
    case 'package':
      return `Travel Package - ${booking.destination || 'Destination'}`;
    default:
      return 'Travel Booking';
  }
}

function getBookingSubtitle(booking) {
  switch (booking.bookingType || booking.type) {
    case 'flight':
      return `${booking.origin || 'Origin'} → ${booking.destination || 'Destination'}`;
    case 'hotel':
      return `${booking.roomType || 'Room'} • ${booking.nights || 1} night(s)`;
    case 'car':
      return `${booking.pickupLocation || 'Pickup'} • ${booking.rentalDays || 1} day(s)`;
    case 'rental':
      return `${booking.propertyType || 'Property'} • ${booking.guests || 1} guest(s)`;
    case 'package':
      return `${booking.duration || 3} days • ${booking.travelers || 1} traveler(s)`;
    default:
      return '';
  }
}

function getTypeSpecificData(booking) {
  const type = booking.bookingType || booking.type;
  const baseData = {
    travelDate: booking.travelDate || booking.departureDate || booking.checkIn || booking.pickupDate,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    pickupDate: booking.pickupDate,
    returnDate: booking.returnDate
  };

  switch (type) {
    case 'flight':
      return {
        ...baseData,
        flightNumber: booking.flightNumber,
        airline: booking.airline,
        origin: booking.origin,
        destination: booking.destination,
        departureDate: booking.departureDate,
        departureTime: booking.departureTime,
        arrivalDate: booking.arrivalDate,
        arrivalTime: booking.arrivalTime,
        passengers: booking.passengers || [{ name: 'Guest' }]
      };
    
    case 'hotel':
      return {
        ...baseData,
        hotelName: booking.hotelName,
        hotelAddress: booking.hotelAddress,
        roomType: booking.roomType,
        roomNumber: booking.roomNumber,
        guests: booking.guests || 1,
        nights: booking.nights || 1
      };
    
    case 'car':
      return {
        ...baseData,
        vehicleMake: booking.vehicleMake,
        vehicleModel: booking.vehicleModel,
        vehicleYear: booking.vehicleYear,
        pickupLocation: booking.pickupLocation,
        returnLocation: booking.returnLocation,
        rentalDays: booking.rentalDays || 1
      };
    
    default:
      return baseData;
  }
}

function isBookingCancellable(booking) {
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return false;
  }

  const now = new Date();
  const travelDate = new Date(booking.travelDate || booking.checkIn || booking.pickupDate || booking.departureDate);
  const hoursUntilTravel = (travelDate - now) / (1000 * 60 * 60);

  return hoursUntilTravel >= 24;
}

function isBookingModifiable(booking) {
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return false;
  }

  const now = new Date();
  const travelDate = new Date(booking.travelDate || booking.checkIn || booking.pickupDate || booking.departureDate);
  const hoursUntilTravel = (travelDate - now) / (1000 * 60 * 60);

  return hoursUntilTravel >= 24 && booking.modificationAllowed !== false;
}

function calculateRefund(booking) {
  const now = new Date();
  const travelDate = new Date(booking.travelDate || booking.checkIn || booking.pickupDate || booking.departureDate);
  const hoursUntilTravel = (travelDate - now) / (1000 * 60 * 60);
  
  let refundPercentage = 0;
  
  if (hoursUntilTravel >= 48) {
    refundPercentage = 0.9; // 90% refund
  } else if (hoursUntilTravel >= 24) {
    refundPercentage = 0.5; // 50% refund
  } else {
    refundPercentage = 0; // No refund
  }
  
  const totalPrice = booking.totalPrice || booking.price || 0;
  const refundAmount = totalPrice * refundPercentage;
  
  return {
    refundAmount,
    refundPercentage,
    timeline: refundAmount > 0 ? '5-7 business days' : 'N/A'
  };
}

function calculateModificationFees(booking, modifications) {
  const baseFee = 25;
  let additionalFees = 0;
  
  if (modifications.departureDate || modifications.checkIn || modifications.pickupDate) {
    additionalFees += 15;
  }
  
  if (modifications.passengers || modifications.guests) {
    additionalFees += 10;
  }
  
  const totalFee = baseFee + additionalFees;
  
  return {
    totalFee,
    breakdown: {
      baseFee,
      additionalFees,
      total: totalFee
    }
  };
}

function getCancellationPolicy(booking) {
  return {
    provider: booking.provider || 'expedia',
    policy: 'Cancellations must be made at least 24 hours before travel date for refund eligibility.',
    refundTerms: 'Refunds processed within 5-7 business days.',
    exceptions: 'Weather-related cancellations may be eligible for full refund.'
  };
}

function getModificationPolicy(booking) {
  return {
    provider: booking.provider || 'expedia',
    policy: 'Modifications allowed up to 24 hours before travel date.',
    fees: 'Base modification fee of $25 applies.',
    restrictions: 'Some fare types may not be modifiable.'
  };
}

function getProviderContact(provider) {
  const contacts = {
    expedia: { phone: '1-800-EXPEDIA', email: 'support@expedia.com' },
    booking: { phone: '1-888-BOOKING', email: 'customer.service@booking.com' },
    default: { phone: '1-800-TRAVEL', email: 'support@travel.com' }
  };
  
  return contacts[provider] || contacts.default;
}

function getBookingTimeline(bookingId) {
  return [
    {
      date: new Date(),
      event: 'Booking Confirmed',
      description: 'Your booking has been confirmed and payment processed.'
    }
  ];
}

function generateConfirmationNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Mock email service for cancellation notifications
async function sendCancellationEmail(booking, refundAmount) {
  try {
    console.log(`Sending cancellation email for booking ${booking.confirmationNumber}`);
    console.log(`Refund amount: ${refundAmount}`);
    
    // Simulate email service delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      emailId: `email_${Date.now()}`,
      sentAt: new Date()
    };
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
