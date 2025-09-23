// currencyController.js - Backend controller for currency exchange rates
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for exchange rates (1 hour TTL)
const rateCache = new NodeCache({ stdTTL: 3600 });

// Supported currency providers
const CURRENCY_PROVIDERS = {
  FIXER: 'fixer.io',
  EXCHANGERATE: 'exchangerate-api.com',
  CURRENCYLAYER: 'currencylayer.com',
  MOCK: 'mock'
};

// Configuration
const CONFIG = {
  defaultProvider: process.env.CURRENCY_PROVIDER || CURRENCY_PROVIDERS.MOCK,
  firerApiKey: process.env.FIXER_API_KEY,
  exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY,
  currencyLayerApiKey: process.env.CURRENCY_LAYER_API_KEY,
  baseCurrency: 'USD',
  cacheTTL: 3600, // 1 hour
  timeout: 10000, // 10 seconds
  retryAttempts: 3
};

// Supported currencies
const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
  'INR', 'KRW', 'SGD', 'HKD', 'SEK', 'NOK', 'DKK', 'NZD',
  'MXN', 'BRL', 'RUB', 'ZAR'
];

// Mock exchange rates for development
const MOCK_RATES = {
  USD: 1.0,
  EUR: 0.8534,
  GBP: 0.7321,
  JPY: 110.24,
  CAD: 1.2547,
  AUD: 1.3562,
  CHF: 0.9187,
  CNY: 6.4521,
  INR: 74.52,
  KRW: 1183.45,
  SGD: 1.3487,
  HKD: 7.7865,
  SEK: 8.6234,
  NOK: 8.5147,
  DKK: 6.3895,
  NZD: 1.4236,
  MXN: 20.156,
  BRL: 5.2341,
  RUB: 73.584,
  ZAR: 14.823
};

