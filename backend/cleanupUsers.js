const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanupUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.connection.collection('users');
        const OTP = mongoose.connection.collection('otps');

        const result = await User.deleteMany({ isVerified: false });
        console.log(`Deleted ${result.deletedCount} unverified users.`);

        const otpResult = await OTP.deleteMany({ type: 'verification' });
        console.log(`Deleted ${otpResult.deletedCount} verification OTPs.`);

    } catch (error) {
        console.error('Cleanup error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

cleanupUsers();
