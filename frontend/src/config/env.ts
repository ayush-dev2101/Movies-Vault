/**
 * Production-Safe Environment Configuration
 *
 * Reading order for each variable:
 * 1. process.env.EXPO_PUBLIC_* (works in dev + EAS if .env is present)
 * 2. Constants.expoConfig?.extra (always works in production APK via app.config.ts)
 * 3. Hardcoded fallback (final safety net)
 *
 * This triple-fallback ensures the app NEVER crashes due to missing env vars.
 */

import Constants from 'expo-constants';

const extra: Record<string, any> = Constants.expoConfig?.extra ?? {};

const env = process.env as any;

// ── CLERK ────────────────────────────────────────────
const CLERK_PUBLISHABLE_KEY: string =
  (env['EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY'] as string) ||
  (extra.clerkPublishableKey as string) ||
  'pk_test_c2hhcnAtY293LTk2LmNsZXJrLmFjY291bnRzLmRldiQ';

// ── API ──────────────────────────────────────────────
const API_URL: string =
  (env['EXPO_PUBLIC_API_URL'] as string) ||
  (extra.apiUrl as string) ||
  'https://movies-vault-production.up.railway.app';

// ── TMDB ─────────────────────────────────────────────
const TMDB_API_KEY: string =
  (env['EXPO_PUBLIC_TMDB_API_KEY'] as string) ||
  (extra.tmdbApiKey as string) ||
  '2e9b43087d0f9736eab380d2151b3b8c';

// ── GOOGLE ───────────────────────────────────────────
const GOOGLE_CLIENT_ID: string =
  (env['EXPO_PUBLIC_GOOGLE_CLIENT_ID'] as string) ||
  '289796269059-271uqrpni6iovil59pmqe51qckpj9j7a.apps.googleusercontent.com';

const GOOGLE_ANDROID_CLIENT_ID: string =
  (env['EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'] as string) ||
  '289796269059-f96po61l248r9mtr6pksk3knqntav10i.apps.googleusercontent.com';

// ─────────────────────────────────────────────────────
// Consolidated ENV object — use this everywhere
// ─────────────────────────────────────────────────────
export const ENV = {
  CLERK_PUBLISHABLE_KEY,
  API_URL,
  TMDB_API_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
} as const;

// ─────────────────────────────────────────────────────
// Startup validator — logs warnings, NEVER throws
// ─────────────────────────────────────────────────────
export function validateEnv(): { clerkKey: string; apiUrl: string; tmdbKey: string } {
  console.log('[MovieVault] ENV check:', {
    clerk: !!CLERK_PUBLISHABLE_KEY ? '✅' : '❌',
    api: !!API_URL ? '✅' : '❌',
    tmdb: !!TMDB_API_KEY ? '✅' : '❌',
  });

  if (!CLERK_PUBLISHABLE_KEY) {
    console.error('[MovieVault] CRITICAL: Clerk key missing — auth will fail');
  }

  return {
    clerkKey: CLERK_PUBLISHABLE_KEY,
    apiUrl: API_URL,
    tmdbKey: TMDB_API_KEY,
  };
}
