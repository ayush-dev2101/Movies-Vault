const User = require('../models/User');

/**
 * @desc    Sync Clerk user with MongoDB
 * @route   POST /api/movies/sync-user
 * @access  Private (Clerk ID required in body)
 */
exports.syncUser = async (req, res) => {
  const clerkId = req.clerkId;
  const { email, name, avatar } = req.body;

  if (!clerkId || !email) {
    return res.status(400).json({ message: 'Secure Clerk ID (from JWT) and email are required' });
  }

  try {
    let user = await User.findOne({ clerkId });

    if (user) {
      // Update existing user data if changed
      user.name = name || user.name;
      user.avatar = avatar || user.avatar;
      await user.save();
      return res.status(200).json(user);
    }

    // Check if user exists with this email but no clerkId (migration case)
    user = await User.findOne({ email });
    if (user) {
      user.clerkId = clerkId;
      user.avatar = avatar || user.avatar;
      await user.save();
      return res.status(200).json(user);
    }

    // Create new user
    user = await User.create({
      clerkId,
      email,
      name,
      avatar,
      isVerified: true,
      authProvider: 'clerk'
    });

    console.log(`[Backend-Trace] Successfully created and synchronized new Clerk User: ${clerkId} (${email})`);
    res.status(201).json(user);
  } catch (error) {
    console.error('[Backend-Trace] /sync-user - Internal Database Sync Error Stack:', error.stack);
    res.status(500).json({ 
      message: 'Internal Server Error during database user sync', 
      error: error.message 
    });
  }
};
