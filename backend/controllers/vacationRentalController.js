// vacationRentalController.js - Backend controller for vacation rental bookings

// Mock vacation rental data with Airbnb/Vrbo style properties
const mockVacationRentals = [
  {
    id: 'vr_001',
    title: 'Luxury Downtown Loft with City Views',
    location: 'New York, NY',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    type: 'Entire apartment',
    host: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
      isSuperhost: true,
      yearsHosting: 5
    },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
    ],
    specs: {
      guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2
    },
    amenities: [
      'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating',
      'Dedicated workspace', 'TV', 'Hair dryer', 'Iron', 'Gym', 'Pool'
    ],
    pricing: {
      basePrice: 180,
      cleaningFee: 50,
      serviceFee: 35,
      taxes: 28,
      monthlyDiscount: 15
    },
    rating: 4.89,
    reviewCount: 127,
    instantBook: true,
    guestFavorite: true,
    availability: {
      minNights: 2,
      maxNights: 28,
      availableDates: ['2024-01-15', '2024-01-16', '2024-01-17']
    },
    rules: {
      checkIn: '15:00',
      checkOut: '11:00',
      petsAllowed: true,
      smokingAllowed: false,
      partiesAllowed: false
    }
  },
  {
    id: 'vr_002',
    title: 'Cozy Beach House with Ocean Views',
    location: 'Malibu, CA',
    coordinates: { lat: 34.0259, lng: -118.7798 },
    type: 'Entire house',
    host: {
      name: 'Michael Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      isSuperhost: false,
      yearsHosting: 3
    },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=800&h=600&fit=crop'
    ],
    specs: {
      guests: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2
    },
    amenities: [
      'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating',
      'Beachfront', 'Patio', 'BBQ grill', 'Fire pit', 'Hot tub', 'Parking'
    ],
    pricing: {
      basePrice: 350,
      cleaningFee: 85,
      serviceFee: 67,
      taxes: 52,
      monthlyDiscount: 20
    },
    rating: 4.76,
    reviewCount: 89,
    instantBook: false,
    guestFavorite: false,
    availability: {
      minNights: 3,
      maxNights: 14,
      availableDates: ['2024-01-20', '2024-01-21', '2024-01-22']
    },
    rules: {
      checkIn: '16:00',
      checkOut: '10:00',
      petsAllowed: false,
      smokingAllowed: false,
      partiesAllowed: false
    }
  },
  {
    id: 'vr_003',
    title: 'Mountain Cabin Retreat',
    location: 'Aspen, CO',
    coordinates: { lat: 39.1911, lng: -106.8175 },
    type: 'Entire cabin',
    host: {
      name: 'Emily Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      isSuperhost: true,
      yearsHosting: 7
    },
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c735?w=800&h=600&fit=crop'
    ],
    specs: {
      guests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 3
    },
    amenities: [
      'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Heating', 'Fireplace',
      'Mountain view', 'Ski-in/Ski-out', 'Hot tub', 'Parking', 'Game room'
    ],
    pricing: {
      basePrice: 450,
      cleaningFee: 120,
      serviceFee: 89,
      taxes: 68,
      monthlyDiscount: 25
    },
    rating: 4.92,
    reviewCount: 156,
    instantBook: true,
    guestFavorite: true,
    availability: {
      minNights: 5,
      maxNights: 21,
      availableDates: ['2024-02-01', '2024-02-02', '2024-02-03']
    },
    rules: {
      checkIn: '16:00',
      checkOut: '11:00',
      petsAllowed: true,
      smokingAllowed: false,
      partiesAllowed: false
    }
  },
  {
    id: 'vr_004',
    title: 'Modern Studio in Heart of the City',
    location: 'San Francisco, CA',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    type: 'Entire studio',
    host: {
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      isSuperhost: false,
      yearsHosting: 2
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    ],
    specs: {
      guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1
    },
    amenities: [
      'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating',
      'Dedicated workspace', 'TV', 'Hair dryer', 'Iron', 'Elevator'
    ],
    pricing: {
      basePrice: 120,
      cleaningFee: 35,
      serviceFee: 22,
      taxes: 18,
      monthlyDiscount: 10
    },
    rating: 4.65,
    reviewCount: 43,
    instantBook: true,
    guestFavorite: false,
    availability: {
      minNights: 1,
      maxNights: 30,
      availableDates: ['2024-01-18', '2024-01-19', '2024-01-20']
    },
    rules: {
      checkIn: '15:00',
      checkOut: '11:00',
      petsAllowed: false,
      smokingAllowed: false,
      partiesAllowed: false
    }
  },
  {
    id: 'vr_005',
    title: 'Historic Townhouse with Garden',
    location: 'Charleston, SC',
    coordinates: { lat: 32.7767, lng: -79.9311 },
    type: 'Entire townhouse',
    host: {
      name: 'Margaret Thompson',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
      isSuperhost: true,
      yearsHosting: 8
    },
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1520637736862-4d197d17c735?w=800&h=600&fit=crop'
    ],
    specs: {
      guests: 5,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2
    },
    amenities: [
      'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating',
      'Garden', 'Patio', 'Parking', 'Workspace', 'Historic home', 'Piano'
    ],
    pricing: {
      basePrice: 220,
      cleaningFee: 65,
      serviceFee: 42,
      taxes: 33,
      monthlyDiscount: 18
    },
    rating: 4.88,
    reviewCount: 112,
    instantBook: false,
    guestFavorite: true,
    availability: {
      minNights: 2,
      maxNights: 14,
      availableDates: ['2024-01-25', '2024-01-26', '2024-01-27']
    },
    rules: {
      checkIn: '15:00',
      checkOut: '11:00',
      petsAllowed: true,
      smokingAllowed: false,
      partiesAllowed: false
    }
  }
];

