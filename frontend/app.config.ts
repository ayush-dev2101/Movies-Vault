import type { ExpoConfig, ConfigContext } from 'expo/config';

// ─────────────────────────────────────────────────────────────────────
// MovieVault - Pure Local Android Configuration
// ─────────────────────────────────────────────────────────────────────

const env = process.env as any;

const CLERK_KEY =
  env['EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY'] ||
  'pk_test_c2hhcnAtY293LTk2LmNsZXJrLmFjY291bnRzLmRldiQ';

const API_URL =
  env['EXPO_PUBLIC_API_URL'] || 'https://movies-vault-production.up.railway.app'

const TMDB_KEY =
  env['EXPO_PUBLIC_TMDB_API_KEY'] ||
  '2e9b43087d0f9736eab380d2151b3b8c';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  // ── Identity ──────────────────────────────────────────
  name: 'MovieVault',
  slug: 'movie-vault',
  scheme: 'movievault',
  version: '1.0.0',

  // ── Display ───────────────────────────────────────────
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  icon: './assets/icon.png',

  // ── Architecture ──────────────────────────────────────
  newArchEnabled: false,

  // ── Splash Screen ─────────────────────────────────────
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#080808',
  },

  // ── Android ───────────────────────────────────────────
  android: {
     jsEngine: 'hermes',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#080808',
    },
    package: 'com.ayush.movievault',
    versionCode: 1,
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE'
    ],
  },

  // ── Plugins ───────────────────────────────────────────
  plugins: [
  "expo-asset",
  "expo-secure-store",
  "expo-font",
  [
    "expo-splash-screen",
    {
      backgroundColor: "#080808",
      image: "./assets/splash-icon.png",
      imageWidth: 200,
    },
  ],
],

  assetBundlePatterns: ['**/*'],

  // ── Extra (Always available in APK) ──────────────────
  extra: {
    clerkPublishableKey: CLERK_KEY,
    apiUrl: API_URL,
    tmdbApiKey: TMDB_KEY,
  },
});
