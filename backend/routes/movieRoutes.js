const express = require('express');
const router = express.Router();
const { 
  addToFavorites, 
  getFavorites, 
  removeFromFavorites,
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist
} = require('../controllers/movieController');
const { syncUser } = require('../controllers/userSyncController');
const { protect } = require('../middleware/auth');
const {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  searchMovies,
  getMovieDetails
} = require('../controllers/tmdbController');

// Public TMDB Routes
router.get('/tmdb/trending', getTrendingMovies);
router.get('/tmdb/popular', getPopularMovies);
router.get('/tmdb/top_rated', getTopRatedMovies);
router.get('/tmdb/upcoming', getUpcomingMovies);
router.get('/tmdb/search', searchMovies);
router.get('/tmdb/:movieId', getMovieDetails);

router.use(protect);

router.post('/sync-user', syncUser);

router.get('/favorites', getFavorites);
router.post('/favorites/add', addToFavorites);
router.delete('/favorites/remove/:movieId', removeFromFavorites);

router.get('/watchlist', getWatchlist);
router.post('/watchlist/add', addToWatchlist);
router.delete('/watchlist/remove/:movieId', removeFromWatchlist);

module.exports = router;
