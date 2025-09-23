const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  comment: { type: String, maxlength: 1000 },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

reviewSchema.index({ hotel: 1, rating: -1 });
reviewSchema.index({ car: 1, rating: -1 });
reviewSchema.index({ flight: 1, rating: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isVerified: 1, rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ hotel: 1, rating: -1, createdAt: -1 });
reviewSchema.index({ rating: -1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
