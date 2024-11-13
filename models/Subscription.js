const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expirationDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);