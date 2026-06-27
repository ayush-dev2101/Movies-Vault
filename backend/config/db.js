const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('CRITICAL: MONGODB_URI is not defined in environment variables!');
      process.exit(1);
    }

    console.log(`[${new Date().toISOString()}] Attempting to connect to MongoDB...`);
    const conn = await mongoose.connect(mongoUri);
    console.log(`[${new Date().toISOString()}] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    // We exit so Railway can try to restart the container, but now we know why
    process.exit(1);
  }
};

module.exports = connectDB;
