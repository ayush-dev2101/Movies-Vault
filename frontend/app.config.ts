import type { ExpoConfig, ConfigContext } from 'expo/config';

// ─────────────────────────────────────────────────────
// PRODUCTION-SAFE CONFIG
// Values are hardcoded here as the source of truth.
// These are EXPO_PUBLIC_ keys (safe to embed in client bundle).
// ─────────────────────────────────────────────────────

const CLERK_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_c2hhcnAtY293LTk2LmNsZXJrLmFjY291bnRzLmRldiQ';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://movies-vault-production.up.railway.app';

const TMDB_KEY =
  process.env.EXPO_PUBLIC_TMDB_API_KEY ||
  '2e9b43087d0f9736eab380d2151b3b8c';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MovieVault',
  slug: 'movie-vault',
  scheme: 'movievault',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  newArchEnabled: false, // Disable New Architecture for production stability
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#080808',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#080808',
    },
    package: 'com.ayush.movievault',
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-secure-store',
    'expo-font',
  ],
  assetBundlePatterns: ['**/*'],
  extra: {
    // These values are embedded into the production bundle
    clerkPublishableKey: CLERK_KEY,
    apiUrl: API_URL,
    tmdbApiKey: TMDB_KEY,
    eas: {
      projectId: 'd2811ff1-d24c-47d1-9249-bb11b3c22d80',
    },
  },
});
