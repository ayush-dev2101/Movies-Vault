import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '@clerk/clerk-expo';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  // Debug logs for production tracing
  console.log('[MovieVault] Nav Mount - Auth Loaded:', isLoaded, 'Signed In:', isSignedIn);

  // FAILSAFE: If Clerk doesn't load within 8 seconds, 
  // treat as "not signed in" so the app doesn't freeze forever
  useEffect(() => {
    if (isLoaded) return; // Already loaded, no need for timeout

    const timeout = setTimeout(() => {
      console.warn('[MovieVault] FAILSAFE: Clerk auth timed out after 8s, proceeding as unsigned');
      setTimedOut(true);
    }, 8000);

    return () => clearTimeout(timeout);
  }, [isLoaded]);

  // Show splash screen while Clerk is initializing session
  // But never for more than 8 seconds
  if (!isLoaded && !timedOut) {
    return <SplashScreen />;
  }

  // If timed out, treat as not signed in
  const signedIn = isLoaded ? isSignedIn : false;

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }} 
      initialRouteName={signedIn ? "Main" : "Onboarding"}
    >
      {signedIn ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
