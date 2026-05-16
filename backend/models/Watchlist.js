const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
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
  backdropPath: String,
  rating: Number,
  releaseDate: String
}, {
  timestamps: true
});

watchlistSchema.index({ user: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
