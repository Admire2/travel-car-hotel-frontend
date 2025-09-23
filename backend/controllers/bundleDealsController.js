// bundleDealsController.js - Bundle deals controller with Expedia package API integration

const Booking = require('../models/booking');

// Mock Expedia Bundle API Data
const mockBundleData = {
  packages: [
    {
      id: 'bundle-deluxe-001',
      type: 'Deluxe Package',
      description: 'Perfect combination of comfort and luxury',
      destinations: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas'],
      savings: {
        percentage: 25,
        amount: 584
      },
      services: {
        flight: {
          airline: 'American Airlines',
          flightNumber: 'AA 1234',
          class: 'Economy',
          details: 'Direct flight, 5h 30m',
          individualPrice: 450
        },
        hotel: {
          name: 'Grand Hotel Downtown',
          stars: 4,
          details: '3 nights, Standard Room, Free WiFi',
          amenities: ['Pool', 'Gym', 'Restaurant', 'Business Center'],
          individualPrice: 420
        },
        car: {
          company: 'Enterprise',
          category: 'Full-size',
          model: 'Toyota Camry or similar',
          details: '4 days rental, Unlimited mileage',
          features: ['GPS', 'Bluetooth', 'Backup Camera'],
          individualPrice: 280
        }
      },
      totalIndividualPrice: 1150,
      bundlePrice: 566,
      features: [
        'Free cancellation up to 24 hours',
        'Earn triple rewards points',
        'Priority check-in',
        'Free upgrade (subject to availability)',
        '24/7 customer support',
        'Price match guarantee'
      ]
    },
    {
      id: 'bundle-premium-002',
      type: 'Premium Package',
      description: 'Ultimate travel experience with premium services',
      destinations: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas'],
      savings: {
        percentage: 30,
        amount: 780
      },
      services: {
        flight: {
          airline: 'Delta Airlines',
          flightNumber: 'DL 5678',
          class: 'Business',
          details: 'Direct flight, 5h 25m, Priority boarding',
          individualPrice: 850
        },
        hotel: {
          name: 'Luxury Resort & Spa',
          stars: 5,
          details: '3 nights, Deluxe Suite, Ocean view',
          amenities: ['Spa', 'Pool', 'Fine Dining', 'Concierge', 'Valet Parking'],
          individualPrice: 750
        },
        car: {
          company: 'Hertz',
          category: 'Luxury',
          model: 'BMW 5 Series or similar',
          details: '4 days rental, Premium insurance included',
          features: ['GPS', 'Leather Seats', 'Sunroof', 'Premium Audio'],
          individualPrice: 480
        }
      },
      totalIndividualPrice: 2080,
      bundlePrice: 1300,
      features: [
        'Free cancellation up to 24 hours',
        'Earn quadruple rewards points',
        'VIP lounge access',
        'Complimentary room upgrade',
        '24/7 concierge service',
        'Price match guarantee',
        'Late checkout',
        'Welcome amenities'
      ]
    },
    {
      id: 'bundle-economy-003',
      type: 'Economy Package',
      description: 'Best value for budget-conscious travelers',
      destinations: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas'],
      savings: {
        percentage: 20,
        amount: 320
      },
      services: {
        flight: {
          airline: 'Southwest Airlines',
          flightNumber: 'SW 9012',
          class: 'Economy',
          details: '1 stop, 7h 15m total travel time',
          individualPrice: 320
        },
        hotel: {
          name: 'Comfort Inn Downtown',
          stars: 3,
          details: '3 nights, Standard Room, Continental breakfast',
          amenities: ['WiFi', 'Parking', 'Fitness Center'],
          individualPrice: 240
        },
        car: {
          company: 'Budget',
          category: 'Compact',
          model: 'Nissan Versa or similar',
          details: '4 days rental, Basic insurance',
          features: ['Air Conditioning', 'Radio'],
          individualPrice: 160
        }
      },
      totalIndividualPrice: 720,
      bundlePrice: 400,
      features: [
        'Free cancellation up to 48 hours',
        'Earn standard rewards points',
        'Basic customer support',
        'Price protection for 24 hours'
      ]
    }
  ]
};

