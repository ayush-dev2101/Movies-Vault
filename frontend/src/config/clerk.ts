import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ENV } from './env';

export const CLERK_PUBLISHABLE_KEY = ENV.CLERK_PUBLISHABLE_KEY;

const createTokenCache = () => ({
  async getToken(key: string): Promise<string | null> {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`[MovieVault] Token retrieved for key: ${key} 🔐`);
      }
      return item;
    } catch (error) {
      console.error('[MovieVault] SecureStore get error:', error);
      await SecureStore.deleteItemAsync(key).catch(() => {});
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('[MovieVault] SecureStore save error:', err);
    }
  },
});

export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;
