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

// Run strict validation at the top level
// This will throw an error caught by the ErrorBoundary if keys are missing
const { clerkKey } = validateEnv();

export default function App() {
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
