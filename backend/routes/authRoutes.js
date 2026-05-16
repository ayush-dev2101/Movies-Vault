const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  login,
  googleAuth
} = require('../controllers/authController');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/google', googleAuth);

module.exports = router;
