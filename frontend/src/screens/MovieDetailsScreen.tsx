import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { getMovieDetails } from '../services/tmdb';
import { movieService } from '../services/movieService';

const { width } = Dimensions.get('window');

const MovieDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  
  // Accept both movieId (from Home) or movie object (from Watchlist/Favorites)
  const rawId = route.params?.movieId || route.params?.movie?.id || route.params?.movie?.movieId;
  const resolvedId = rawId ? Number(rawId) : 0;
  
  const [movie, setMovie] = useState<any>(route.params?.movie || null);
  const [loading, setLoading] = useState(!route.params?.movie);
  const [error, setError] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (resolvedId) {
      fetchDetails();
      checkSavedStatus();
    }
  }, [resolvedId]);

  const checkSavedStatus = async () => {
    try {
      const [watchlist, favorites] = await Promise.all([
        movieService.getWatchlist(),
        movieService.getFavorites()
      ]);
      
      setInWatchlist(watchlist.some((m: any) => Number(m.movieId) === resolvedId));
      setIsFavorite(favorites.some((m: any) => Number(m.movieId) === resolvedId));
    } catch (e) {
      console.warn('[MovieVault] Error checking sync status:', e);
    }
  };

  const fetchDetails = async () => {
    if (!resolvedId) return;
    try {
      setError(false);
      const data = await getMovieDetails(resolvedId);
      setMovie(data);
    } catch (err) {
      console.error('Error fetching movie details:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = async () => {
    if (syncing || !resolvedId) return;
    setSyncing(true);
    console.log(`[Frontend-Trace] Clicked 'Add to Watchlist' for Movie ID: ${resolvedId}`);
    try {
      if (inWatchlist) {
        await movieService.removeFromWatchlist(resolvedId);
        setInWatchlist(false);
      } else {
        const payload = {
          movieId: resolvedId,
          title: movie.title,
          posterPath: movie.poster_path || movie.posterPath,
          backdropPath: movie.backdrop_path || movie.backdropPath,
          rating: movie.vote_average || movie.rating,
          releaseDate: movie.release_date || movie.releaseDate
        };
        console.log(`[Frontend-Trace] Preparing to sync Watchlist with payload:`, payload);
        await movieService.addToWatchlist(payload);
        setInWatchlist(true);
      }
    } catch (error: any) {
      const msg = error.message === 'Server timeout. Please try again.' 
        ? error.message 
        : 'Failed to update watchlist on server.';
      Alert.alert('Sync Error', msg);
    } finally {
      setSyncing(false);
    }
  };

  const toggleFavorite = async () => {
    if (syncing || !resolvedId) return;
    setSyncing(true);
    console.log(`[Frontend-Trace] Clicked 'Add to Favorites' for Movie ID: ${resolvedId}`);
    try {
      if (isFavorite) {
        await movieService.removeFromFavorites(resolvedId);
        setIsFavorite(false);
      } else {
        const payload = {
          movieId: resolvedId,
          title: movie.title,
          posterPath: movie.poster_path || movie.posterPath,
          backdropPath: movie.backdrop_path || movie.backdropPath,
          rating: movie.vote_average || movie.rating,
          releaseDate: movie.release_date || movie.releaseDate
        };
        console.log(`[Frontend-Trace] Preparing to sync Favorites with payload:`, payload);
        await movieService.addToFavorites(payload);
        setIsFavorite(true);
      }
    } catch (error: any) {
      const msg = error.message === 'Server timeout. Please try again.' 
        ? error.message 
        : 'Failed to update favorites on server.';
      Alert.alert('Sync Error', msg);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.loaderContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={Colors.primary} />
        <Text style={{ color: Colors.text, fontSize: 18, marginTop: 16, fontWeight: '600' }}>Failed to load movie</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.primary, fontSize: 16 }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderCast = () => {
    const cast = movie.credits?.cast?.slice(0, 10) || [];
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Cast</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={cast}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.castCard}>
              <Image
                source={{
                  uri: item.profile_path
                    ? `https://image.tmdb.org/t/p/w200${item.profile_path}`
                    : 'https://via.placeholder.com/100x150?text=No+Image'
                }}
                style={styles.castImage}
              />
              <Text style={styles.castName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.castRole} numberOfLines={1}>{item.character}</Text>
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.posterPath}` }}
          style={styles.backdrop}
        />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.white} />
        </TouchableOpacity>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.circleButton} onPress={toggleWatchlist} disabled={syncing}>
            <Ionicons 
              name={inWatchlist ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={inWatchlist ? Colors.primary : Colors.white} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} onPress={toggleFavorite} disabled={syncing}>
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? Colors.primary : Colors.white} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={16} color={Colors.white} />
            <Text style={styles.ratingText}>{(movie.vote_average || movie.rating || 0).toFixed(1)}</Text>
          </View>
          <Text style={styles.metaText}>{movie.release_date?.split('-')[0] || movie.releaseDate?.split('-')[0]}</Text>
          <Text style={styles.metaText}>{movie.runtime} min</Text>
        </View>

        <View style={styles.genreContainer}>
          {movie.genres?.map((genre: any) => (
            <View key={genre.id} style={styles.genreBadge}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movie.overview}</Text>
        </View>

        {renderCast()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loaderContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { width: '100%', height: 450, position: 'relative' },
  backdrop: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  actionButtons: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'row', gap: 12 },
  circleButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  content: { padding: 20, marginTop: -30, backgroundColor: Colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  metaContainer: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  ratingText: { color: Colors.white, fontWeight: 'bold' },
  metaText: { color: Colors.textSecondary, fontSize: 14 },
  genreContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 25 },
  genreBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  genreText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 15 },
  overview: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 },
  castCard: { width: 100, marginRight: 15 },
  castImage: { width: 100, height: 130, borderRadius: 12, marginBottom: 8 },
  castName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  castRole: { color: Colors.textSecondary, fontSize: 12 }
});

export default MovieDetailsScreen;
