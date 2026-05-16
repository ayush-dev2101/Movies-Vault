export const validateEnv = () => {
  const requiredKeys = [
    'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'EXPO_PUBLIC_API_URL',
    'EXPO_PUBLIC_TMDB_API_KEY'
  ];

  const missingKeys = requiredKeys.filter(key => !process.env[key]);

  if (missingKeys.length > 0) {
    const errorMsg = `[MovieVault] Environment Configuration Error: 
The following keys are missing from your .env file:
${missingKeys.join('\n')}

Please check your .env and restart the build.`;
    
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return {
    clerkKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    apiUrl: process.env.EXPO_PUBLIC_API_URL!,
    tmdbKey: process.env.EXPO_PUBLIC_TMDB_API_KEY!
  };
};

export const ENV = {
  CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  API_URL: process.env.EXPO_PUBLIC_API_URL || '',
  TMDB_API_KEY: process.env.EXPO_PUBLIC_TMDB_API_KEY || ''
};
