// mapSearchController.js - Backend controller for map-based search functionality
const axios = require('axios');

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const GOOGLE_GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode';

// Mock data for development/testing
const mockPlaces = {
  hotels: [
    {
      place_id: 'hotel_1',
      name: 'Grand Plaza Hotel',
      formatted_address: '123 Main St, New York, NY 10001',
      geometry: { location: { lat: 40.7128, lng: -74.0060 } },
      rating: 4.5,
      user_ratings_total: 1250,
      price_level: 3,
      types: ['lodging', 'establishment'],
      opening_hours: { open_now: true },
      formatted_phone_number: '+1 (555) 123-4567',
      website: 'https://grandplazahotel.com',
      photos: [{
        photo_reference: 'mock_photo_1',
        getUrl: () => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
      }]
    },
    {
      place_id: 'hotel_2',
      name: 'City View Inn',
      formatted_address: '456 Park Ave, New York, NY 10022',
      geometry: { location: { lat: 40.7589, lng: -73.9851 } },
      rating: 4.2,
      user_ratings_total: 890,
      price_level: 2,
      types: ['lodging', 'establishment'],
      opening_hours: { open_now: true },
      formatted_phone_number: '+1 (555) 987-6543',
      website: 'https://cityviewinn.com',
      photos: [{
        photo_reference: 'mock_photo_2',
        getUrl: () => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'
      }]
    }
  ],
  rentals: [
    {
      place_id: 'rental_1',
      name: 'Cozy Downtown Apartment',
      formatted_address: '789 Broadway, New York, NY 10003',
      geometry: { location: { lat: 40.7282, lng: -73.9942 } },
      rating: 4.8,
      user_ratings_total: 156,
      price_level: 2,
      types: ['real_estate_agency', 'establishment'],
      opening_hours: { open_now: true },
      formatted_phone_number: '+1 (555) 456-7890',
      website: 'https://cozyyrentals.com',
      photos: [{
        photo_reference: 'mock_photo_3',
        getUrl: () => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'
      }]
    },
    {
      place_id: 'rental_2',
      name: 'Luxury Loft Space',
      formatted_address: '321 Fifth Ave, New York, NY 10016',
      geometry: { location: { lat: 40.7505, lng: -73.9934 } },
      rating: 4.9,
      user_ratings_total: 203,
      price_level: 4,
      types: ['real_estate_agency', 'establishment'],
      opening_hours: { open_now: true },
      formatted_phone_number: '+1 (555) 234-5678',
      website: 'https://luxurylofts.com',
      photos: [{
        photo_reference: 'mock_photo_4',
        getUrl: () => 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400'
      }]
    }
  ],
  attractions: [
    {
      place_id: 'attraction_1',
      name: 'Times Square',
      formatted_address: 'Times Square, New York, NY 10036',
      geometry: { location: { lat: 40.7580, lng: -73.9855 } },
      rating: 4.3,
      user_ratings_total: 125000,
      price_level: 0,
      types: ['tourist_attraction', 'establishment'],
      opening_hours: { open_now: true },
      website: 'https://www.timessquarenyc.org',
      photos: [{
        photo_reference: 'mock_photo_5',
        getUrl: () => 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400'
      }]
    },
    {
      place_id: 'attraction_2',
      name: 'Central Park',
      formatted_address: 'Central Park, New York, NY',
      geometry: { location: { lat: 40.7829, lng: -73.9654 } },
      rating: 4.7,
      user_ratings_total: 89000,
      price_level: 0,
      types: ['park', 'tourist_attraction', 'establishment'],
      opening_hours: { open_now: true },
      website: 'https://www.centralparknyc.org',
      photos: [{
        photo_reference: 'mock_photo_6',
        getUrl: () => 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400'
      }]
    },
    {
      place_id: 'attraction_3',
      name: 'Statue of Liberty',
      formatted_address: 'Liberty Island, New York, NY 10004',
      geometry: { location: { lat: 40.6892, lng: -74.0445 } },
      rating: 4.6,
      user_ratings_total: 78000,
      price_level: 1,
      types: ['tourist_attraction', 'establishment'],
      opening_hours: { open_now: true },
      website: 'https://www.nps.gov/stli',
      photos: [{
        photo_reference: 'mock_photo_7',
        getUrl: () => 'https://images.unsplash.com/photo-1460515214883-dc17534551cb?w=400'
      }]
    }
  ]
};

