const Hotel = require('../models/hotel');
const Booking = require('../models/booking');

// Generate mock hotel data with Booking.com-style information
const generateMockHotels = (destination, checkIn, checkOut, adults, children, rooms) => {
  const hotelNames = [
    'Grand Plaza Hotel', 'Luxury Suites Downtown', 'Oceanview Resort', 'Business Inn Express',
    'Historic Boutique Hotel', 'Modern City Hotel', 'Seaside Paradise Resort', 'Mountain View Lodge',
    'Executive Business Hotel', 'Cozy Bed & Breakfast', 'Luxury Spa Resort', 'Airport Hotel Express',
    'Riverside Hotel', 'Downtown Boutique', 'Family Resort & Suites', 'Eco-Friendly Lodge'
  ];

  const amenities = [
    ['Free WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar'],
    ['Free WiFi', 'Business Center', 'Meeting Rooms', 'Concierge'],
    ['Pool', 'Beach Access', 'Water Sports', 'Kids Club', 'All-Inclusive'],
    ['Free WiFi', 'Parking', '24/7 Front Desk', 'Express Check-in'],
    ['WiFi', 'Historic Charm', 'Boutique Rooms', 'Fine Dining'],
    ['Modern Amenities', 'City Views', 'Rooftop Bar', 'Conference Rooms'],
    ['Ocean Views', 'Private Beach', 'Water Activities', 'Sunset Deck'],
    ['Mountain Views', 'Hiking Trails', 'Fireplace', 'Nature Tours']
  ];

  const descriptions = [
    'Elegant accommodations in the heart of the city with premium amenities and exceptional service.',
    'Modern luxury meets classic comfort in our beautifully appointed suites and rooms.',
    'Stunning oceanfront location with world-class amenities and breathtaking views.',
    'Convenient location perfect for business travelers with all essential amenities.',
    'Charming historic property with unique character and personalized service.',
    'Contemporary design and modern conveniences in a prime downtown location.',
    'Paradise found with pristine beaches and endless recreational activities.',
    'Peaceful mountain retreat offering tranquility and natural beauty.'
  ];

  const locations = [
    'Downtown District', 'Financial Quarter', 'Beachfront Area', 'Airport Zone',
    'Historic Center', 'Business District', 'Coastal Area', 'Mountain Region'
  ];

  const hotels = [];
  const numberOfHotels = Math.floor(Math.random() * 8) + 8; // 8-15 hotels

  for (let i = 0; i < numberOfHotels; i++) {
    const hotelIndex = i % hotelNames.length;
    const basePrice = Math.floor(Math.random() * 400) + 80; // $80-$480
    const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0-5.0
    const starRating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
    const reviews = Math.floor(Math.random() * 2000) + 100; // 100-2100 reviews

    hotels.push({
      id: `hotel_${i + 1}`,
      name: hotelNames[hotelIndex],
      location: `${locations[hotelIndex]}, ${destination}`,
      price: basePrice,
      starRating: starRating,
      rating: parseFloat(rating),
      reviews: reviews,
      image: `https://images.unsplash.com/photo-${1566073112831 + i}-4c3dff4e0bc3?w=400&h=300&fit=crop&crop=center`,
      amenities: amenities[hotelIndex] || amenities[0],
      description: descriptions[hotelIndex] || descriptions[0],
      freeCancellation: Math.random() > 0.3, // 70% chance of free cancellation
      checkIn: checkIn,
      checkOut: checkOut,
      availability: {
        adults: adults,
        children: children,
        rooms: rooms,
        available: true
      }
    });
  }

  return hotels.sort((a, b) => {
    // Sort by a combination of rating and price (value for money)
    const aValue = (a.rating / 5) * 0.7 + ((500 - a.price) / 500) * 0.3;
    const bValue = (b.rating / 5) * 0.7 + ((500 - b.price) / 500) * 0.3;
    return bValue - aValue;
  });
};

// Search hotels with mock Booking.com API integration
exports.searchHotels = async (req, res) => {
  try {
    const { destination, checkIn, checkOut, adults = 2, children = 0, rooms = 1 } = req.query;

    if (!destination || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Destination, check-in, and check-out dates are required'
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate mock hotel data
    const hotels = generateMockHotels(destination, checkIn, checkOut, parseInt(adults), parseInt(children), parseInt(rooms));

    res.json({
      success: true,
      hotels: hotels,
      searchParams: {
        destination,
        checkIn,
        checkOut,
        adults: parseInt(adults),
        children: parseInt(children),
        rooms: parseInt(rooms)
      },
      totalResults: hotels.length
    });

  } catch (error) {
    console.error('Hotel search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search hotels. Please try again.',
      error: error.message
    });
  }
};

// Book hotel
exports.bookHotel = async (req, res) => {
  try {
    const { 
      hotelId, 
      destination, 
      checkIn, 
      checkOut, 
      adults, 
      children, 
      rooms, 
      totalPrice,
      userId = 'guest_user' 
    } = req.body;

    if (!hotelId || !destination || !checkIn || !checkOut || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Generate booking ID
    const bookingId = `HB${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Create booking record (in a real app, this would be saved to database)
    const bookingData = {
      bookingId: bookingId,
      type: 'hotel',
      hotelId: hotelId,
      destination: destination,
      checkIn: checkIn,
      checkOut: checkOut,
      nights: nights,
      guests: {
        adults: parseInt(adults),
        children: parseInt(children)
      },
      rooms: parseInt(rooms),
      totalPrice: parseFloat(totalPrice),
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      userId: userId
    };

    // In a real application, save to database
    // const booking = await Booking.create(bookingData);

    // Simulate booking processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    res.json({
      success: true,
      message: 'Hotel booked successfully!',
      bookingId: bookingId,
      booking: bookingData,
      confirmationNumber: bookingId
    });

  } catch (error) {
    console.error('Hotel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book hotel. Please try again.',
      error: error.message
    });
  }
};

// Cancel hotel booking
exports.cancelHotelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // In a real application, update booking status in database
    // const booking = await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled' }, { new: true });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      bookingId: bookingId,
      cancellationDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Hotel cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking. Please try again.',
      error: error.message
    });
  }
};

// Get hotel details
exports.getHotelDetails = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // In a real application, fetch from database
    // const hotel = await Hotel.findById(hotelId);

    // For demo, return mock hotel details
    const mockHotel = {
      id: hotelId,
      name: 'Grand Plaza Hotel',
      description: 'Luxury hotel in the heart of the city with world-class amenities and exceptional service.',
      images: [
        'https://images.unsplash.com/photo-1566073112831-4c3dff4e0bc3?w=800&h=600',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600'
      ],
      amenities: ['Free WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Concierge', 'Valet Parking'],
      location: {
        address: '123 Main Street',
        city: 'Downtown',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      policies: {
        checkIn: '3:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before check-in',
        pets: 'Pet-friendly with additional fee'
      }
    };

    res.json({
      success: true,
      hotel: mockHotel
    });

  } catch (error) {
    console.error('Get hotel details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get hotel details',
      error: error.message
    });
  }
};
