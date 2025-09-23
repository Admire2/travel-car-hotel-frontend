
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, match: /.+@.+\..+/, trim: true },
  password: { type: String, required: true, minlength: 8 },
  phone: { type: String, trim: true },
  dateOfBirth: { type: Date },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  profileImage: { type: String },
  preferences: {
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  loyaltyPoints: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin', 'partner'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ lastName: 1, firstName: 1 });
userSchema.index({ loyaltyPoints: -1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
userSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model('User', userSchema);
