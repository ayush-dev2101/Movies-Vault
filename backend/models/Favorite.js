const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: Number,
    required: true
  },
  title: String,
  posterPath: String,
  rating: Number,
  releaseDate: String
}, {
  timestamps: true
});

// Prevent duplicate favorites for the same user and movie
favoriteSchema.index({ user: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
