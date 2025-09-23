const Car = require('../models/car');
const Booking = require('../models/booking');

// Generate mock car data with Expedia Cars-style information
const generateMockCars = (pickupLocation, dropoffLocation, pickupDate, dropoffDate, driverAge) => {
  const carModels = [
    { model: 'Toyota Corolla', category: 'economy', passengers: 4, luggage: 2, transmission: 'automatic', fuelType: 'petrol' },
    { model: 'Nissan Sentra', category: 'economy', passengers: 4, luggage: 2, transmission: 'automatic', fuelType: 'petrol' },
    { model: 'Honda Civic', category: 'compact', passengers: 4, luggage: 3, transmission: 'automatic', fuelType: 'petrol' },
    { model: 'Volkswagen Jetta', category: 'compact', passengers: 5, luggage: 3, transmission: 'manual', fuelType: 'diesel' },
    { model: 'Toyota Camry', category: 'midsize', passengers: 5, luggage: 4, transmission: 'automatic', fuelType: 'hybrid' },
    { model: 'Honda Accord', category: 'midsize', passengers: 5, luggage: 4, transmission: 'automatic', fuelType: 'petrol' },
    { model: 'BMW 3 Series', category: 'luxury', passengers: 5, luggage: 3, transmission: 'automatic', fuelType: 'petrol' },
    { model: 'Mercedes C-Class', category: 'luxury', passengers: 5, luggage: 3, transmission: 'automatic', fuelType: 'petrol' },
    { model: 'Ford Explorer', category: 'suv', passengers: 7, luggage: 5, transmission: 'automatic', fuelType: 'petrol' },
    { model: 'Chevrolet Tahoe', category: 'suv', passengers: 8, luggage: 6, transmission: 'automatic', fuelType: 'petrol' },
    { model: 'Tesla Model 3', category: 'luxury', passengers: 5, luggage: 3, transmission: 'automatic', fuelType: 'electric' },
    { model: 'Jeep Wrangler', category: 'suv', passengers: 4, luggage: 3, transmission: 'manual', fuelType: 'petrol' }
  ];

  const suppliers = ['Enterprise', 'Hertz', 'Avis', 'Budget', 'Alamo', 'National', 'Thrifty', 'Dollar'];
  
  const features = [
    ['Air Conditioning', 'GPS Navigation', 'Bluetooth'],
    ['Air Conditioning', 'GPS Navigation', 'USB Ports', 'Backup Camera'],
    ['Air Conditioning', 'GPS Navigation', 'Heated Seats', 'Sunroof'],
    ['Air Conditioning', 'GPS Navigation', 'Leather Seats', 'Premium Audio'],
    ['Air Conditioning', 'GPS Navigation', 'AWD', 'Towing Package'],
    ['Air Conditioning', 'GPS Navigation', 'Cruise Control', 'Power Steering'],
    ['Air Conditioning', 'GPS Navigation', 'Premium Sound', 'WiFi Hotspot'],
    ['Air Conditioning', 'GPS Navigation', 'Child Seat Ready', 'Extra Storage']
  ];

  const cars = [];
  const numberOfCars = Math.floor(Math.random() * 10) + 12; // 12-21 cars

  for (let i = 0; i < numberOfCars; i++) {
    const carIndex = i % carModels.length;
    const car = carModels[carIndex];
    const supplierIndex = Math.floor(Math.random() * suppliers.length);
    const featureIndex = i % features.length;
    
    // Base price varies by category
    let basePrice;
    switch (car.category) {
      case 'economy': basePrice = Math.floor(Math.random() * 30) + 25; break; // $25-55
      case 'compact': basePrice = Math.floor(Math.random() * 25) + 35; break; // $35-60
      case 'midsize': basePrice = Math.floor(Math.random() * 30) + 45; break; // $45-75
      case 'luxury': basePrice = Math.floor(Math.random() * 50) + 80; break; // $80-130
      case 'suv': basePrice = Math.floor(Math.random() * 40) + 60; break; // $60-100
      default: basePrice = Math.floor(Math.random() * 40) + 40; break;
    }

    // Young driver surcharge
    if (driverAge < 25) {
      basePrice += Math.floor(Math.random() * 15) + 10; // $10-25 extra
    }

    cars.push({
      id: `car_${i + 1}`,
      model: car.model,
      category: car.category,
      supplier: suppliers[supplierIndex],
      pricePerDay: basePrice,
      passengerCapacity: car.passengers,
      luggage: car.luggage,
      transmission: car.transmission,
      fuelType: car.fuelType,
      features: features[featureIndex],
      image: `https://images.unsplash.com/photo-${1449824913935 + i * 100}-c8ad0ce23b05?w=400&h=250&fit=crop&crop=center`,
      pickupLocation: pickupLocation,
      dropoffLocation: dropoffLocation,
      availability: {
        pickupDate: pickupDate,
        dropoffDate: dropoffDate,
        available: true
      },
      policies: {
        freeCancellation: Math.random() > 0.2, // 80% have free cancellation
        mileage: Math.random() > 0.3 ? 'unlimited' : 'limited',
        additionalDriver: Math.random() > 0.5
      }
    });
  }

  return cars.sort((a, b) => {
    // Sort by price (cheapest first) with category consideration
    const aValue = a.pricePerDay + (a.category === 'economy' ? -10 : a.category === 'luxury' ? 20 : 0);
    const bValue = b.pricePerDay + (b.category === 'economy' ? -10 : b.category === 'luxury' ? 20 : 0);
    return aValue - bValue;
  });
};

