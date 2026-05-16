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

router.route('/favorites')
  .get(getFavorites)
  .post(addToFavorites);

router.delete('/favorites/:movieId', removeFromFavorites);

router.route('/watchlist')
  .get(getWatchlist)
  .post(addToWatchlist);

router.delete('/watchlist/:movieId', removeFromWatchlist);

module.exports = router;
