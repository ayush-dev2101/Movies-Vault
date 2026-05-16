import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const numColumns = 2;
const cardWidth = (width - 60) / numColumns;

const FavoritesScreen = ({ navigation }: any) => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('favorites');
      setMovies(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Failed to load favorites', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('MovieDetails', { movieId: item.id, movie: item })}
    >
      <Image 
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} 
        style={styles.poster} 
      />
      <View style={styles.badge}>
        <Ionicons name="heart" size={16} color={Colors.white} />
      </View>
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favorites</Text>
      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={80} color={Colors.surface} />
          <Text style={styles.emptyText}>No favorite movies yet</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={renderItem}
          numColumns={numColumns}
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
  card: { width: cardWidth, marginBottom: 20, marginRight: 20 },
  poster: { width: cardWidth, height: cardWidth * 1.5, borderRadius: 15 },
  title: { color: Colors.text, marginTop: 8, fontWeight: '600', fontSize: 14 },
  badge: { position: 'absolute', top: 10, right: 10, backgroundColor: Colors.primary, padding: 5, borderRadius: 10 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  emptyText: { color: Colors.text, fontSize: 18, marginTop: 10 }
});

export default FavoritesScreen;
