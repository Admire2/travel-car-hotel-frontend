// price-alerts.js - Routes for price alert management

const express = require('express');
const router = express.Router();
const {
  getMyAlerts,
  createPriceAlert,
  toggleAlert,
  deleteAlert,
  checkAllActivePrices
} = require('../controllers/priceAlertController');

// Middleware for logging price alert requests
const logPriceAlertRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Price Alert API: ${req.method} ${req.path}`);
  next();
};

// Apply logging middleware to all routes
router.use(logPriceAlertRequest);

// Get user's price alerts
// GET /api/price-alerts/my-alerts
router.get('/my-alerts', getMyAlerts);

// Create new price alert
// POST /api/price-alerts/create
router.post('/create', createPriceAlert);

// Toggle alert active status
// PATCH /api/price-alerts/:id/toggle
router.patch('/:id/toggle', toggleAlert);

// Delete price alert
// DELETE /api/price-alerts/:id
router.delete('/:id', deleteAlert);

// Manual price check for all active alerts (admin/testing)
// POST /api/price-alerts/check-prices
router.post('/check-prices', checkAllActivePrices);

module.exports = router;