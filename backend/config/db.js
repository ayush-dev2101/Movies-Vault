const mongoose = require("mongoose");

const resolveMongoUri = (env = process.env) => {
  const candidates = [
    env.MONGODB_URI,
    env.MONGO_URI,
    env.DATABASE_URL,
    env.MONGODB_URL,
  ];

  const found = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  if (found) return found;

  // If a full URI wasn't provided, allow building one from parts.
  // This helps avoid authentication failures when passwords contain
  // special characters (they must be URL-encoded) and supports
  // deployment platforms (like Railway) that store secrets separately.
  const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB, MONGO_OPTIONS } = env;
  if (MONGO_USER && MONGO_PASS && MONGO_HOST) {
    const user = encodeURIComponent(MONGO_USER);
    const pass = encodeURIComponent(MONGO_PASS);
    const db = MONGO_DB || "admin";
    const options = MONGO_OPTIONS || "retryWrites=true&w=majority";

    // If host already looks like an SRV host (mongodb+srv://...), don't double prepend
    const host = MONGO_HOST.replace(/^mongodb(\+srv)?:\/\//, "");
    return `mongodb+srv://${user}:${pass}@${host}/${db}?${options}`;
  }

  return null;
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
