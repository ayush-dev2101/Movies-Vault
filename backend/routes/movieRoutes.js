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

router.post('/sync-user', syncUser);

router.use(protect);

router.get('/favorites', getFavorites);
router.post('/favorites/add', addToFavorites);
router.delete('/favorites/remove/:movieId', removeFromFavorites);

router.get('/watchlist', getWatchlist);
router.post('/watchlist/add', addToWatchlist);
router.delete('/watchlist/remove/:movieId', removeFromWatchlist);

module.exports = router;
