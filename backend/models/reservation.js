const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingType: { type: String, enum: ['flight', 'hotel', 'car', 'package'], required: true },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  passengers: [{
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },
    passportNumber: { type: String }
  }],
  checkInDate: { type: Date },
  checkOutDate: { type: Date },
  pickupDate: { type: Date },
  returnDate: { type: Date },
  totalPrice: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  specialRequests: { type: String }
}, { timestamps: true });

reservationSchema.index({ user: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ bookingType: 1 });
reservationSchema.index({ createdAt: -1 });
reservationSchema.index({ checkInDate: 1 });
reservationSchema.index({ pickupDate: 1 });
reservationSchema.index({ status: 1, user: 1 });
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ checkInDate: 1, checkOutDate: 1 });
reservationSchema.index({ bookingType: 1, createdAt: -1 });

module.exports = mongoose.model('Reservation', reservationSchema);
