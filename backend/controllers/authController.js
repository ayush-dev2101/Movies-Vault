const User = require('../models/User');
const OTP = require('../models/OTP');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/generateOTP');
const { sendOTP } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(`[${new Date().toISOString()}] Register request received for email: ${email}`);

  if (!name || !email || !password) {
    console.error(`[${new Date().toISOString()}] Register failed: Missing fields`);
    return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, password)' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    // Delete any existing unverified OTPs for this email to prevent duplicates
    await OTP.deleteMany({ email, type: 'verification' });

    const otp = generateOTP();
    await OTP.create({
      email,
      otp,
      type: 'verification'
    });

    await sendOTP(email, otp, 'verification');

    console.log(`[${new Date().toISOString()}] Registration successful for email: ${email}`);
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      userId: user._id
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Register error:`, error.message);
    res.status(500).json({ success: false, message: 'Server error during registration: ' + error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  const { email, otp, type } = req.body;
  console.log(`[${new Date().toISOString()}] OTP Verification requested for email: ${email}`);

  try {
    const otpRecord = await OTP.findOne({ email, otp, type });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (type === 'verification') {
      const user = await User.findOne({ email });
      if (user) {
        user.isVerified = true;
        await user.save();
      }
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    console.log(`[${new Date().toISOString()}] OTP verified successfully for email: ${email}`);
    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Verify OTP error:`, error.message);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[${new Date().toISOString()}] Login request received for email: ${email}`);

  if (!email || !password) {
    console.error(`[${new Date().toISOString()}] Login failed: Missing email or password`);
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      if (!user.isVerified) {
        // Delete any existing unverified OTPs for this email to prevent duplicates
        await OTP.deleteMany({ email, type: 'verification' });

        const otp = generateOTP();
        await OTP.create({
          email,
          otp,
          type: 'verification'
        });

        await sendOTP(email, otp, 'verification');

        return res.status(403).json({ 
          success: false, 
          message: 'Email not verified. A new OTP has been sent to your email.',
          requiresVerification: true,
          email 
        });
      }

      console.log(`[${new Date().toISOString()}] Login successful for user ID: ${user._id}`);
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      console.warn(`[${new Date().toISOString()}] Login failed: Invalid email or password for ${email}`);
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Login error:`, error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Google Authentication
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  const { idToken } = req.body;
  console.log(`[${new Date().toISOString()}] Google Auth request received`);

  if (!idToken) {
    console.error(`[${new Date().toISOString()}] Google Auth failed: No idToken provided`);
    return res.status(400).json({ success: false, message: 'Google ID Token is required' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: [
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID
      ].filter(Boolean),
    });
    const { name, email, sub: googleId, picture: avatar } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        isVerified: true, // Google accounts are pre-verified
        authProvider: 'google'
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = avatar;
      user.isVerified = true;
      user.authProvider = 'google';
      await user.save();
    }

    console.log(`[${new Date().toISOString()}] Google Auth successful for user: ${email}`);
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Google Auth failed:`, error.message);
    res.status(400).json({ success: false, message: 'Google authentication failed. Token may be invalid or expired.' });
  }
};
