require('dotenv').config();

const apiConfig = {
  amadeus: {
    apiKey: process.env.AMADEUS_API_KEY || 'your_amadeus_api_key',
    apiSecret: process.env.AMADEUS_API_SECRET || 'your_amadeus_api_secret',
    apiUrl: process.env.AMADEUS_API_URL || 'https://test.api.amadeus.com/v1',
  },
  skyscanner: {
    apiKey: process.env.SKYSCANNER_API_KEY || 'your_skyscanner_api_key',
    apiUrl: process.env.SKYSCANNER_API_URL || 'https://partners.api.skyscanner.net/apiservices',
  },
  booking: {
    apiKey: process.env.BOOKING_API_KEY || 'your_booking_api_key',
    apiUrl: process.env.BOOKING_API_URL || 'https://booking-com.p.rapidapi.com/v1',
  },
  hertz: {
    apiKey: process.env.HERTZ_API_KEY || 'your_hertz_api_key',
    apiUrl: process.env.HERTZ_API_URL || 'https://api.hertz.com/v1',
  }
};

module.exports = apiConfig;
