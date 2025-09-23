const amadeusFlightService = require('./amadeusFlightService');
const skyscannerFlightService = require('./skyscannerFlightService');
const bookingHotelService = require('./bookingHotelService');
const hertzCarService = require('./hertzCarService');

class TravelService {
  // Flight methods
  async searchFlights(origin, destination, departureDate, returnDate = null, options = {}) {
    try {
      // Try Amadeus first, fallback to Skyscanner
      return await amadeusFlightService.searchFlights(origin, destination, departureDate, returnDate, options);
    } catch (amadeusError) {
      try {
        return await skyscannerFlightService.searchFlights(origin, destination, departureDate, returnDate, options);
      } catch (skyscannerError) {
        throw new Error(`All flight search services failed: ${amadeusError.message}, ${skyscannerError.message}`);
      }
    }
  }

  // Hotel methods
  async searchHotels(location, checkinDate, checkoutDate, options = {}) {
    try {
      return await bookingHotelService.searchHotels(location, checkinDate, checkoutDate, options);
    } catch (error) {
      throw new Error(`Hotel search failed: ${error.message}`);
    }
  }

  // Car rental methods
  async searchCars(location, pickupDate, returnDate, options = {}) {
    try {
      return await hertzCarService.searchCars(location, pickupDate, returnDate, options);
    } catch (error) {
      throw new Error(`Car search failed: ${error.message}`);
    }
  }

  // Combined search
  async searchTravelOptions(flightParams, hotelParams, carParams) {
    const results = {};

    try {
      if (flightParams) {
        results.flights = await this.searchFlights(
          flightParams.origin,
          flightParams.destination,
          flightParams.departureDate,
          flightParams.returnDate,
          flightParams.options
        );
      }

      if (hotelParams) {
        results.hotels = await this.searchHotels(
          hotelParams.location,
          hotelParams.checkinDate,
          hotelParams.checkoutDate,
          hotelParams.options
        );
      }

      if (carParams) {
        results.cars = await this.searchCars(
          carParams.location,
          carParams.pickupDate,
          carParams.returnDate,
          carParams.options
        );
      }

      return results;
    } catch (error) {
      throw new Error(`Travel search failed: ${error.message}`);
    }
  }
}

module.exports = new TravelService();
