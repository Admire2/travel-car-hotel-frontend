// currency.js - API routes for currency exchange functionality
const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

// Rate limit for currency API (reasonable limits for exchange rate data)
const currencyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many currency requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// More restrictive rate limit for conversion endpoint
const conversionRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 conversions per minute
  message: {
    success: false,
    message: 'Too many conversion requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   GET /api/currency/rates
 * @desc    Get current exchange rates
 * @access  Public
 * @params  base (optional, default: USD), currencies (optional), provider (optional)
 * @example /api/currency/rates?base=USD&currencies=EUR,GBP,JPY
 */
router.get('/rates', currencyRateLimit, currencyController.getExchangeRates);

/**
 * @route   GET /api/currency/convert
 * @desc    Convert amount between two currencies
 * @access  Public
 * @params  amount (required), from (required), to (required), provider (optional)
 * @example /api/currency/convert?amount=100&from=USD&to=EUR
 */
router.get('/convert', conversionRateLimit, currencyController.convertCurrency);

/**
 * @route   GET /api/currency/supported
 * @desc    Get list of supported currencies
 * @access  Public
 */
router.get('/supported', currencyController.getSupportedCurrencies);

/**
 * @route   GET /api/currency/historical
 * @desc    Get historical exchange rates
 * @access  Public
 * @params  base (optional, default: USD), symbols (optional), start_date (required), end_date (required)
 * @example /api/currency/historical?base=USD&symbols=EUR,GBP&start_date=2024-01-01&end_date=2024-01-31
 */
router.get('/historical', currencyRateLimit, currencyController.getHistoricalRates);

/**
 * @route   POST /api/currency/cache/clear
 * @desc    Clear currency cache (admin operation)
 * @access  Public (should be protected in production)
 */
router.post('/cache/clear', currencyController.clearCache);

/**
 * @route   GET /api/currency/cache/stats
 * @desc    Get cache statistics
 * @access  Public (should be protected in production)
 */
router.get('/cache/stats', currencyController.getCacheStats);

/**
 * @route   GET /api/currency/health
 * @desc    Health check for currency service
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    // Simple health check
    const timestamp = new Date().toISOString();
    
    res.json({
      success: true,
      service: 'currency',
      status: 'healthy',
      timestamp,
      version: '1.0.0',
      endpoints: [
        'GET /api/currency/rates',
        'GET /api/currency/convert',
        'GET /api/currency/supported',
        'GET /api/currency/historical',
        'POST /api/currency/cache/clear',
        'GET /api/currency/cache/stats'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'currency',
      status: 'unhealthy',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/currency/popular
 * @desc    Get popular currency pairs and their rates
 * @access  Public
 */
router.get('/popular', currencyRateLimit, async (req, res) => {
  try {
    const popularPairs = [
      { from: 'USD', to: 'EUR' },
      { from: 'USD', to: 'GBP' },
      { from: 'USD', to: 'JPY' },
      { from: 'USD', to: 'CAD' },
      { from: 'USD', to: 'AUD' },
      { from: 'EUR', to: 'GBP' },
      { from: 'EUR', to: 'USD' },
      { from: 'GBP', to: 'USD' },
      { from: 'GBP', to: 'EUR' }
    ];

    // This would typically fetch current rates for these pairs
    // For now, return a mock response
    const popularRates = popularPairs.map(pair => ({
      from: pair.from,
      to: pair.to,
      rate: Math.random() * 2 + 0.5, // Mock rate
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change: (Math.random() - 0.5) * 0.1
    }));

    res.json({
      success: true,
      popular_pairs: popularRates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting popular pairs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular currency pairs',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/currency/batch-convert
 * @desc    Convert multiple amounts/currencies in a single request
 * @access  Public
 * @body    { conversions: [{ amount, from, to }, ...] }
 */
router.post('/batch-convert', conversionRateLimit, async (req, res) => {
  try {
    const { conversions } = req.body;

    if (!conversions || !Array.isArray(conversions)) {
      return res.status(400).json({
        success: false,
        message: 'Conversions array is required'
      });
    }

    if (conversions.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 conversions per batch request'
      });
    }

    // Validate each conversion request
    for (const conv of conversions) {
      if (!conv.amount || !conv.from || !conv.to) {
        return res.status(400).json({
          success: false,
          message: 'Each conversion must have amount, from, and to properties'
        });
      }
    }

    // Process each conversion (this is a simplified implementation)
    const results = await Promise.all(
      conversions.map(async (conv, index) => {
        try {
          // In a real implementation, you'd use the currencyController.convertCurrency logic
          return {
            index,
            success: true,
            amount: parseFloat(conv.amount),
            from: conv.from.toUpperCase(),
            to: conv.to.toUpperCase(),
            converted: parseFloat(conv.amount) * (Math.random() * 2 + 0.5), // Mock conversion
            rate: Math.random() * 2 + 0.5
          };
        } catch (error) {
          return {
            index,
            success: false,
            error: error.message
          };
        }
      })
    );

    res.json({
      success: true,
      conversions: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in batch convert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process batch conversion',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/currency/trends
 * @desc    Get currency trend data
 * @access  Public
 * @params  base, target, period (7d, 30d, 90d, 1y)
 */
router.get('/trends', currencyRateLimit, async (req, res) => {
  try {
    const { base = 'USD', target = 'EUR', period = '30d' } = req.query;

    // Mock trend data
    const trendData = {
      base: base.toUpperCase(),
      target: target.toUpperCase(),
      period,
      current_rate: Math.random() * 2 + 0.5,
      change_24h: (Math.random() - 0.5) * 0.1,
      change_7d: (Math.random() - 0.5) * 0.2,
      change_30d: (Math.random() - 0.5) * 0.5,
      high_52w: Math.random() * 3 + 1,
      low_52w: Math.random() * 1 + 0.5,
      volatility: Math.random() * 0.3,
      data_points: generateMockTrendPoints(period)
    };

    res.json({
      success: true,
      trend: trendData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get currency trends',
      error: error.message
    });
  }
});

// Helper function to generate mock trend points
const generateMockTrendPoints = (period) => {
  const points = [];
  const now = new Date();
  let days;

  switch (period) {
    case '7d': days = 7; break;
    case '30d': days = 30; break;
    case '90d': days = 90; break;
    case '1y': days = 365; break;
    default: days = 30;
  }

  const baseRate = Math.random() * 2 + 0.5;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const variation = (Math.random() - 0.5) * 0.2;
    const rate = Math.max(0.1, baseRate * (1 + variation));

    points.push({
      date: date.toISOString().split('T')[0],
      rate: Math.round(rate * 10000) / 10000,
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
  }

  return points;
};

// Error handling middleware for currency routes
router.use((error, req, res, next) => {
  console.error('Currency Route Error:', error);
  
  // Handle specific error types
  if (error.code === 'ECONNABORTED') {
    return res.status(408).json({
      success: false,
      message: 'Request timeout - currency service unavailable'
    });
  }
  
  if (error.response) {
    // External API error
    return res.status(error.response.status || 500).json({
      success: false,
      message: 'External currency service error',
      details: error.response.data?.message || error.message
    });
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error in currency service',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = router;