// Get current exchange rates
const getExchangeRates = async (req, res) => {
  try {
    const { base = 'USD', currencies, provider } = req.query;

    // Validate base currency
    if (!SUPPORTED_CURRENCIES.includes(base.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Unsupported base currency: ${base}. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`
      });
    }

    const baseCurrency = base.toUpperCase();
    const cacheKey = `rates_${baseCurrency}_${provider || CONFIG.defaultProvider}`;

    // Try to get from cache first
    const cachedRates = rateCache.get(cacheKey);
    if (cachedRates) {
      return res.json({
        success: true,
        base: baseCurrency,
        rates: cachedRates,
        source: 'cache',
        timestamp: new Date().toISOString()
      });
    }

    // Fetch fresh rates
    const rates = await fetchExchangeRates(baseCurrency, provider);

    // Filter currencies if specific ones requested
    let filteredRates = rates;
    if (currencies) {
      const requestedCurrencies = currencies.split(',').map(c => c.toUpperCase());
      filteredRates = {};
      requestedCurrencies.forEach(currency => {
        if (rates[currency] !== undefined) {
          filteredRates[currency] = rates[currency];
        }
      });
    }

    // Cache the rates
    rateCache.set(cacheKey, filteredRates);

    res.json({
      success: true,
      base: baseCurrency,
      rates: filteredRates,
      source: provider || CONFIG.defaultProvider,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Try to return cached rates as fallback
    const fallbackKey = `rates_USD_${CONFIG.defaultProvider}`;
    const fallbackRates = rateCache.get(fallbackKey);
    
    if (fallbackRates) {
      return res.json({
        success: true,
        base: 'USD',
        rates: fallbackRates,
        source: 'cache_fallback',
        timestamp: new Date().toISOString(),
        warning: 'Using cached rates due to API error'
      });
    }

    // Return mock rates as last resort
    res.json({
      success: true,
      base: 'USD',
      rates: MOCK_RATES,
      source: 'mock_fallback',
      timestamp: new Date().toISOString(),
      warning: 'Using mock rates due to API unavailability'
    });
  }
};

// Fetch rates from external provider
const fetchExchangeRates = async (baseCurrency, provider) => {
  const selectedProvider = provider || CONFIG.defaultProvider;

  switch (selectedProvider) {
    case CURRENCY_PROVIDERS.FIXER:
      return await fetchFromFixer(baseCurrency);
    
    case CURRENCY_PROVIDERS.EXCHANGERATE:
      return await fetchFromExchangeRate(baseCurrency);
    
    case CURRENCY_PROVIDERS.CURRENCYLAYER:
      return await fetchFromCurrencyLayer(baseCurrency);
    
    case CURRENCY_PROVIDERS.MOCK:
    default:
      return await fetchMockRates(baseCurrency);
  }
};

// Fetch from Fixer.io
const fetchFromFixer = async (baseCurrency) => {
  if (!CONFIG.firerApiKey) {
    throw new Error('Fixer.io API key not configured');
  }

  const response = await axios.get('http://data.fixer.io/api/latest', {
    params: {
      access_key: CONFIG.firerApiKey,
      base: baseCurrency,
      symbols: SUPPORTED_CURRENCIES.join(',')
    },
    timeout: CONFIG.timeout
  });

  if (!response.data.success) {
    throw new Error(response.data.error?.info || 'Fixer.io API error');
  }

  return response.data.rates;
};

// Fetch from ExchangeRate-API
const fetchFromExchangeRate = async (baseCurrency) => {
  const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`, {
    timeout: CONFIG.timeout
  });

  if (!response.data.rates) {
    throw new Error('Invalid response from ExchangeRate-API');
  }

  // Filter to supported currencies only
  const filteredRates = {};
  SUPPORTED_CURRENCIES.forEach(currency => {
    if (response.data.rates[currency] !== undefined) {
      filteredRates[currency] = response.data.rates[currency];
    }
  });

  return filteredRates;
};

// Fetch from CurrencyLayer
const fetchFromCurrencyLayer = async (baseCurrency) => {
  if (!CONFIG.currencyLayerApiKey) {
    throw new Error('CurrencyLayer API key not configured');
  }

  const response = await axios.get('http://api.currencylayer.com/live', {
    params: {
      access_key: CONFIG.currencyLayerApiKey,
      source: baseCurrency,
      currencies: SUPPORTED_CURRENCIES.join(',')
    },
    timeout: CONFIG.timeout
  });

  if (!response.data.success) {
    throw new Error(response.data.error?.info || 'CurrencyLayer API error');
  }

  // CurrencyLayer returns rates with base currency prefix (e.g., USDEUR)
  const rates = {};
  Object.entries(response.data.quotes).forEach(([key, value]) => {
    const currency = key.replace(baseCurrency, '');
    if (SUPPORTED_CURRENCIES.includes(currency)) {
      rates[currency] = value;
    }
  });

  return rates;
};

// Fetch mock rates (for development)
const fetchMockRates = async (baseCurrency) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  if (baseCurrency === 'USD') {
    return MOCK_RATES;
  }

  // Convert all rates to the requested base currency
  const baseRate = MOCK_RATES[baseCurrency];
  if (!baseRate) {
    throw new Error(`Mock rate not available for ${baseCurrency}`);
  }

  const convertedRates = {};
  Object.entries(MOCK_RATES).forEach(([currency, rate]) => {
    convertedRates[currency] = rate / baseRate;
  });

  return convertedRates;
};

// Convert amount between currencies
const convertCurrency = async (req, res) => {
  try {
    const { amount, from, to, provider } = req.query;

    // Validate inputs
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Both from and to currencies are required'
      });
    }

    const fromCurrency = from.toUpperCase();
    const toCurrency = to.toUpperCase();
    const numericAmount = parseFloat(amount);

    if (!SUPPORTED_CURRENCIES.includes(fromCurrency) || !SUPPORTED_CURRENCIES.includes(toCurrency)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported currency. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`
      });
    }

    // If same currency, return original amount
    if (fromCurrency === toCurrency) {
      return res.json({
        success: true,
        amount: numericAmount,
        from: fromCurrency,
        to: toCurrency,
        rate: 1,
        converted: numericAmount,
        timestamp: new Date().toISOString()
      });
    }

    // Get exchange rates
    const rates = await fetchExchangeRates('USD', provider);

    // Convert via USD if necessary
    let convertedAmount;
    let exchangeRate;

    if (fromCurrency === 'USD') {
      exchangeRate = rates[toCurrency];
      convertedAmount = numericAmount * exchangeRate;
    } else if (toCurrency === 'USD') {
      exchangeRate = 1 / rates[fromCurrency];
      convertedAmount = numericAmount * exchangeRate;
    } else {
      // Convert from -> USD -> to
      const fromRate = rates[fromCurrency];
      const toRate = rates[toCurrency];
      exchangeRate = toRate / fromRate;
      convertedAmount = numericAmount * exchangeRate;
    }

    res.json({
      success: true,
      amount: numericAmount,
      from: fromCurrency,
      to: toCurrency,
      rate: exchangeRate,
      converted: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert currency',
      error: error.message
    });
  }
};

// Get supported currencies
const getSupportedCurrencies = async (req, res) => {
  try {
    const currencyInfo = SUPPORTED_CURRENCIES.map(code => ({
      code,
      name: getCurrencyName(code),
      symbol: getCurrencySymbol(code)
    }));

    res.json({
      success: true,
      currencies: currencyInfo,
      total: SUPPORTED_CURRENCIES.length
    });

  } catch (error) {
    console.error('Error getting supported currencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supported currencies',
      error: error.message
    });
  }
};

// Get currency historical data (mock implementation)
const getHistoricalRates = async (req, res) => {
  try {
    const { base = 'USD', symbols, start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Mock historical data (in real implementation, fetch from provider)
    const mockHistoricalData = generateMockHistoricalData(base, symbols, start_date, end_date);

    res.json({
      success: true,
      base: base.toUpperCase(),
      start_date,
      end_date,
      rates: mockHistoricalData
    });

  } catch (error) {
    console.error('Error getting historical rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get historical rates',
      error: error.message
    });
  }
};

// Clear cache
const clearCache = async (req, res) => {
  try {
    rateCache.flushAll();
    
    res.json({
      success: true,
      message: 'Currency cache cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
};

// Get cache statistics
const getCacheStats = async (req, res) => {
  try {
    const stats = rateCache.getStats();
    
    res.json({
      success: true,
      cache: {
        keys: rateCache.keys().length,
        hits: stats.hits,
        misses: stats.misses,
        ksize: stats.ksize,
        vsize: stats.vsize
      }
    });

  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics',
      error: error.message
    });
  }
};

// Utility functions
const getCurrencyName = (code) => {
  const names = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    INR: 'Indian Rupee',
    KRW: 'South Korean Won',
    SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar',
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    NZD: 'New Zealand Dollar',
    MXN: 'Mexican Peso',
    BRL: 'Brazilian Real',
    RUB: 'Russian Ruble',
    ZAR: 'South African Rand'
  };
  return names[code] || code;
};

const getCurrencySymbol = (code) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    KRW: '₩',
    SGD: 'S$',
    HKD: 'HK$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    NZD: 'NZ$',
    MXN: '$',
    BRL: 'R$',
    RUB: '₽',
    ZAR: 'R'
  };
  return symbols[code] || code;
};

const generateMockHistoricalData = (base, symbols, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  const historicalData = {};
  const targetSymbols = symbols ? symbols.split(',').map(s => s.toUpperCase()) : SUPPORTED_CURRENCIES;
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    historicalData[dateStr] = {};
    targetSymbols.forEach(symbol => {
      if (symbol !== base.toUpperCase()) {
        // Generate mock rate with some variation
        const baseRate = MOCK_RATES[symbol] || 1;
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        historicalData[dateStr][symbol] = Math.round((baseRate * (1 + variation)) * 10000) / 10000;
      }
    });
  }
  
  return historicalData;
};

module.exports = {
  getExchangeRates,
  convertCurrency,
  getSupportedCurrencies,
  getHistoricalRates,
  clearCache,
  getCacheStats
};