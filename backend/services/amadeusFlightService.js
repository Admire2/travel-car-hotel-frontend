const axios = require('axios');
const apiConfig = require('../../config/apiConfig');

class AmadeusFlightService {
  constructor() {
    this.apiKey = apiConfig.amadeus.apiKey;
    this.apiSecret = apiConfig.amadeus.apiSecret;
    this.apiUrl = apiConfig.amadeus.apiUrl;
    this.accessToken = null;
  }

  async authenticate() {
    try {
      const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token',
        `grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.apiSecret}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async searchFlights(origin, destination, departureDate, returnDate = null, options = {}) {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const params = new URLSearchParams({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        adults: options.adults || 1,
        ...(returnDate && { returnDate }),
        ...(options.maxPrice && { maxPrice: options.maxPrice }),
        ...(options.currencyCode && { currencyCode: options.currencyCode })
      });

      const response = await axios.get(`${this.apiUrl}/shopping/flight-offers?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Flight search failed: ${error.message}`);
    }
  }

  async getFlightDetails(flightId) {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await axios.get(`${this.apiUrl}/shopping/flight-offers/${flightId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get flight details: ${error.message}`);
    }
  }
}

module.exports = new AmadeusFlightService();