// Search nearby places
const searchNearbyPlaces = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 5000,
      types = ['lodging', 'real_estate_agency', 'tourist_attraction'],
      minRating = 0,
      priceLevel = 'all',
      openNow = false,
      keyword = ''
    } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values'
      });
    }

    let results = [];

    // Use real Google Places API if API key is available
    if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE') {
      try {
        results = await searchWithGooglePlaces(lat, lng, radius, types, keyword, openNow);
      } catch (error) {
        console.error('Google Places API error:', error);
        // Fallback to mock data
        results = getMockPlacesNearby(lat, lng, radius);
      }
    } else {
      // Use mock data for development
      results = getMockPlacesNearby(lat, lng, radius);
    }

    // Apply filters
    const filteredResults = applyFilters(results, {
      minRating: parseFloat(minRating),
      priceLevel,
      keyword: keyword.toLowerCase()
    });

    // Categorize results
    const categorizedResults = categorizeResults(filteredResults);

    res.json({
      success: true,
      data: {
        total: filteredResults.length,
        location: { latitude: lat, longitude: lng },
        radius: parseInt(radius),
        results: categorizedResults,
        filters: {
          minRating: parseFloat(minRating),
          priceLevel,
          types,
          openNow,
          keyword
        }
      }
    });

  } catch (error) {
    console.error('Error in searchNearbyPlaces:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search nearby places',
      error: error.message
    });
  }
};

// Search with Google Places API
const searchWithGooglePlaces = async (lat, lng, radius, types, keyword, openNow) => {
  const results = [];

  for (const type of types) {
    try {
      const response = await axios.get(`${GOOGLE_PLACES_BASE_URL}/nearbysearch/json`, {
        params: {
          location: `${lat},${lng}`,
          radius: radius,
          type: type,
          key: GOOGLE_MAPS_API_KEY,
          keyword: keyword || undefined,
          opennow: openNow || undefined
        }
      });

      if (response.data.status === 'OK') {
        results.push(...response.data.results);
      }
    } catch (error) {
      console.error(`Error searching for ${type}:`, error);
    }
  }

  return results;
};

// Get mock places nearby (for development)
const getMockPlacesNearby = (lat, lng, radius) => {
  const allMockPlaces = [
    ...mockPlaces.hotels,
    ...mockPlaces.rentals,
    ...mockPlaces.attractions
  ];

  // Filter by distance (simplified calculation)
  return allMockPlaces.filter(place => {
    const distance = calculateDistance(
      lat, lng,
      place.geometry.location.lat,
      place.geometry.location.lng
    );
    return distance <= radius;
  });
};

// Apply filters to results
const applyFilters = (results, filters) => {
  return results.filter(place => {
    // Rating filter
    if (filters.minRating > 0 && (!place.rating || place.rating < filters.minRating)) {
      return false;
    }

    // Price level filter
    if (filters.priceLevel !== 'all') {
      if (!place.price_level) return filters.priceLevel === 'budget';
      
      switch (filters.priceLevel) {
        case 'budget':
          return place.price_level <= 1;
        case 'mid':
          return place.price_level >= 2 && place.price_level <= 3;
        case 'luxury':
          return place.price_level >= 4;
        default:
          return true;
      }
    }

    // Keyword filter
    if (filters.keyword && filters.keyword.trim()) {
      const keyword = filters.keyword.toLowerCase();
      const name = (place.name || '').toLowerCase();
      const address = (place.formatted_address || place.vicinity || '').toLowerCase();
      return name.includes(keyword) || address.includes(keyword);
    }

    return true;
  });
};

// Categorize results by type
const categorizeResults = (results) => {
  const categorized = {
    hotels: [],
    rentals: [],
    attractions: [],
    other: []
  };

  results.forEach(place => {
    const types = place.types || [];
    
    if (types.includes('lodging')) {
      categorized.hotels.push({ ...place, category: 'hotel' });
    } else if (types.includes('real_estate_agency')) {
      categorized.rentals.push({ ...place, category: 'rental' });
    } else if (types.includes('tourist_attraction') || types.includes('park')) {
      categorized.attractions.push({ ...place, category: 'attraction' });
    } else {
      categorized.other.push({ ...place, category: 'other' });
    }
  });

  return categorized;
};

// Get place details
const getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: 'Place ID is required'
      });
    }

    let placeDetails = null;

    // Use real Google Places API if available
    if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE') {
      try {
        const response = await axios.get(`${GOOGLE_PLACES_BASE_URL}/details/json`, {
          params: {
            place_id: placeId,
            fields: 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,price_level,photos,opening_hours,reviews,geometry,types',
            key: GOOGLE_MAPS_API_KEY
          }
        });

        if (response.data.status === 'OK') {
          placeDetails = response.data.result;
        }
      } catch (error) {
        console.error('Google Places Details API error:', error);
      }
    }

    // Fallback to mock data
    if (!placeDetails) {
      placeDetails = getMockPlaceDetails(placeId);
    }

    if (!placeDetails) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    // Add booking URLs based on place type
    const bookingInfo = generateBookingInfo(placeDetails);

    res.json({
      success: true,
      data: {
        ...placeDetails,
        booking: bookingInfo
      }
    });

  } catch (error) {
    console.error('Error in getPlaceDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get place details',
      error: error.message
    });
  }
};

// Get mock place details
const getMockPlaceDetails = (placeId) => {
  const allMockPlaces = [
    ...mockPlaces.hotels,
    ...mockPlaces.rentals,
    ...mockPlaces.attractions
  ];

  return allMockPlaces.find(place => place.place_id === placeId);
};

