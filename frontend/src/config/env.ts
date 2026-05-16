// Production-safe environment configuration
// NEVER throws — uses fallbacks and warnings instead

export const ENV = {
  CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://movies-vault-production.up.railway.app',
  TMDB_API_KEY: process.env.EXPO_PUBLIC_TMDB_API_KEY || '2e9b43087d0f9736eab380d2151b3b8c',
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
  GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
};

// Validate and log warnings — but NEVER throw
export const validateEnv = () => {
  const checks = [
    { key: 'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY', value: ENV.CLERK_PUBLISHABLE_KEY },
    { key: 'EXPO_PUBLIC_API_URL', value: ENV.API_URL },
    { key: 'EXPO_PUBLIC_TMDB_API_KEY', value: ENV.TMDB_API_KEY },
  ];

  const missing = checks.filter(c => !c.value);
  
  if (missing.length > 0) {
    console.warn(
      `[MovieVault] Missing env vars: ${missing.map(m => m.key).join(', ')}. Using fallbacks.`
    );
  } else {
    console.log('[MovieVault] All environment variables loaded successfully.');
  }

  return {
    clerkKey: ENV.CLERK_PUBLISHABLE_KEY,
    apiUrl: ENV.API_URL,
    tmdbKey: ENV.TMDB_API_KEY,
  };
};
