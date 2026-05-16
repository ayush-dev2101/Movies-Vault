const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log(`[Backend-Trace] Auth Middleware - Extracted Token Length: ${token.length}`);
      
      // Try to find user by Clerk ID (if token is a Clerk user ID or JWT)
      let user = await User.findOne({ clerkId: token });
      
      // If not found by Clerk ID, try finding by MongoDB ID (fallback for old system)
      if (!user && token.length === 24) {
        user = await User.findById(token).select('-password');
      }

      if (!user) {
        console.log(`[Backend-Trace] Auth Middleware - User lookup failed for token: ${token}`);
        return res.status(401).json({ message: 'User not found in database. Please sync.' });
      }

      console.log(`[Backend-Trace] Auth Middleware - Authenticated User ID: ${user._id}`);
      req.user = user;
      next();
    } catch (error) {
      console.error('[Backend-Trace] Auth Error:', error.message);
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
