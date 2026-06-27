import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { movieService } from '../services/movieService';

const FavoritesScreen = ({ navigation }: any) => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await movieService.getFavorites();
      console.log("STATE MOVIES:", data);
      setMovies(Array.isArray(data) ? data : []);
    } catch (error: any) {
      const status = error.response?.status;
      console.error('[MovieVault] Failed to load favorites:', error.message);

      if (status === 401) {
        // Auth not ready yet — silently show empty
        setMovies([]);
      } else if (error.message === 'Server timeout. Please try again.') {
        Alert.alert(
          'Server Waking Up',
          'The backend is starting up. Please pull down to refresh in a few seconds.',
          [{ text: 'OK' }]
        );
      } else {
        // Don't show raw error messages, just log it
        console.warn('[MovieVault] Non-critical favorites error:', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const removeItem = async (movieId: number) => {
    // Optimistic update
    const previous = movies;
    setMovies(movies.filter((m) => m.movieId !== movieId));
    try {
      await movieService.removeFromFavorites(movieId);
    } catch (error: any) {
      console.error('[MovieVault] Failed to remove favorite:', error.message);
      // Revert on failure
      setMovies(previous);
      Alert.alert('Error', 'Failed to remove from favorites. Please try again.');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('MovieDetails', { movieId: item.movieId, movie: item })
      }
    >
      <Image
        source={{
          uri: item.posterPath
            ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
            : 'https://placehold.co/100x150/1a1a1a/ffffff?text=No+Image',
        }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) || 'N/A'}</Text>
        {item.releaseDate && (
          <Text style={styles.releaseDate}>{item.releaseDate?.split('-')[0]}</Text>
        )}
        <TouchableOpacity onPress={() => removeItem(item.movieId)} style={styles.removeBtn}>
          <Ionicons name="heart" size={18} color={Colors.primary} />
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
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
          <Text style={styles.emptySubText}>
            Tap the heart icon on any movie to save it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={renderItem}
          keyExtractor={(item) => item.movieId.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadFavorites(true)}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 60,
    marginBottom: 20,
  },
  list: { paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  poster: { width: 100, height: 150 },
  info: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  title: { fontSize: 17, fontWeight: 'bold', color: Colors.text, lineHeight: 22 },
  rating: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  releaseDate: { color: Colors.textSecondary, fontSize: 12 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  removeText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 60,
  },
  emptyText: { color: Colors.text, fontSize: 18, marginTop: 10, fontWeight: '600' },
  emptySubText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default FavoritesScreen;
