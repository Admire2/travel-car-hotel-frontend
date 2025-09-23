// Search controller for unified search
const Car = require('../models/car');
const Hotel = require('../models/hotel');
const Reservation = require('../models/reservation');

exports.searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    const carResults = await Car.find({ $text: { $search: q } });
    const hotelResults = await Hotel.find({ $text: { $search: q } });
    const reservationResults = await Reservation.find({ $text: { $search: q } });
    res.json({ cars: carResults, hotels: hotelResults, reservations: reservationResults });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
