// mapSearch.js - API routes for map-based search functionality
const express = require('express');
const router = express.Router();
const mapSearchController = require('../controllers/mapSearchController');
const { authenticateToken } = require('../middleware/auth');

// Rate limiting middleware (optional)
const rateLimit = require('express-rate-limit');

// Rate limit for map searches (higher limit due to interactive nature)
const mapSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many map search requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit for place details (more restrictive)
const placeDetailsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many place detail requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   GET /api/map-search/nearby
 * @desc    Search for nearby places (hotels, rentals, attractions)
 * @access  Public
 * @params  latitude, longitude, radius, types, minRating, priceLevel, openNow, keyword
 */
router.get('/nearby', mapSearchLimiter, mapSearchController.searchNearbyPlaces);

/**
 * @route   GET /api/map-search/place/:placeId
 * @desc    Get detailed information about a specific place
 * @access  Public
 * @params  placeId (URL parameter)
 */
router.get('/place/:placeId', placeDetailsLimiter, mapSearchController.getPlaceDetails);

/**
 * @route   GET /api/map-search/geocode
 * @desc    Convert address to coordinates
 * @access  Public
 * @params  address (query parameter)
 */
router.get('/geocode', mapSearchLimiter, mapSearchController.geocodeAddress);

/**
 * @route   GET /api/map-search/destinations
 * @desc    Get list of popular destinations
 * @access  Public
 */
router.get('/destinations', mapSearchController.getPopularDestinations);

/**
 * @route   GET /api/map-search/config
 * @desc    Get map configuration and settings
 * @access  Public
 */
router.get('/config', mapSearchController.getMapConfig);

/**
 * @route   POST /api/map-search/save-search
 * @desc    Save a map search for logged-in users
 * @access  Private
 */
router.post('/save-search', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      location,
      filters,
      results,
      searchName,
      isPublic = false
    } = req.body;

    // Validate required fields
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    if (!searchName || searchName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search name is required'
      });
    }

    // Mock save functionality (replace with actual database save)
    const savedSearch = {
      id: Date.now().toString(),
      userId: userId,
      searchName: searchName.trim(),
      location: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        address: location.address || 'Custom Location'
      },
      filters: filters || {},
      resultsCount: results ? results.length : 0,
      isPublic: Boolean(isPublic),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Map search saved successfully',
      data: savedSearch
    });

  } catch (error) {
    console.error('Error in save-search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save map search',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/map-search/saved-searches
 * @desc    Get saved map searches for logged-in user
 * @access  Private
 */
router.get('/saved-searches', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0, includePublic = false } = req.query;

    // Mock saved searches (replace with actual database query)
    const mockSavedSearches = [
      {
        id: '1',
        userId: userId,
        searchName: 'Manhattan Hotels',
        location: {
          latitude: 40.7831,
          longitude: -73.9712,
          address: 'Manhattan, New York, NY, USA'
        },
        filters: { hotels: true, minRating: 4.0, priceLevel: 'mid' },
        resultsCount: 45,
        isPublic: false,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        userId: userId,
        searchName: 'Central Park Area',
        location: {
          latitude: 40.7829,
          longitude: -73.9654,
          address: 'Central Park, New York, NY'
        },
        filters: { attractions: true, rentals: true },
        resultsCount: 23,
        isPublic: true,
        createdAt: '2024-01-14T15:45:00Z',
        updatedAt: '2024-01-14T15:45:00Z'
      }
    ];

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = mockSavedSearches.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        searches: paginatedResults,
        total: mockSavedSearches.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: endIndex < mockSavedSearches.length
      }
    });

  } catch (error) {
    console.error('Error in saved-searches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved searches',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/map-search/saved-searches/:searchId
 * @desc    Delete a saved map search
 * @access  Private
 */
router.delete('/saved-searches/:searchId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { searchId } = req.params;

    if (!searchId) {
      return res.status(400).json({
        success: false,
        message: 'Search ID is required'
      });
    }

    // Mock delete functionality (replace with actual database delete)
    // In a real implementation, you would verify the search belongs to the user
    // and delete it from the database

    res.json({
      success: true,
      message: 'Saved search deleted successfully'
    });

  } catch (error) {
    console.error('Error in delete saved search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete saved search',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/map-search/favorite-place
 * @desc    Add a place to user's favorites
 * @access  Private
 */
router.post('/favorite-place', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { placeId, placeName, placeAddress, category } = req.body;

    if (!placeId || !placeName) {
      return res.status(400).json({
        success: false,
        message: 'Place ID and name are required'
      });
    }

    // Mock favorite functionality (replace with actual database save)
    const favoritePlace = {
      id: Date.now().toString(),
      userId: userId,
      placeId: placeId,
      placeName: placeName,
      placeAddress: placeAddress || '',
      category: category || 'other',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Place added to favorites',
      data: favoritePlace
    });

  } catch (error) {
    console.error('Error in favorite-place:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add place to favorites',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/map-search/favorite-places
 * @desc    Get user's favorite places
 * @access  Private
 */
router.get('/favorite-places', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, limit = 20, offset = 0 } = req.query;

    // Mock favorite places (replace with actual database query)
    const mockFavorites = [
      {
        id: '1',
        userId: userId,
        placeId: 'hotel_1',
        placeName: 'Grand Plaza Hotel',
        placeAddress: '123 Main St, New York, NY 10001',
        category: 'hotel',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        userId: userId,
        placeId: 'attraction_1',
        placeName: 'Times Square',
        placeAddress: 'Times Square, New York, NY 10036',
        category: 'attraction',
        createdAt: '2024-01-14T15:45:00Z'
      }
    ];

    // Filter by category if specified
    let filteredFavorites = mockFavorites;
    if (category && category !== 'all') {
      filteredFavorites = mockFavorites.filter(fav => fav.category === category);
    }

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = filteredFavorites.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        favorites: paginatedResults,
        total: filteredFavorites.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: endIndex < filteredFavorites.length
      }
    });

  } catch (error) {
    console.error('Error in favorite-places:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorite places',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/map-search/favorite-places/:favoriteId
 * @desc    Remove a place from user's favorites
 * @access  Private
 */
router.delete('/favorite-places/:favoriteId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { favoriteId } = req.params;

    if (!favoriteId) {
      return res.status(400).json({
        success: false,
        message: 'Favorite ID is required'
      });
    }

    // Mock delete functionality (replace with actual database delete)
    // In a real implementation, you would verify the favorite belongs to the user
    // and delete it from the database

    res.json({
      success: true,
      message: 'Place removed from favorites'
    });

  } catch (error) {
    console.error('Error in delete favorite place:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove place from favorites',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/map-search/statistics
 * @desc    Get map search usage statistics
 * @access  Public
 */
router.get('/statistics', async (req, res) => {
  try {
    // Mock statistics (replace with actual database queries)
    const stats = {
      totalSearches: 145892,
      totalPlaces: 89456,
      popularCategories: [
        { category: 'hotels', count: 45123, percentage: 50.4 },
        { category: 'attractions', count: 32890, percentage: 36.8 },
        { category: 'rentals', count: 11443, percentage: 12.8 }
      ],
      topDestinations: [
        { name: 'New York City', searchCount: 23456 },
        { name: 'Paris', searchCount: 18902 },
        { name: 'London', searchCount: 16543 },
        { name: 'Tokyo', searchCount: 14287 },
        { name: 'Los Angeles', searchCount: 12098 }
      ],
      averageRating: 4.3,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Map Search Route Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error in map search',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = router;