import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "./src/config/clerk";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding (safe call)
SplashScreen.preventAutoHideAsync().catch(() => {});

// ──────────────────────────────────────────────
// PRODUCTION-SAFE environment variable loading
// Instead of throwing (which kills the app before ErrorBoundary mounts),
// we log warnings and use fallbacks.
// ──────────────────────────────────────────────
const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://movies-vault-production.up.railway.app';
const TMDB_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || '';

if (!CLERK_KEY) {
  console.warn('[MovieVault] WARNING: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing!');
}
if (!TMDB_KEY) {
  console.warn('[MovieVault] WARNING: EXPO_PUBLIC_TMDB_API_KEY is missing!');
}

console.log('[MovieVault] App module loaded. Clerk key present:', !!CLERK_KEY);

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Give the app a moment to stabilize, then hide splash
    // This replaces the unreliable useFonts({}) empty-object pattern
    const prepare = async () => {
      try {
        // If you have custom fonts, load them here:
        // await Font.loadAsync({ 'CustomFont': require('./assets/fonts/CustomFont.ttf') });
        console.log('[MovieVault] App preparation complete');
      } catch (e) {
        console.warn('[MovieVault] Font/asset loading error:', e);
      } finally {
        setAppReady(true);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (appReady) {
      console.log('[MovieVault] Hiding splash screen');
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  // Failsafe: Force hide splash after 5 seconds no matter what
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!appReady) {
        console.warn('[MovieVault] FAILSAFE: Force-hiding splash after 5s timeout');
        setAppReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  if (!appReady) {
    return null; // Native splash screen is still visible
  }

  // If Clerk key is completely missing, show a helpful error instead of crashing
  if (!CLERK_KEY) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F0F0F', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#FF3B30', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Configuration Error</Text>
        <Text style={{ color: '#A0A0A0', fontSize: 14, textAlign: 'center' }}>
          EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing. Please check your .env file and rebuild.
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#080808' }}>
          <SafeAreaProvider>
            <NavigationContainer 
              fallback={
                <View style={{ flex: 1, backgroundColor: '#080808', justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#FF3B30" />
                </View>
              }
            >
              <AppNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
