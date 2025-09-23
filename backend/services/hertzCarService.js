const axios = require('axios');
const apiConfig = require('../../config/apiConfig');

class HertzCarService {
  constructor() {
    this.apiKey = apiConfig.hertz.apiKey;
    this.apiUrl = apiConfig.hertz.apiUrl;
  }

  async searchCars(location, pickupDate, returnDate, options = {}) {
    try {
      const params = {
        location,
        pickup_date: pickupDate,
        return_date: returnDate,
        ...(options.vehicleType && { vehicle_type: options.vehicleType }),
        ...(options.transmission && { transmission: options.transmission }),
        ...(options.airConditioning && { air_conditioning: options.airConditioning })
      };

      const response = await axios.get(`${this.apiUrl}/vehicles/search`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params
      });

      return response.data;
    } catch (error) {
      throw new Error(`Car search failed: ${error.message}`);
    }
  }

  async getCarDetails(carId) {
    try {
      const response = await axios.get(`${this.apiUrl}/vehicles/${carId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get car details: ${error.message}`);
    }
  }

  async getRentalRates(carId, pickupDate, returnDate, options = {}) {
    try {
      const params = {
        pickup_date: pickupDate,
        return_date: returnDate,
        ...(options.currency && { currency: options.currency || 'USD' })
      };

      const response = await axios.get(`${this.apiUrl}/vehicles/${carId}/rates`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get rental rates: ${error.message}`);
    }
  }
}

module.exports = new HertzCarService();
