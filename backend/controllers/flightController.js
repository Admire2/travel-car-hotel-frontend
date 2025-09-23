const Flight = require('../models/flight');
const Booking = require('../models/booking');

// Mock airline data for Skyscanner integration
const airlines = [
  {
    code: 'AA',
    name: 'American Airlines',
    logo: 'https://via.placeholder.com/40x40/0078d4/ffffff?text=AA'
  },
  {
    code: 'DL',
    name: 'Delta Air Lines',
    logo: 'https://via.placeholder.com/40x40/003366/ffffff?text=DL'
  },
  {
    code: 'UA',
    name: 'United Airlines',
    logo: 'https://via.placeholder.com/40x40/002244/ffffff?text=UA'
  },
  {
    code: 'BA',
    name: 'British Airways',
    logo: 'https://via.placeholder.com/40x40/1e3a8a/ffffff?text=BA'
  },
  {
    code: 'LH',
    name: 'Lufthansa',
    logo: 'https://via.placeholder.com/40x40/f9c74f/000000?text=LH'
  }
];

// Generate mock flight data for Skyscanner integration
const generateMockFlights = (searchData) => {
  const flights = [];
  const { origin, destination, departureDate, passengerCount } = searchData;

  for (let i = 0; i < 12; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const basePrice = 200 + Math.random() * 800;
    const duration = 120 + Math.random() * 480; // 2-10 hours
    const stops = Math.random() > 0.6 ? 0 : Math.floor(Math.random() * 2) + 1;
    
    const depDate = new Date(departureDate);
    const depHour = 6 + Math.random() * 18;
    depDate.setHours(depHour, Math.random() * 60);
    
    const arrDate = new Date(depDate.getTime() + duration * 60000);
    
    flights.push({
      id: `FL${1000 + i}`,
      airline: airline,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureTime: depDate.toISOString(),
      arrivalTime: arrDate.toISOString(),
      duration: Math.round(duration),
      stops: stops,
      price: Math.round(basePrice * passengerCount),
      availability: Math.floor(Math.random() * 50) + 10,
      bookingClass: 'Economy',
      aircraft: 'Boeing 737-800'
    });
  }

  return flights.sort((a, b) => a.price - b.price);
};

// Search flights - Updated for FlightSearch component
exports.searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, passengerCount, tripType } = req.method === 'POST' ? req.body : req.query;

    // Support both GET (legacy) and POST (new FlightSearch component)
    if (req.method === 'GET') {
      // Legacy support
      const { from, to, date } = req.query;
      const query = {};
      if (from) query['departureAirport.city'] = from;
      if (to) query['arrivalAirport.city'] = to;
      if (date) query.departureTime = { $gte: new Date(date) };
      const flights = await Flight.find(query);
      return res.json(flights);
    }

    // New FlightSearch component logic
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: origin, destination, departureDate'
      });
    }

    if (passengerCount < 1 || passengerCount > 9) {
      return res.status(400).json({
        success: false,
        message: 'Passenger count must be between 1 and 9'
      });
    }

    const depDate = new Date(departureDate);
    if (isNaN(depDate.getTime()) || depDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or past departure date'
      });
    }

    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 1500));

    const outboundFlights = generateMockFlights({
      origin,
      destination,
      departureDate,
      passengerCount
    });

    let returnFlights = [];
    if (tripType === 'roundtrip' && returnDate) {
      returnFlights = generateMockFlights({
        origin: destination,
        destination: origin,
        departureDate: returnDate,
        passengerCount
      });
    }

    console.log(`Flight search: ${origin} → ${destination}, ${departureDate}, ${passengerCount} passengers`);

    res.json({
      success: true,
      searchId: `SEARCH_${Date.now()}`,
      flights: outboundFlights,
      returnFlights: returnFlights,
      searchCriteria: {
        origin,
        destination,
        departureDate,
        returnDate,
        passengerCount,
        tripType
      },
      metadata: {
        totalResults: outboundFlights.length,
        searchTime: new Date().toISOString(),
        currency: 'USD'
      }
    });

  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during flight search',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Book flight - Updated for FlightSearch component
exports.bookFlight = async (req, res) => {
  try {
    const { flightId, passengerCount, searchCriteria, passengerDetails, userId } = req.body;

    // Support legacy format
    if (!flightId && req.body.userId && req.body.flight) {
      const booking = await Booking.create({
        user: req.body.userId,
        bookingType: 'flight',
        flight: req.body.flightId,
        passengers: req.body.passengers,
        status: 'pending'
      });
      return res.json(booking);
    }

    // New FlightSearch component logic
    if (!flightId || !passengerCount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: flightId, passengerCount'
      });
    }

    // Simulate booking process delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const bookingId = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const confirmationNumber = `${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // In production: validate availability, process payment, save to database
    const booking = {
      bookingId,
      confirmationNumber,
      flightId,
      status: 'confirmed',
      passengerCount,
      totalPrice: 299 * passengerCount, // Mock calculation
      currency: 'USD',
      bookingDate: new Date().toISOString(),
      paymentStatus: 'paid',
      flight: {
        origin: searchCriteria?.origin || 'LAX',
        destination: searchCriteria?.destination || 'JFK',
        departureDate: searchCriteria?.departureDate || new Date().toISOString(),
        airline: 'American Airlines'
      }
    };

    // Save to database
    try {
      await Booking.create({
        bookingId,
        user: userId || 'guest',
        bookingType: 'flight',
        flight: flightId,
        passengers: passengerCount,
        status: 'confirmed',
        totalAmount: booking.totalPrice,
        confirmationNumber
      });
    } catch (dbError) {
      console.log('Database save failed, continuing with mock response:', dbError.message);
    }

    console.log(`Flight booking created: ${bookingId} for flight ${flightId}`);

    res.json({
      success: true,
      message: 'Flight booked successfully',
      booking
    });

  } catch (error) {
    console.error('Flight booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing flight booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cancel flight booking
exports.cancelFlightBooking = async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled' }, { new: true });
  res.json(booking);
};
