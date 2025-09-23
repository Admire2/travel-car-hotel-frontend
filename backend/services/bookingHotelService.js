const axios = require('axios');
const apiConfig = require('../../config/apiConfig');

class BookingHotelService {
  constructor() {
    this.apiKey = apiConfig.booking.apiKey;
    this.apiUrl = apiConfig.booking.apiUrl;
  }

  async searchHotels(location, checkinDate, checkoutDate, options = {}) {
    try {
      const params = {
        dest_ids: location,
        dest_type: options.destType || 'city',
        checkin_date: checkinDate,
        checkout_date: checkoutDate,
        adults_number: options.adults || 2,
        children_number: options.children || 0,
        room_number: options.rooms || 1,
        ...(options.priceFilter && { price_filter: options.priceFilter }),
        ...(options.orderBy && { order_by: options.orderBy }),
        ...(options.filterByCurrency && { filter_by_currency: options.filterByCurrency || 'USD' })
      };

      const response = await axios.get(`${this.apiUrl}/hotels/search`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        },
        params
      });

      return response.data;
    } catch (error) {
      throw new Error(`Hotel search failed: ${error.message}`);
    }
  }

  async getHotelDetails(hotelId, checkinDate, checkoutDate, options = {}) {
    try {
      const params = {
        hotel_id: hotelId,
        checkin_date: checkinDate,
        checkout_date: checkoutDate,
        adults_number: options.adults || 2,
        children_number: options.children || 0,
        room_number: options.rooms || 1
      };

      const response = await axios.get(`${this.apiUrl}/hotels/details`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        },
        params
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get hotel details: ${error.message}`);
    }
  }

  async getHotelPhotos(hotelId) {
    try {
      const response = await axios.get(`${this.apiUrl}/hotels/photos`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        },
        params: {
          hotel_id: hotelId
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get hotel photos: ${error.message}`);
    }
  }
}

module.exports = new BookingHotelService();
