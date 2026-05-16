const Favorite = require('../models/Favorite');
const Watchlist = require('../models/Watchlist');
const Review = require('../models/Review');
const SearchHistory = require('../models/SearchHistory');

// @desc    Add movie to favorites
// @route   POST /api/movies/favorites
// @access  Private
exports.addToFavorites = async (req, res) => {
  const { movieId, title, posterPath, backdropPath, rating, releaseDate } = req.body;
  console.log(`[Backend-Trace] POST /favorites/add`);
  console.log(`[Backend-Trace] Authenticated User: ${req.user._id}`);
  console.log(`[Backend-Trace] Payload:`, { movieId, title, posterPath, backdropPath, rating, releaseDate });

  try {
    const favorite = await Favorite.findOneAndUpdate(
      { user: req.user._id, movieId },
      { title, posterPath, backdropPath, rating, releaseDate },
      { upsert: true, new: true }
    );
    console.log(`[Backend-Trace] Successfully stored/updated favorite: ${movieId}`);
    res.status(201).json(favorite);
  } catch (error) {
    console.error('[Backend-Trace] Add to Favorites Error:', error.message);
    res.status(500).json({ message: 'Failed to add to favorites', error: error.message });
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
  console.log(`[Backend-Trace] DELETE /favorites/remove/${req.params.movieId}`);
  try {
    const deleted = await Favorite.findOneAndDelete({
      user: req.user._id,
      movieId: req.params.movieId
    });
    if (!deleted) {
      console.log(`[Backend-Trace] Favorite not found for deletion: ${req.params.movieId}`);
      return res.status(404).json({ message: 'Movie not found in favorites' });
    }
    console.log(`[Backend-Trace] Successfully removed favorite: ${req.params.movieId}`);
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('[Backend-Trace] Remove from Favorites Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/movies/watchlist
// @access  Private
exports.addToWatchlist = async (req, res) => {
  const { movieId, title, posterPath, backdropPath, rating, releaseDate } = req.body;
  console.log(`[Backend-Trace] POST /watchlist/add`);
  console.log(`[Backend-Trace] Authenticated User: ${req.user._id}`);
  console.log(`[Backend-Trace] Payload:`, { movieId, title, posterPath, backdropPath, rating, releaseDate });

  try {
    const watchlist = await Watchlist.findOneAndUpdate(
      { user: req.user._id, movieId },
      { title, posterPath, backdropPath, rating, releaseDate },
      { upsert: true, new: true }
    );
    console.log(`[Backend-Trace] Successfully stored/updated watchlist: ${movieId}`);
    res.status(201).json(watchlist);
  } catch (error) {
    console.error('[Backend-Trace] Add to Watchlist Error:', error.message);
    res.status(500).json({ message: 'Failed to add to watchlist', error: error.message });
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
  console.log(`[Backend-Trace] DELETE /watchlist/remove/${req.params.movieId}`);
  try {
    const deleted = await Watchlist.findOneAndDelete({
      user: req.user._id,
      movieId: req.params.movieId
    });
    if (!deleted) {
      console.log(`[Backend-Trace] Watchlist item not found for deletion: ${req.params.movieId}`);
      return res.status(404).json({ message: 'Movie not found in watchlist' });
    }
    console.log(`[Backend-Trace] Successfully removed watchlist item: ${req.params.movieId}`);
    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('[Backend-Trace] Remove from Watchlist Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
