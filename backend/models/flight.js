const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  airline: { type: String, required: true },
  flightNumber: { type: String, required: true },
  departureAirport: {
    code: { type: String, required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  arrivalAirport: {
    code: { type: String, required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  duration: { type: Number },
  aircraft: { type: String },
  class: { type: String, enum: ['economy', 'premium_economy', 'business', 'first'], default: 'economy' },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  availableSeats: {
    economy: { type: Number, default: 0 },
    premium_economy: { type: Number, default: 0 },
    business: { type: Number, default: 0 },
    first: { type: Number, default: 0 }
  },
  totalSeats: {
    economy: { type: Number, default: 0 },
    premium_economy: { type: Number, default: 0 },
    business: { type: Number, default: 0 },
    first: { type: Number, default: 0 }
  },
  amenities: [{ type: String }]
}, { timestamps: true });

flightSchema.index({ 'departureAirport.code': 1, 'arrivalAirport.code': 1 });
flightSchema.index({ departureTime: 1 });
flightSchema.index({ arrivalTime: 1 });
flightSchema.index({ airline: 1 });
flightSchema.index({ flightNumber: 1 });
flightSchema.index({ 'departureAirport.city': 1, 'arrivalAirport.city': 1 });
flightSchema.index({ departureTime: 1, 'departureAirport.code': 1 });

module.exports = mongoose.model('Flight', flightSchema);
