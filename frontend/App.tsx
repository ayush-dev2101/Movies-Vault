import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "./src/config/clerk";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import { validateEnv } from './src/config/env';

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

// Run strict validation at the top level
const { clerkKey } = validateEnv();

export default function App() {
  const [fontsLoaded] = useFonts({
    // Add your custom fonts here if any, otherwise standard ones load
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Keep splash screen visible
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={clerkKey} tokenCache={tokenCache}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
          <SafeAreaProvider>
            <NavigationContainer 
              fallback={
                <View style={{ flex: 1, backgroundColor: '#0F0F0F', justifyContent: 'center', alignItems: 'center' }}>
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
