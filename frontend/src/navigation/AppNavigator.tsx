import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  let auth;
  try {
    auth = useAuth();
  } catch (e) {
    console.error("[MovieVault] Navigation Context Error:", e);
    return <SplashScreen />; // Emergency fallback
  }

  const { user, isLoading } = auth || { user: null, isLoading: true };

  // If we are still loading, we render the SplashScreen 
  // but we keep it inside a stable component flow.
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }} 
      // If user is logged in, start at Main, otherwise start at Auth or Onboarding
      initialRouteName={user ? "Main" : "Onboarding"}
    >
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
