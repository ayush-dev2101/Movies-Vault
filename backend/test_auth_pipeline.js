const crypto = require('crypto');
const assert = require('assert');
const jwt = require('jsonwebtoken');

console.log('==================================================');
console.log('🕵️‍♂️ CLERK JWT CRYPTOGRAPHIC VERIFICATION TEST SUITE');
console.log('==================================================\n');

// 1. Generate local RSA Key Pair for mock signing and JWKS conversion
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const mockJwk = publicKeyToJwk(publicKey, 'ins_mock_kid_123');

function publicKeyToJwk(pubKeyPem, kid) {
  const pubKey = crypto.createPublicKey(pubKeyPem);
  const jwk = pubKey.export({ format: 'jwk' });
  jwk.kid = kid;
  jwk.use = 'sig';
  jwk.alg = 'RS256';
  return jwk;
}

// Mock Issuer
const MOCK_ISSUER = 'https://sharp-cow-96.clerk.accounts.dev';

// Mock DB User Model and express request/response
const mockUserDb = [];
const mockUser = { clerkId: 'user_mock_clerk_id_123', _id: '6a08557d173449dbbfcf5036', name: 'Test User' };
mockUserDb.push(mockUser);

const mockProtectMiddleware = async (req, res, next, jwkKeys) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token to extract issuer and kid
      const decodedToken = jwt.decode(token, { complete: true });
      if (!decodedToken || !decodedToken.header || !decodedToken.payload) {
        return res.status(401).json({ error: 'Not authorized, malformed token' });
      }

      const { kid } = decodedToken.header;
      const { iss } = decodedToken.payload;

      if (!iss || !iss.includes('clerk')) {
        return res.status(401).json({ error: 'Not authorized, untrusted token issuer' });
      }

      // Resolve JWK key from provided keys parameter (simulating JWKS resolution)
      const jwk = jwkKeys.find(key => key.kid === kid);
      if (!jwk) {
        return res.status(401).json({ error: 'Not authorized, signing key not found' });
      }

      // Convert JWK to PEM public key natively using crypto
      const verifiedPublicKey = crypto.createPublicKey({ format: 'jwk', key: jwk });

      // Verify token signature, audience, expiration
      jwt.verify(token, verifiedPublicKey, { algorithms: ['RS256'] }, async (err, verified) => {
        if (err) {
          return res.status(401).json({ error: 'Not authorized, token verification failed', reason: err.message });
        }

        const clerkId = verified.sub;
        const user = mockUserDb.find(u => u.clerkId === clerkId);

        if (!user) {
          if (req.path === '/sync-user') {
            req.clerkId = clerkId;
            return next();
          }
          return res.status(401).json({ error: 'User not found in database. Please sync.' });
        }

        req.user = user;
        req.clerkId = clerkId;
        next();
      });

    } catch (error) {
      return res.status(401).json({ error: 'Not authorized', reason: error.message });
    }
  } else {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};

// --- RUN TESTS ---
async function runTests() {
  let passedCount = 0;
  let failedCount = 0;

  function testResult(name, success) {
    if (success) {
      console.log(`✅ TEST PASSED: ${name}`);
      passedCount++;
    } else {
      console.log(`❌ TEST FAILED: ${name}`);
      failedCount++;
    }
  }

  // Helper mock Response builder
  function createResponseMock() {
    const res = {
      statusVal: 200,
      jsonVal: null,
      status: function(code) {
        this.statusVal = code;
        return this;
      },
      json: function(payload) {
        this.jsonVal = payload;
      }
    };
    return res;
  }

  // Case 1: Valid Signed Token
  try {
    const validToken = jwt.sign({ sub: mockUser.clerkId, iss: MOCK_ISSUER }, privateKey, {
      algorithm: 'RS256',
      keyid: 'ins_mock_kid_123',
      expiresIn: '1h'
    });

    const req = { headers: { authorization: `Bearer ${validToken}` }, path: '/watchlist' };
    const res = createResponseMock();
    let nextCalled = false;

    await mockProtectMiddleware(req, res, () => { nextCalled = true; }, [mockJwk]);
    
    testResult('Valid RS256 token verification passes signature/expiration checks', nextCalled === true && req.user.clerkId === mockUser.clerkId);
  } catch (err) {
    testResult('Valid RS256 token verification', false);
    console.error(err);
  }

  // Case 2: Forged Token (signed with an untrusted arbitrary key)
  try {
    const { privateKey: badPrivateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const forgedToken = jwt.sign({ sub: mockUser.clerkId, iss: MOCK_ISSUER }, badPrivateKey, {
      algorithm: 'RS256',
      keyid: 'ins_mock_kid_123'
    });

    const req = { headers: { authorization: `Bearer ${forgedToken}` }, path: '/watchlist' };
    const res = createResponseMock();
    let nextCalled = false;

    await mockProtectMiddleware(req, res, () => { nextCalled = true; }, [mockJwk]);

    testResult('Forged token with bad signature is rejected with 401', nextCalled === false && res.statusVal === 401 && res.jsonVal.error.includes('verification failed'));
  } catch (err) {
    testResult('Forged token with bad signature', false);
  }

  // Case 3: Expired Token
  try {
    // Generate token with negative expiresIn so it's instantly expired
    const expiredToken = jwt.sign({ sub: mockUser.clerkId, iss: MOCK_ISSUER, exp: Math.floor(Date.now() / 1000) - 10 }, privateKey, {
      algorithm: 'RS256',
      keyid: 'ins_mock_kid_123'
    });

    const req = { headers: { authorization: `Bearer ${expiredToken}` }, path: '/watchlist' };
    const res = createResponseMock();
    let nextCalled = false;

    await mockProtectMiddleware(req, res, () => { nextCalled = true; }, [mockJwk]);

    testResult('Expired token is correctly caught and rejected', nextCalled === false && res.statusVal === 401 && res.jsonVal.reason.includes('jwt expired'));
  } catch (err) {
    testResult('Expired token verification', false);
  }

  // Case 4: Malformed Token
  try {
    const req = { headers: { authorization: `Bearer invalid-token-string` }, path: '/watchlist' };
    const res = createResponseMock();
    let nextCalled = false;

    await mockProtectMiddleware(req, res, () => { nextCalled = true; }, [mockJwk]);

    testResult('Malformed/unparseable token is rejected', nextCalled === false && res.statusVal === 401 && res.jsonVal.error.includes('malformed'));
  } catch (err) {
    testResult('Malformed token verification', false);
  }

  // Case 5: Secure Onboarding (/sync-user allowed for verified user not yet in DB)
  try {
    const validUnsyncedToken = jwt.sign({ sub: 'user_unsynced_999', iss: MOCK_ISSUER }, privateKey, {
      algorithm: 'RS256',
      keyid: 'ins_mock_kid_123'
    });

    const req = { headers: { authorization: `Bearer ${validUnsyncedToken}` }, path: '/sync-user' };
    const res = createResponseMock();
    let nextCalled = false;

    await mockProtectMiddleware(req, res, () => { nextCalled = true; }, [mockJwk]);

    testResult('Verified unsynced users can access /sync-user securely', nextCalled === true && req.clerkId === 'user_unsynced_999');
  } catch (err) {
    testResult('Unsynced user route test', false);
  }

  // Print Summary
  console.log('\n==================================================');
  console.log(`🧪 TESTING SUMMARY: ${passedCount} passed | ${failedCount} failed`);
  console.log('==================================================');
}

runTests();