// Additional destination-specific data
const destinationData = {
  'New York': {
    popularAttractions: ['Statue of Liberty', 'Central Park', 'Times Square', 'Empire State Building'],
    climate: 'Continental climate with four distinct seasons',
    airport: 'JFK International Airport',
    popularHotels: ['The Plaza', 'The St. Regis', 'The Carlyle'],
    localTips: 'Best time to visit is spring (April-June) or fall (September-November)'
  },
  'Los Angeles': {
    popularAttractions: ['Hollywood Walk of Fame', 'Santa Monica Pier', 'Getty Center', 'Griffith Observatory'],
    climate: 'Mediterranean climate with mild, wet winters and warm, dry summers',
    airport: 'Los Angeles International Airport (LAX)',
    popularHotels: ['The Beverly Hills Hotel', 'Chateau Marmont', 'The Standard'],
    localTips: 'Traffic can be heavy; consider staying near your planned activities'
  },
  'Chicago': {
    popularAttractions: ['Millennium Park', 'Navy Pier', 'Art Institute of Chicago', 'Willis Tower'],
    climate: 'Continental climate with hot summers and cold winters',
    airport: 'O\'Hare International Airport',
    popularHotels: ['The Drake', 'Palmer House', 'The Langham'],
    localTips: 'Windy city - bring layers and comfortable walking shoes'
  },
  'Miami': {
    popularAttractions: ['South Beach', 'Art Deco District', 'Vizcaya Museum', 'Little Havana'],
    climate: 'Tropical climate with warm temperatures year-round',
    airport: 'Miami International Airport',
    popularHotels: ['The Fontainebleau', 'The Setai', 'W South Beach'],
    localTips: 'Hurricane season runs from June to November'
  },
  'Las Vegas': {
    popularAttractions: ['The Strip', 'Bellagio Fountains', 'Red Rock Canyon', 'Fremont Street'],
    climate: 'Desert climate with hot summers and mild winters',
    airport: 'McCarran International Airport',
    popularHotels: ['Bellagio', 'The Venetian', 'MGM Grand'],
    localTips: 'Stay hydrated and wear sunscreen; temperatures can be extreme'
  }
};

