const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['Video', 'Podcast', 'Article'],
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  file: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model('Content', ContentSchema);