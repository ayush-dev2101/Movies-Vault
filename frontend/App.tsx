import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { CLERK_PUBLISHABLE_KEY, tokenCache } from "./src/config/clerk";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.error("[MovieVault] Error: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing from .env");
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
