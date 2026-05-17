const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simple, high-performance in-memory cache for Clerk public JWK keys to prevent key-spamming
const jwksCache = {};
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetches the JWKS keys dynamically and caches them in memory.
 */
const getJwksKeys = async (issuer) => {
  const cached = jwksCache[issuer];
  const now = Date.now();

  if (cached && (now - cached.fetchedAt < CACHE_DURATION_MS)) {
    return cached.keys;
  }

  console.log(`[Backend-Trace] Fetching fresh JWKS keys from issuer: ${issuer}`);
  const response = await fetch(`${issuer}/.well-known/jwks.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS keys from issuer: ${response.statusText}`);
  }

  const jwks = await response.json();
  if (!jwks || !Array.isArray(jwks.keys)) {
    throw new Error('Invalid JWKS structure returned from issuer');
  }

  jwksCache[issuer] = {
    keys: jwks.keys,
    fetchedAt: now
  };

  return jwks.keys;
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      console.log(`[Backend-Trace] Auth Middleware - Received Token (Length: ${token.length})`);

      // 1. Decode token to extract issuer (iss) and key ID (kid)
      const decodedToken = jwt.decode(token, { complete: true });
      if (!decodedToken || !decodedToken.header || !decodedToken.payload) {
        console.error('[Backend-Trace] Auth Middleware - Invalid or malformed JWT structure');
        return res.status(401).json({ 
          message: 'Not authorized, malformed token structure', 
          error: 'Failed to decode JWT header/payload segments' 
        });
      }

      console.log('[Backend-Trace] Decoded JWT Header:', JSON.stringify(decodedToken.header));
      console.log('[Backend-Trace] Decoded JWT Payload (truncated sub/iss):', JSON.stringify({
        iss: decodedToken.payload.iss,
        sub: decodedToken.payload.sub,
        aud: decodedToken.payload.aud,
        exp: decodedToken.payload.exp,
        nbf: decodedToken.payload.nbf
      }));

      const { kid } = decodedToken.header;
      const { iss } = decodedToken.payload;

      if (!iss) {
        console.error('[Backend-Trace] Auth Middleware - Missing issuer (iss) claim');
        return res.status(401).json({ 
          message: 'Not authorized, token is missing the issuer (iss) claim',
          error: 'Missing iss claim' 
        });
      }

      if (!iss.includes('clerk') && !iss.includes('accounts.dev')) {
        console.error(`[Backend-Trace] Auth Middleware - Untrusted Issuer: ${iss}`);
        return res.status(401).json({ 
          message: `Not authorized, untrusted token issuer: ${iss}`, 
          error: 'Issuer validation failed' 
        });
      }

      // 2. Fetch the JWKS keys using the robust, cached fetcher
      let keys;
      try {
        keys = await getJwksKeys(iss);
      } catch (fetchError) {
        console.error(`[Backend-Trace] Auth Middleware - Failed to fetch JWKS keys from ${iss}:`, fetchError.message);
        return res.status(401).json({ 
          message: `Not authorized, failed to retrieve JWKS keys from ${iss}`, 
          error: fetchError.message 
        });
      }

      const jwk = keys.find(key => key.kid === kid);

      if (!jwk) {
        console.error(`[Backend-Trace] Auth Middleware - Matching JWK with kid ${kid} not found in JWKS`);
        return res.status(401).json({ 
          message: `Not authorized, signing key matching kid '${kid}' not found in JWKS keys`, 
          error: 'Key ID mismatch' 
        });
      }

      // 3. Convert JWK to native Public KeyObject using Node's crypto
      let publicKey;
      try {
        publicKey = crypto.createPublicKey({ format: 'jwk', key: jwk });
      } catch (cryptoError) {
        console.error('[Backend-Trace] Auth Middleware - Native Crypto JWK key conversion failed:', cryptoError.message);
        return res.status(401).json({ 
          message: 'Not authorized, JWK conversion error', 
          error: cryptoError.message 
        });
      }

      // 4. Cryptographically verify signature, audience, and expiration
      jwt.verify(token, publicKey, { algorithms: ['RS256'] }, async (err, verified) => {
        if (err) {
          console.error(`[Backend-Trace] Auth Middleware - Signature verification failed: ${err.message}`);
          return res.status(401).json({ 
            message: 'Not authorized, cryptographic token verification failed', 
            error: err.message,
            reason: err.name // e.g. TokenExpiredError, JsonWebTokenError
          });
        }

        const clerkId = verified.sub;
        console.log(`[Backend-Trace] Auth Middleware - Cryptographically verified Clerk JWT for: ${clerkId}`);

        // 5. Look up MongoDB user using verified Clerk ID
        let user = await User.findOne({ clerkId });

        if (!user) {
          console.warn(`[Backend-Trace] Auth Middleware - Verified user ${clerkId} not found in DB yet.`);

          // Allow the request to proceed ONLY if it is heading to the /sync-user route
          // This allows new users to register securely without a chicken-and-egg race condition
          if (req.path === '/sync-user') {
            req.clerkId = clerkId;
            return next();
          }

          return res.status(401).json({ 
            message: 'User not found in database. Please sync.',
            error: 'User unsynced' 
          });
        }

        req.user = user;
        req.clerkId = clerkId;
        next();
      });

    } catch (error) {
      console.error('[Backend-Trace] Cryptographic Auth Middleware Error:', error.message);
      return res.status(401).json({ message: 'Not authorized', error: error.message });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