// Search cars with mock Expedia Cars API integration
exports.searchCars = async (req, res) => {
  try {
    const { 
      pickupLocation, 
      dropoffLocation, 
      pickupDate, 
      pickupTime = '10:00', 
      dropoffDate, 
      dropoffTime = '10:00', 
      driverAge = 25 
    } = req.query;

    if (!pickupLocation || !pickupDate || !dropoffDate) {
      return res.status(400).json({
        success: false,
        message: 'Pickup location, pickup date, and drop-off date are required'
      });
    }

    // Validate dates
    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
    const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime}`);
    const now = new Date();

    if (pickupDateTime < now) {
      return res.status(400).json({
        success: false,
        message: 'Pickup date cannot be in the past'
      });
    }

    if (dropoffDateTime <= pickupDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Drop-off date must be after pickup date'
      });
    }

    // Validate driver age
    const age = parseInt(driverAge);
    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'Driver must be at least 18 years old'
      });
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    // Generate mock car data
    const cars = generateMockCars(pickupLocation, dropoffLocation, pickupDate, dropoffDate, age);

    res.json({
      success: true,
      cars: cars,
      searchParams: {
        pickupLocation,
        dropoffLocation,
        pickupDate,
        pickupTime,
        dropoffDate,
        dropoffTime,
        driverAge: age
      },
      totalResults: cars.length,
      youngDriverSurcharge: age < 25
    });

  } catch (error) {
    console.error('Car search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search cars. Please try again.',
      error: error.message
    });
  }
};

// Book car
exports.bookCar = async (req, res) => {
  try {
    const { 
      carId, 
      pickupLocation, 
      dropoffLocation, 
      pickupDate, 
      pickupTime, 
      dropoffDate, 
      dropoffTime, 
      driverAge, 
      totalPrice,
      userId = 'guest_user' 
    } = req.body;

    if (!carId || !pickupLocation || !pickupDate || !dropoffDate || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Validate driver age for booking
    if (parseInt(driverAge) < 18) {
      return res.status(400).json({
        success: false,
        message: 'Driver must be at least 18 years old to book'
      });
    }

    // Generate booking ID
    const bookingId = `CR${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Calculate rental days
    const pickupDateTime = new Date(`${pickupDate}T${pickupTime || '10:00'}`);
    const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime || '10:00'}`);
    const diffTime = Math.abs(dropoffDateTime - pickupDateTime);
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Create booking record (in a real app, this would be saved to database)
    const bookingData = {
      bookingId: bookingId,
      type: 'car',
      carId: carId,
      pickupLocation: pickupLocation,
      dropoffLocation: dropoffLocation,
      pickupDateTime: pickupDateTime.toISOString(),
      dropoffDateTime: dropoffDateTime.toISOString(),
      rentalDays: days,
      driverAge: parseInt(driverAge),
      totalPrice: parseFloat(totalPrice),
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      userId: userId,
      youngDriverSurcharge: parseInt(driverAge) < 25
    };

    // In a real application, save to database
    // const booking = await Booking.create(bookingData);

    // Simulate booking processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.json({
      success: true,
      message: 'Car booked successfully!',
      bookingId: bookingId,
      booking: bookingData,
      confirmationNumber: bookingId
    });

  } catch (error) {
    console.error('Car booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book car. Please try again.',
      error: error.message
    });
  }
};

// Cancel car booking
exports.cancelCarBooking = async (req, res) => {
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
      message: 'Car booking cancelled successfully',
      bookingId: bookingId,
      cancellationDate: new Date().toISOString(),
      refundEligible: true
    });

  } catch (error) {
    console.error('Car cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking. Please try again.',
      error: error.message
    });
  }
};

// Get car details
exports.getCarDetails = async (req, res) => {
  try {
    const { carId } = req.params;

    // In a real application, fetch from database
    // const car = await Car.findById(carId);

    // For demo, return mock car details
    const mockCar = {
      id: carId,
      model: 'Toyota Camry',
      category: 'midsize',
      supplier: 'Enterprise',
      description: 'Comfortable midsize sedan perfect for business and leisure travel.',
      images: [
        'https://images.unsplash.com/photo-1449824913935-c8ad0ce23b05?w=800&h=600',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600',
        'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&h=600'
      ],
      specifications: {
        passengerCapacity: 5,
        luggage: 4,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        airConditioning: true,
        doors: 4
      },
      features: ['GPS Navigation', 'Bluetooth', 'Air Conditioning', 'Cruise Control'],
      policies: {
        minimumAge: 21,
        youngDriverFee: 'Additional fee applies for drivers under 25',
        mileage: 'Unlimited mileage included',
        fuelPolicy: 'Full to full',
        cancellation: 'Free cancellation up to 48 hours before pickup'
      }
    };

    res.json({
      success: true,
      car: mockCar
    });

  } catch (error) {
    console.error('Get car details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get car details',
      error: error.message
    });
  }
};
