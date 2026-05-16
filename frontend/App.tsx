import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthModal from './src/components/AuthModal';
import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  React.useEffect(() => {
    console.log("[MovieVault] App Mounted. Initializing services...");
    
    if (Platform.OS !== 'web') {
      try {
        const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
        if (clientId) {
          GoogleSignin.configure({
            webClientId: clientId,
            offlineAccess: true,
          });
          console.log("[MovieVault] Google Sign-In configured");
        } else {
          console.warn("[MovieVault] Google Client ID missing - Social login might fail");
        }
      } catch (error) {
        console.error("[MovieVault] Google Sign-In Init Failed:", error);
      }
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
            <AuthModal />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

