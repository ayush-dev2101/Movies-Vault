const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
const User = require('../models/User');

// Cache JWKS clients by their issuer domain to avoid duplicate network fetches
const jwksClients = {};

const getJwksClient = (issuer) => {
  if (!jwksClients[issuer]) {
    jwksClients[issuer] = jwksRsa({
      jwksUri: `${issuer}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMin: 10
    });
  }
  return jwksClients[issuer];
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 1. Decode token to extract issuer (iss) and key ID (kid) from header/payload
      const decodedToken = jwt.decode(token, { complete: true });
      if (!decodedToken || !decodedToken.header || !decodedToken.payload) {
        console.error('[Backend-Trace] Auth Middleware - Invalid or malformed JWT');
        return res.status(401).json({ message: 'Not authorized, malformed token' });
      }

      const { kid } = decodedToken.header;
      const { iss } = decodedToken.payload;

      if (!iss || !iss.includes('clerk')) {
        console.error(`[Backend-Trace] Auth Middleware - Untrusted Issuer: ${iss}`);
        return res.status(401).json({ message: 'Not authorized, untrusted token issuer' });
      }

      // 2. Fetch the corresponding public key dynamically from Clerk's JWKS
      const client = getJwksClient(iss);
      const key = await client.getSigningKey(kid);
      const signingKey = key.getPublicKey();

      // 3. Cryptographically verify signature, audience, and expiration
      jwt.verify(token, signingKey, { algorithms: ['RS256'] }, async (err, verified) => {
        if (err) {
          console.error(`[Backend-Trace] Auth Middleware - Signature verification failed: ${err.message}`);
          return res.status(401).json({ message: 'Not authorized, token verification failed', error: err.message });
        }

        const clerkId = verified.sub;
        console.log(`[Backend-Trace] Auth Middleware - Cryptographically verified Clerk JWT for: ${clerkId}`);

        // 4. Look up MongoDB user using verified Clerk ID
        let user = await User.findOne({ clerkId });

        if (!user) {
          console.warn(`[Backend-Trace] Auth Middleware - Verified user ${clerkId} not found in DB yet.`);

          // Allow the request to proceed ONLY if it is heading to the /sync-user route
          // This allows new users to register securely without a chicken-and-egg race condition
          if (req.path === '/sync-user') {
            req.clerkId = clerkId;
            return next();
          }

          return res.status(401).json({ message: 'User not found in database. Please sync.' });
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
