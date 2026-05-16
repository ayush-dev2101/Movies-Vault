import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from './src/config/clerk';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import * as SplashScreen from 'expo-splash-screen';
import { ENV, validateEnv } from './src/config/env';
import AuthSync from './src/components/AuthSync';

// Prevent native splash from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

// Log env status at startup — never throws
validateEnv();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  // Step 1: Prepare assets/resources
  useEffect(() => {
    const prepare = async () => {
      try {
        // Add any Font.loadAsync() calls here if needed
        console.log('[MovieVault] App bootstrap started');
        console.log('[MovieVault] Clerk key:', ENV.CLERK_PUBLISHABLE_KEY ? '✅ present' : '❌ missing');
        console.log('[MovieVault] API URL:', ENV.API_URL);
      } catch (e) {
        console.warn('[MovieVault] Bootstrap warning:', e);
      } finally {
        setAppReady(true);
      }
    };
    prepare();
  }, []);

  // Step 2: Hide splash once app is ready
  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {});
      console.log('[MovieVault] Splash hidden, rendering UI');
    }
  }, [appReady]);

  // Step 3: Failsafe — force hide splash after 5 seconds no matter what
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('[MovieVault] FAILSAFE: Force-hiding splash after 5s');
      setAppReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  if (!appReady) {
    return null; // Native splash screen visible
  }

  // Show helpful error if Clerk key is truly missing after all fallbacks
  if (!ENV.CLERK_PUBLISHABLE_KEY) {
    return (
      <View style={{ flex: 1, backgroundColor: '#080808', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: '#FF3B30', fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
          Configuration Error
        </Text>
        <Text style={{ color: '#A0A0A0', fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
          Authentication service failed to initialize.{'\n'}
          Please reinstall the app or contact support.
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={ENV.CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <AuthSync />
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
