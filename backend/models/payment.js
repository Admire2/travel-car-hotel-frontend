const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String, enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'], required: true },
  paymentGateway: { type: String, enum: ['stripe', 'paypal', 'razorpay', 'custom'] },
  transactionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'], default: 'pending' },
  paymentDate: { type: Date, default: Date.now },
  refundDate: { type: Date },
  billingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    zipCode: { type: String, required: true }
  }
}, { timestamps: true });

paymentSchema.index({ user: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ 'billingAddress.country': 1 });

module.exports = mongoose.model('Payment', paymentSchema);
