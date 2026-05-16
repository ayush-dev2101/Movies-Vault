const crypto = require('crypto');

/**
 * Generates a secure 6-digit numeric OTP using Node.js crypto module.
 * This is more secure than Math.random() and prevents "crypto is not defined" errors.
 */
const generateOTP = () => {
  // Generates a random integer between 100000 and 999999
  return crypto.randomInt(100000, 1000000).toString();
};

module.exports = generateOTP;
