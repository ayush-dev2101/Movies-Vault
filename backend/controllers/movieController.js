const Favorite = require('../models/Favorite');
const Watchlist = require('../models/Watchlist');
const Review = require('../models/Review');
const SearchHistory = require('../models/SearchHistory');

// @desc    Add movie to favorites
// @route   POST /api/movies/favorites
// @access  Private
exports.addToFavorites = async (req, res) => {
  const { movieId, title, posterPath, rating, releaseDate } = req.body;

  try {
    const favorite = await Favorite.create({
      user: req.user._id,
      movieId,
      title,
      posterPath,
      rating,
      releaseDate
    });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(400).json({ message: 'Movie already in favorites' });
  }
};

// @desc    Get user favorites
// @route   GET /api/movies/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove movie from favorites
// @route   DELETE /api/movies/favorites/:movieId
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ user: req.user._id, movieId: req.params.movieId });
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/movies/watchlist
// @access  Private
exports.addToWatchlist = async (req, res) => {
  const { movieId, title, posterPath, rating, releaseDate } = req.body;

  try {
    const watchlist = await Watchlist.create({
      user: req.user._id,
      movieId,
      title,
      posterPath,
      rating,
      releaseDate
    });
    res.status(201).json(watchlist);
  } catch (error) {
    res.status(400).json({ message: 'Movie already in watchlist' });
  }
};

// @desc    Get user watchlist
// @route   GET /api/movies/watchlist
// @access  Private
exports.getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user._id });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/movies/watchlist/:movieId
// @access  Private
exports.removeFromWatchlist = async (req, res) => {
  try {
    await Watchlist.findOneAndDelete({ user: req.user._id, movieId: req.params.movieId });
    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
