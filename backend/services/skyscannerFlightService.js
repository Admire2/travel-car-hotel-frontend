const axios = require('axios');
const apiConfig = require('../../config/apiConfig');

class SkyscannerFlightService {
  constructor() {
    this.apiKey = apiConfig.skyscanner.apiKey;
    this.apiUrl = apiConfig.skyscanner.apiUrl;
  }

  async searchFlights(origin, destination, outboundDate, inboundDate = null, options = {}) {
    try {
      const params = {
        apiKey: this.apiKey,
        originplace: origin,
        destinationplace: destination,
        outbounddate: outboundDate,
        ...(inboundDate && { inbounddate: inboundDate }),
        ...(options.cabinclass && { cabinclass: options.cabinclass }),
        ...(options.adults && { adults: options.adults }),
        ...(options.currency && { currency: options.currency || 'USD' })
      };

      // Skyscanner requires session creation first
      const sessionResponse = await axios.post(`${this.apiUrl}/pricing/v1.0`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-RapidAPI-Key': this.apiKey
        }
      });

      // Poll for results (simplified)
      const sessionKey = sessionResponse.headers.location.split('/').pop();

      const searchResponse = await axios.get(`${this.apiUrl}/pricing/v1.0/${sessionKey}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey
        },
        params: {
          sortType: options.sortType || 'price',
          pageSize: options.pageSize || 10
        }
      });

      return searchResponse.data;
    } catch (error) {
      throw new Error(`Skyscanner flight search failed: ${error.message}`);
    }
  }

  async getQuotes(origin, destination, outboundPartialDate, inboundPartialDate = null) {
    try {
      const response = await axios.get(`${this.apiUrl}/browsequotes/v1.0/${origin}/${destination}/${outboundPartialDate}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey
        },
        params: {
          ...(inboundPartialDate && { inboundpartialdate: inboundPartialDate })
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get quotes: ${error.message}`);
    }
  }
}

module.exports = new SkyscannerFlightService();
