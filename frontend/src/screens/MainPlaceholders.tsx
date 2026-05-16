import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

const HomeScreen = () => <View style={styles.container}><Text>Home Screen</Text></View>;
const SearchScreen = () => <View style={styles.container}><Text>Search Screen</Text></View>;
const WatchlistScreen = () => <View style={styles.container}><Text>Watchlist Screen</Text></View>;
const FavoritesScreen = () => <View style={styles.container}><Text>Favorites Screen</Text></View>;
const ProfileScreen = () => <View style={styles.container}><Text>Profile Screen</Text></View>;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }
});

export { HomeScreen, SearchScreen, WatchlistScreen, FavoritesScreen, ProfileScreen };