// Search bundle deals
exports.searchBundles = async (req, res) => {
  try {
    const {
      from,
      to,
      departDate,
      returnDate,
      travelers,
      rooms,
      flightClass,
      hotelStars,
      carType,
      budget
    } = req.body;

    // Validate required fields
    if (!from || !to || !departDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: from, to, departDate, returnDate'
      });
    }

    // Calculate trip duration
    const startDate = new Date(departDate);
    const endDate = new Date(returnDate);
    const tripDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (tripDuration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be after departure date'
      });
    }

    // Filter packages based on destination and preferences
    let availablePackages = mockBundleData.packages.filter(pkg => {
      return pkg.destinations.includes(to);
    });

    // Apply preference filters
    if (flightClass && flightClass !== 'any') {
      availablePackages = availablePackages.filter(pkg => 
        pkg.services.flight.class.toLowerCase() === flightClass.toLowerCase()
      );
    }

    if (hotelStars && hotelStars !== 'any') {
      const minStars = parseInt(hotelStars);
      availablePackages = availablePackages.filter(pkg => 
        pkg.services.hotel.stars >= minStars
      );
    }

    if (carType && carType !== 'any') {
      availablePackages = availablePackages.filter(pkg => 
        pkg.services.car.category.toLowerCase().includes(carType.toLowerCase())
      );
    }

    if (budget && budget !== 'any') {
      const maxBudget = parseInt(budget);
      availablePackages = availablePackages.filter(pkg => 
        pkg.bundlePrice <= maxBudget
      );
    }

    // Adjust prices based on trip duration and travelers
    const processedPackages = availablePackages.map(pkg => {
      const baseBundlePrice = pkg.bundlePrice;
      const baseIndividualPrice = pkg.totalIndividualPrice;
      
      // Adjust hotel price based on trip duration (base is 3 nights)
      const hotelPricePerNight = pkg.services.hotel.individualPrice / 3;
      const adjustedHotelPrice = hotelPricePerNight * tripDuration;
      
      // Adjust car price based on trip duration (base is 4 days)
      const carPricePerDay = pkg.services.car.individualPrice / 4;
      const adjustedCarPrice = carPricePerDay * (tripDuration + 1); // +1 for pickup day
      
      // Calculate adjusted prices
      const adjustedIndividualTotal = pkg.services.flight.individualPrice + adjustedHotelPrice + adjustedCarPrice;
      const adjustedBundlePrice = Math.round(adjustedIndividualTotal * (1 - pkg.savings.percentage / 100));
      const adjustedSavings = adjustedIndividualTotal - adjustedBundlePrice;
      
      // Multiply by number of travelers for flight and hotel
      const totalIndividualPrice = Math.round(
        (pkg.services.flight.individualPrice + adjustedHotelPrice) * travelers + adjustedCarPrice
      );
      const totalBundlePrice = Math.round(
        ((pkg.services.flight.individualPrice + adjustedHotelPrice) * travelers + adjustedCarPrice) * 
        (1 - pkg.savings.percentage / 100)
      );
      
      return {
        ...pkg,
        services: {
          ...pkg.services,
          hotel: {
            ...pkg.services.hotel,
            individualPrice: adjustedHotelPrice,
            details: `${tripDuration} nights, ${pkg.services.hotel.details.split(', ').slice(1).join(', ')}`
          },
          car: {
            ...pkg.services.car,
            individualPrice: adjustedCarPrice,
            details: `${tripDuration + 1} days rental, ${pkg.services.car.details.split(', ').slice(1).join(', ')}`
          }
        },
        totalIndividualPrice,
        bundlePrice: totalBundlePrice,
        savings: {
          percentage: pkg.savings.percentage,
          amount: totalIndividualPrice - totalBundlePrice
        },
        travelers,
        rooms,
        tripDuration
      };
    });

    // Sort by savings amount (highest first)
    processedPackages.sort((a, b) => b.savings.amount - a.savings.amount);

    // Get destination information
    const destinationInfo = destinationData[to] || {
      popularAttractions: [],
      climate: 'Information not available',
      airport: 'Local airport',
      popularHotels: [],
      localTips: 'Plan ahead and check local weather'
    };

    res.json({
      success: true,
      data: {
        packages: processedPackages,
        searchParams: {
          from,
          to,
          departDate,
          returnDate,
          travelers,
          rooms,
          tripDuration,
          flightClass,
          hotelStars,
          carType,
          budget
        },
        destinationInfo,
        totalResults: processedPackages.length
      }
    });

  } catch (error) {
    console.error('Bundle search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bundle search',
      error: error.message
    });
  }
};

