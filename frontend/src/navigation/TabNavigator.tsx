import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  let auth;
  try {
    auth = useAuth();
  } catch (e) {
    console.error("[MovieVault] TabNavigator Auth Error:", e);
  }

  const { user, showAuthModal } = auth || { user: null, showAuthModal: () => {} };

  const handleProtectedTabPress = (e: any, targetScreen: string) => {
    try {
      if (!user) {
        e.preventDefault();
        showAuthModal();
      }
    } catch (error) {
      console.error("[MovieVault] Tab Press Error:", error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'film-outline'; // Default fallback icon

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Watchlist') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[600],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          height: 60,
          paddingBottom: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen 
        name="Watchlist" 
        component={WatchlistScreen} 
        listeners={{ tabPress: (e) => handleProtectedTabPress(e, 'Watchlist') }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        listeners={{ tabPress: (e) => handleProtectedTabPress(e, 'Favorites') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        listeners={{ tabPress: (e) => handleProtectedTabPress(e, 'Profile') }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
