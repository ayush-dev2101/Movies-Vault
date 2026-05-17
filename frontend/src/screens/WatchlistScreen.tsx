    import React, { useState } from 'react';
    import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert } from 'react-native';
    import { useFocusEffect } from '@react-navigation/native';
    import Colors from '../constants/Colors';
    import { Ionicons } from '@expo/vector-icons';
    import { movieService } from '../services/movieService';

    const { width } = Dimensions.get('window');

    const WatchlistScreen = ({ navigation }: any) => {
      const [movies, setMovies] = useState<any[]>([]);
      const [loading, setLoading] = useState(true);

      useFocusEffect(
        React.useCallback(() => {
          loadWatchlist();
        }, [])
      );

      const loadWatchlist = async () => {
        try {
          setLoading(true);
          const data = await movieService.getWatchlist();
          setMovies(data);
        } catch (error: any) {
          console.error('[MovieVault] Failed to load watchlist:', error.message);
          
          const status = error.response?.status;
          const backendMessage = error.response?.data?.message || error.message;

          if (status === 401) {
            // Safe to ignore: User's backend sync is likely still in progress
            setMovies([]);
          } else if (error.message === 'Server timeout. Please try again.') {
            Alert.alert('Server Waking Up', 'The backend is waking up from sleep. Please try refreshing in a few seconds.');
          } else {
            Alert.alert('Sync Error', `Exact Reason: ${backendMessage}`);
          }
        } finally {
          setLoading(false);
        }
      };

      const removeItem = async (movieId: number) => {
        try {
          // Optimistic update
          const previousMovies = [...movies];
          setMovies(movies.filter(m => m.movieId !== movieId));
          
          await movieService.removeFromWatchlist(movieId);
        } catch (error: any) {
          console.error('[MovieVault] Failed to remove movie:', error.message);
          Alert.alert('Error', 'Failed to remove movie. Please try again.');
          loadWatchlist(); // Reload to sync back
        }
      };

      const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('MovieDetails', { movieId: item.movieId, movie: item })}
        >
          <Image 
            source={{ uri: `https://image.tmdb.org/t/p/w500${item.posterPath}` }} 
            style={styles.poster} 
          />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) || 'N/A'}</Text>
            <TouchableOpacity onPress={() => removeItem(item.movieId)} style={styles.removeBtn}>
              <Ionicons name="trash-outline" size={20} color={Colors.primary} />
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );

      return (
        <View style={styles.container}>
          <Text style={styles.header}>My Watchlist</Text>
          {loading ? (
            <View style={styles.empty}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : movies.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="bookmark-outline" size={80} color={Colors.surface} />
              <Text style={styles.emptyText}>Your watchlist is empty</Text>
            </View>
          ) : (
            <FlatList
              data={movies}
              renderItem={renderItem}
              keyExtractor={(item) => item.movieId.toString()}
              contentContainerStyle={styles.list}
              onRefresh={loadWatchlist}
              refreshing={loading}
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