// Get bundle details by ID
exports.getBundleDetails = async (req, res) => {
  try {
    const { bundleId } = req.params;
    
    const bundle = mockBundleData.packages.find(pkg => pkg.id === bundleId);
    
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle package not found'
      });
    }

    res.json({
      success: true,
      data: bundle
    });

  } catch (error) {
    console.error('Get bundle details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Book bundle package
exports.bookBundle = async (req, res) => {
  try {
    const {
      bundleId,
      passengerDetails,
      contactInfo,
      paymentInfo,
      preferences,
      searchParams
    } = req.body;

    // Validate required fields
    if (!bundleId || !passengerDetails || !contactInfo || !paymentInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Find the bundle package
    const bundle = mockBundleData.packages.find(pkg => pkg.id === bundleId);
    
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle package not found'
      });
    }

    // Generate booking confirmation number
    const confirmationNumber = 'BDL' + Date.now().toString().slice(-8);

    // Calculate final pricing (in real implementation, this would be more complex)
    const finalPricing = {
      flightPrice: bundle.services.flight.individualPrice * searchParams.travelers,
      hotelPrice: bundle.services.hotel.individualPrice * searchParams.travelers,
      carPrice: bundle.services.car.individualPrice,
      subtotal: bundle.totalIndividualPrice,
      discount: bundle.savings.amount,
      total: bundle.bundlePrice,
      taxes: Math.round(bundle.bundlePrice * 0.12), // 12% tax rate
      finalTotal: Math.round(bundle.bundlePrice * 1.12)
    };

    // Create booking record
    const bookingData = {
      type: 'bundle',
      confirmationNumber,
      status: 'confirmed',
      bundleId,
      searchParams,
      passengerDetails,
      contactInfo,
      services: {
        flight: {
          ...bundle.services.flight,
          departDate: searchParams.departDate,
          returnDate: searchParams.returnDate,
          from: searchParams.from,
          to: searchParams.to,
          passengers: searchParams.travelers
        },
        hotel: {
          ...bundle.services.hotel,
          checkIn: searchParams.departDate,
          checkOut: searchParams.returnDate,
          guests: searchParams.travelers,
          rooms: searchParams.rooms
        },
        car: {
          ...bundle.services.car,
          pickupDate: searchParams.departDate,
          dropoffDate: searchParams.returnDate,
          pickupLocation: searchParams.to,
          dropoffLocation: searchParams.to
        }
      },
      pricing: finalPricing,
      preferences,
      bookingDate: new Date(),
      lastModified: new Date()
    };

    // Save booking to database
    const booking = new Booking(bookingData);
    await booking.save();

    // In a real implementation, you would:
    // 1. Process payment with payment provider
    // 2. Make actual API calls to book each service
    // 3. Send confirmation emails
    // 4. Update inventory/availability

    // Mock booking confirmations for each service
    const serviceConfirmations = {
      flight: {
        confirmationNumber: 'FL' + Date.now().toString().slice(-6),
        airline: bundle.services.flight.airline,
        flightNumber: bundle.services.flight.flightNumber,
        status: 'confirmed'
      },
      hotel: {
        confirmationNumber: 'HT' + Date.now().toString().slice(-6),
        hotelName: bundle.services.hotel.name,
        status: 'confirmed'
      },
      car: {
        confirmationNumber: 'CR' + Date.now().toString().slice(-6),
        company: bundle.services.car.company,
        status: 'confirmed'
      }
    };

    res.json({
      success: true,
      data: {
        confirmationNumber,
        bundleDetails: bundle,
        pricing: finalPricing,
        serviceConfirmations,
        bookingStatus: 'confirmed',
        estimatedProcessingTime: '2-4 hours',
        supportContact: {
          phone: '1-800-BUNDLE-1',
          email: 'support@travelbundles.com',
          hours: '24/7'
        },
        nextSteps: [
          'Check your email for detailed confirmation',
          'Download mobile boarding passes 24 hours before flight',
          'Complete online check-in for hotel',
          'Review car rental pickup instructions'
        ]
      }
    });

  } catch (error) {
    console.error('Bundle booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Booking failed due to technical error',
      error: error.message
    });
  }
};

// Get user's bundle bookings
exports.getUserBundles = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const bookings = await Booking.find({ 
      userId,
      type: 'bundle'
    }).sort({ bookingDate: -1 });

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Get user bundles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bundle bookings',
      error: error.message
    });
  }
};

// Cancel bundle booking
exports.cancelBundle = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.type !== 'bundle') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking type for bundle cancellation'
      });
    }

    // Check cancellation policy (24 hours free cancellation)
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const hoursSinceBooking = (now - bookingDate) / (1000 * 60 * 60);
    
    let cancellationFee = 0;
    if (hoursSinceBooking > 24) {
      // Apply cancellation fee based on package type
      cancellationFee = Math.round(booking.pricing.total * 0.15); // 15% fee
    }

    const refundAmount = booking.pricing.finalTotal - cancellationFee;

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellation = {
      date: new Date(),
      reason: reason || 'Customer request',
      fee: cancellationFee,
      refundAmount: refundAmount,
      refundStatus: 'processing'
    };
    booking.lastModified = new Date();

    await booking.save();

    res.json({
      success: true,
      data: {
        message: 'Bundle booking cancelled successfully',
        refundAmount,
        cancellationFee,
        refundProcessingTime: '3-5 business days',
        cancellationDetails: booking.cancellation
      }
    });

  } catch (error) {
    console.error('Bundle cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel bundle booking',
      error: error.message
    });
  }
};

// Get popular bundle destinations
exports.getPopularDestinations = async (req, res) => {
  try {
    const popularDestinations = Object.keys(destinationData).map(destination => ({
      city: destination,
      ...destinationData[destination],
      averageBundlePrice: mockBundleData.packages
        .filter(pkg => pkg.destinations.includes(destination))
        .reduce((sum, pkg) => sum + pkg.bundlePrice, 0) / 
        mockBundleData.packages.filter(pkg => pkg.destinations.includes(destination)).length || 0
    }));

    res.json({
      success: true,
      data: popularDestinations
    });

  } catch (error) {
    console.error('Get popular destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve popular destinations',
      error: error.message
    });
  }
};

module.exports = exports;