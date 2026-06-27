const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveMongoUri } = require("../config/db");

test("prefers MONGODB_URI when provided", () => {
  process.env.MONGODB_URI = "mongodb://primary.example.com";
  delete process.env.MONGO_URI;
  delete process.env.DATABASE_URL;

  assert.equal(resolveMongoUri(), "mongodb://primary.example.com");
});

test("falls back to MONGO_URI when MONGODB_URI is absent", () => {
  delete process.env.MONGODB_URI;
  process.env.MONGO_URI = "mongodb://fallback.example.com";
  delete process.env.DATABASE_URL;

  assert.equal(resolveMongoUri(), "mongodb://fallback.example.com");
});

test("returns null when no database URI is configured", () => {
  delete process.env.MONGODB_URI;
  delete process.env.MONGO_URI;
  delete process.env.DATABASE_URL;

  assert.equal(resolveMongoUri(), null);
});