// Mock location suggestions for autocomplete
const mockLocationSuggestions = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
  'Boston, MA', 'Nashville, TN', 'Baltimore, MD', 'Louisville, KY', 'Portland, OR',
  'Oklahoma City, OK', 'Milwaukee, WI', 'Las Vegas, NV', 'Albuquerque, NM', 'Tucson, AZ',
  'Fresno, CA', 'Sacramento, CA', 'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA',
  'Long Beach, CA', 'Colorado Springs, CO', 'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA',
  'Omaha, NE', 'Oakland, CA', 'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX',
  'Tampa, FL', 'New Orleans, LA', 'Wichita, KS', 'Cleveland, OH', 'Bakersfield, CA'
];

// Search vacation rentals
const searchVacationRentals = async (req, res) => {
  try {
    const {
      location = '',
      checkIn,
      checkOut,
      guests = 1,
      priceMin = 0,
      priceMax = 1000,
      propertyType = '',
      bedrooms = 0,
      bathrooms = 0,
      amenities = []
    } = req.query;

    console.log('Vacation rental search request:', {
      location,
      checkIn,
      checkOut,
      guests,
      priceMin,
      priceMax,
      propertyType,
      bedrooms,
      bathrooms,
      amenities
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Filter properties based on search criteria
    let filteredRentals = mockVacationRentals.filter(rental => {
      // Location filter
      if (location && !rental.location.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }

      // Guest capacity filter
      if (guests > rental.specs.guests) {
        return false;
      }

      // Price filter
      if (rental.pricing.basePrice < parseInt(priceMin) || rental.pricing.basePrice > parseInt(priceMax)) {
        return false;
      }

      // Property type filter
      if (propertyType && !rental.type.toLowerCase().includes(propertyType.toLowerCase())) {
        return false;
      }

      // Bedrooms filter
      if (bedrooms > 0 && rental.specs.bedrooms < parseInt(bedrooms)) {
        return false;
      }

      // Bathrooms filter
      if (bathrooms > 0 && rental.specs.bathrooms < parseInt(bathrooms)) {
        return false;
      }

      // Amenities filter
      if (amenities && amenities.length > 0) {
        const requestedAmenities = Array.isArray(amenities) ? amenities : [amenities];
        const hasAllAmenities = requestedAmenities.every(amenity => 
          rental.amenities.some(rentalAmenity => 
            rentalAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });

    // Calculate total prices for each rental
    const rentalsWithPricing = filteredRentals.map(rental => {
      const nights = checkIn && checkOut ? 
        Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 3;
      
      const subtotal = rental.pricing.basePrice * nights;
      const cleaningFee = rental.pricing.cleaningFee;
      const serviceFee = rental.pricing.serviceFee;
      const taxes = rental.pricing.taxes;
      const total = subtotal + cleaningFee + serviceFee + taxes;

      // Apply monthly discount for stays 28+ days
      let monthlyDiscount = 0;
      if (nights >= 28) {
        monthlyDiscount = (subtotal * rental.pricing.monthlyDiscount) / 100;
      }

      return {
        ...rental,
        calculatedPricing: {
          nights,
          subtotal,
          cleaningFee,
          serviceFee,
          taxes,
          monthlyDiscount,
          total: total - monthlyDiscount
        }
      };
    });

    // Sort by rating and price
    rentalsWithPricing.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return a.calculatedPricing.total - b.calculatedPricing.total;
    });

    res.json({
      success: true,
      data: {
        rentals: rentalsWithPricing,
        total: rentalsWithPricing.length,
        searchCriteria: {
          location,
          checkIn,
          checkOut,
          guests,
          priceRange: [priceMin, priceMax],
          propertyType,
          bedrooms,
          bathrooms,
          amenities
        }
      }
    });

  } catch (error) {
    console.error('Error searching vacation rentals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search vacation rentals',
      error: error.message
    });
  }
};

// Get location suggestions for autocomplete
const getLocationSuggestions = async (req, res) => {
  try {
    const { query = '' } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Filter mock suggestions based on query
    const suggestions = mockLocationSuggestions
      .filter(location => 
        location.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8); // Limit to 8 suggestions

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Error getting location suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get location suggestions',
      error: error.message
    });
  }
};

