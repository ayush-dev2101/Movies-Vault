import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const WatchlistScreen = ({ navigation }: any) => {
  const [movies, setMovies] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadWatchlist();
    }, [])
  );

  const loadWatchlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('watchlist');
      if (stored) {
        setMovies(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load watchlist', error);
    }
  };

  const removeItem = async (id: number) => {
    const updated = movies.filter(m => m.id !== id);
    setMovies(updated);
    await AsyncStorage.setItem('watchlist', JSON.stringify(updated));
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('MovieDetails', { movie: item })}
    >
      <Image 
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} 
        style={styles.poster} 
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</Text>
        <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={20} color={Colors.primary} />
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Watchlist</Text>
      {movies.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={80} color={Colors.surface} />
          <Text style={styles.emptyText}>Your watchlist is empty</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginTop: 60, marginBottom: 20 },
  list: { paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 15, marginBottom: 15, overflow: 'hidden' },
  poster: { width: 100, height: 150 },
  info: { flex: 1, padding: 15, justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  rating: { color: Colors.primary, fontWeight: '600' },
  removeBtn: { flexDirection: 'row', alignItems: 'center' },
  removeText: { color: Colors.primary, marginLeft: 5, fontSize: 14 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  emptyText: { color: Colors.text, fontSize: 18, marginTop: 10 }
});

export default WatchlistScreen;
