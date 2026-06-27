const mongoose = require("mongoose");

const resolveMongoUri = (env = process.env) => {
  const candidates = [
    env.MONGODB_URI,
    env.MONGO_URI,
    env.DATABASE_URL,
    env.MONGODB_URL,
  ];
  return (
    candidates.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    ) || null
  );
};

const connectDB = async () => {
  try {
    const mongoUri = resolveMongoUri();
    if (!mongoUri) {
      console.error(
        "CRITICAL: No MongoDB connection string found. Set MONGODB_URI (or MONGO_URI / DATABASE_URL).",
      );
      process.exit(1);
    }

    console.log(
      `[${new Date().toISOString()}] Attempting to connect to MongoDB...`,
    );
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    console.log(
      `[${new Date().toISOString()}] MongoDB Connected: ${conn.connection.host}`,
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (error?.name === "MongoServerError" || error?.code === 8000) {
      console.error(
        "Authentication failed. Verify the Atlas username, password, and database user permissions.",
      );
    }
    process.exit(1);
  }
};

module.exports = { connectDB, resolveMongoUri };