// Get vacation rental details by ID
const getVacationRentalDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const rental = mockVacationRentals.find(r => r.id === id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Vacation rental not found'
      });
    }

    // Add additional details for property page
    const detailedRental = {
      ...rental,
      description: `Welcome to this beautiful ${rental.type.toLowerCase()} in ${rental.location}. ` +
                  `Perfect for ${rental.specs.guests} guests, this property offers ${rental.specs.bedrooms} bedroom(s) ` +
                  `and ${rental.specs.bathrooms} bathroom(s). Enjoy modern amenities and comfortable accommodations ` +
                  `in a prime location. Our ${rental.host.isSuperhost ? 'Superhost' : 'host'} ${rental.host.name} ` +
                  `has been hosting for ${rental.host.yearsHosting} years and provides excellent service.`,
      reviews: [
        {
          id: 'rev_001',
          guest: 'Jennifer L.',
          rating: 5,
          date: '2024-01-10',
          comment: 'Amazing place! Everything was exactly as described. The host was very responsive and helpful.'
        },
        {
          id: 'rev_002',
          guest: 'Mark T.',
          rating: 5,
          date: '2024-01-05',
          comment: 'Perfect location and beautiful space. Would definitely stay here again!'
        },
        {
          id: 'rev_003',
          guest: 'Sarah M.',
          rating: 4,
          date: '2023-12-28',
          comment: 'Great property with excellent amenities. Minor issue with check-in but host resolved quickly.'
        }
      ]
    };

    res.json({
      success: true,
      data: detailedRental
    });

  } catch (error) {
    console.error('Error getting vacation rental details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vacation rental details',
      error: error.message
    });
  }
};

// Book vacation rental
const bookVacationRental = async (req, res) => {
  try {
    const {
      rentalId,
      checkIn,
      checkOut,
      guests,
      contactInfo,
      paymentInfo,
      specialRequests = ''
    } = req.body;

    // Validate required fields
    if (!rentalId || !checkIn || !checkOut || !guests || !contactInfo || !paymentInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Find the rental
    const rental = mockVacationRentals.find(r => r.id === rentalId);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Vacation rental not found'
      });
    }

    // Calculate booking details
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const subtotal = rental.pricing.basePrice * nights;
    const cleaningFee = rental.pricing.cleaningFee;
    const serviceFee = rental.pricing.serviceFee;
    const taxes = rental.pricing.taxes;
    
    // Apply monthly discount for stays 28+ days
    let monthlyDiscount = 0;
    if (nights >= 28) {
      monthlyDiscount = (subtotal * rental.pricing.monthlyDiscount) / 100;
    }
    
    const total = subtotal + cleaningFee + serviceFee + taxes - monthlyDiscount;

    // Generate booking confirmation
    const bookingId = `VR${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Simulate booking process delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create booking record
    const booking = {
      bookingId,
      rentalId,
      rental: {
        title: rental.title,
        location: rental.location,
        type: rental.type,
        image: rental.images[0]
      },
      dates: {
        checkIn,
        checkOut,
        nights
      },
      guests,
      host: rental.host,
      pricing: {
        basePrice: rental.pricing.basePrice,
        subtotal,
        cleaningFee,
        serviceFee,
        taxes,
        monthlyDiscount,
        total
      },
      contactInfo,
      specialRequests,
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      instantBook: rental.instantBook
    };

    console.log('Vacation rental booking created:', bookingId);

    res.json({
      success: true,
      message: 'Vacation rental booked successfully',
      data: {
        booking,
        confirmationNumber: bookingId,
        checkInInstructions: {
          time: rental.rules.checkIn,
          method: rental.instantBook ? 'Self check-in with lockbox' : 'Meet with host',
          hostContact: rental.host.name
        }
      }
    });

  } catch (error) {
    console.error('Error booking vacation rental:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book vacation rental',
      error: error.message
    });
  }
};

// Get featured vacation rentals
const getFeaturedVacationRentals = async (req, res) => {
  try {
    // Return top-rated properties with guest favorites and superhosts
    const featured = mockVacationRentals
      .filter(rental => rental.rating >= 4.8 || rental.guestFavorite || rental.host.isSuperhost)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);

    res.json({
      success: true,
      data: featured
    });

  } catch (error) {
    console.error('Error getting featured vacation rentals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured vacation rentals',
      error: error.message
    });
  }
};

module.exports = {
  searchVacationRentals,
  getLocationSuggestions,
  getVacationRentalDetails,
  bookVacationRental,
  getFeaturedVacationRentals
};