// Generate booking information
const generateBookingInfo = (place) => {
  const types = place.types || [];
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  let bookingUrl = '';
  let bookingType = 'external';

  if (types.includes('lodging')) {
    bookingUrl = `${baseUrl}/hotels?location=${encodeURIComponent(place.formatted_address)}`;
    bookingType = 'hotel';
  } else if (types.includes('real_estate_agency')) {
    bookingUrl = `${baseUrl}/vacation-rentals?location=${encodeURIComponent(place.formatted_address)}`;
    bookingType = 'rental';
  } else if (types.includes('tourist_attraction')) {
    bookingUrl = place.website || `${baseUrl}/search?q=${encodeURIComponent(place.name)}`;
    bookingType = 'attraction';
  }

  return {
    type: bookingType,
    url: bookingUrl,
    available: true,
    directBooking: types.includes('lodging') || types.includes('real_estate_agency')
  };
};

// Geocode address
const geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    let geocodeResult = null;

    // Use real Google Geocoding API if available
    if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE') {
      try {
        const response = await axios.get(`${GOOGLE_GEOCODING_BASE_URL}/json`, {
          params: {
            address: address,
            key: GOOGLE_MAPS_API_KEY
          }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
          geocodeResult = response.data.results[0];
        }
      } catch (error) {
        console.error('Google Geocoding API error:', error);
      }
    }

    // Fallback to mock geocoding
    if (!geocodeResult) {
      geocodeResult = getMockGeocoding(address);
    }

    if (!geocodeResult) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      data: {
        address: geocodeResult.formatted_address,
        location: geocodeResult.geometry.location,
        components: geocodeResult.address_components || [],
        placeId: geocodeResult.place_id,
        types: geocodeResult.types || []
      }
    });

  } catch (error) {
    console.error('Error in geocodeAddress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to geocode address',
      error: error.message
    });
  }
};

// Mock geocoding for development
const getMockGeocoding = (address) => {
  const mockGeocoding = {
    'new york': {
      formatted_address: 'New York, NY, USA',
      geometry: { location: { lat: 40.7128, lng: -74.0060 } },
      place_id: 'mock_nyc',
      types: ['locality', 'political']
    },
    'manhattan': {
      formatted_address: 'Manhattan, New York, NY, USA',
      geometry: { location: { lat: 40.7831, lng: -73.9712 } },
      place_id: 'mock_manhattan',
      types: ['sublocality', 'political']
    },
    'brooklyn': {
      formatted_address: 'Brooklyn, New York, NY, USA',
      geometry: { location: { lat: 40.6782, lng: -73.9442 } },
      place_id: 'mock_brooklyn',
      types: ['sublocality', 'political']
    }
  };

  const lowerAddress = address.toLowerCase();
  for (const [key, value] of Object.entries(mockGeocoding)) {
    if (lowerAddress.includes(key)) {
      return value;
    }
  }

  return null;
};

// Get popular destinations
const getPopularDestinations = async (req, res) => {
  try {
    const popularDestinations = [
      {
        id: 'nyc',
        name: 'New York City',
        country: 'United States',
        location: { lat: 40.7128, lng: -74.0060 },
        description: 'The city that never sleeps',
        imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
        hotelsCount: 1250,
        attractionsCount: 89,
        averageRating: 4.3
      },
      {
        id: 'paris',
        name: 'Paris',
        country: 'France',
        location: { lat: 48.8566, lng: 2.3522 },
        description: 'The city of lights',
        imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
        hotelsCount: 890,
        attractionsCount: 156,
        averageRating: 4.5
      },
      {
        id: 'london',
        name: 'London',
        country: 'United Kingdom',
        location: { lat: 51.5074, lng: -0.1278 },
        description: 'Historic royal capital',
        imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
        hotelsCount: 1100,
        attractionsCount: 203,
        averageRating: 4.4
      },
      {
        id: 'tokyo',
        name: 'Tokyo',
        country: 'Japan',
        location: { lat: 35.6762, lng: 139.6503 },
        description: 'Modern meets traditional',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
        hotelsCount: 1580,
        attractionsCount: 278,
        averageRating: 4.6
      }
    ];

    res.json({
      success: true,
      data: popularDestinations
    });

  } catch (error) {
    console.error('Error in getPopularDestinations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular destinations',
      error: error.message
    });
  }
};

// Utility function to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Get map configuration
const getMapConfig = async (req, res) => {
  try {
    const config = {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE' ? 'configured' : 'not_configured',
      defaultLocation: { lat: 40.7128, lng: -74.0060 },
      defaultZoom: 12,
      supportedTypes: ['lodging', 'real_estate_agency', 'tourist_attraction'],
      maxRadius: 50000, // 50km
      minRadius: 500,   // 500m
      defaultRadius: 5000, // 5km
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000
      }
    };

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Error in getMapConfig:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get map configuration',
      error: error.message
    });
  }
};

module.exports = {
  searchNearbyPlaces,
  getPlaceDetails,
  geocodeAddress,
  getPopularDestinations,
  getMapConfig
};