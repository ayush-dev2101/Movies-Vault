import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { getMovieDetails, getImageUrl } from '../services/tmdb';
import { useRoute, useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POSTER_HEIGHT = SCREEN_WIDTH * 1.5; // Aspect ratio 2:3

const MovieDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { movieId } = route.params || {};
  
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (movieId) {
      fetchDetails();
      checkSavedStatus();
    }
  }, [movieId]);

  const checkSavedStatus = async () => {
    try {
      const watchlist = await AsyncStorage.getItem('watchlist');
      const favorites = await AsyncStorage.getItem('favorites');
      
      if (watchlist) {
        const list = JSON.parse(watchlist);
        setInWatchlist(list.some((m: any) => m.id === movieId));
      }
      
      if (favorites) {
        const list = JSON.parse(favorites);
        setIsFavorite(list.some((m: any) => m.id === movieId));
      }
    } catch (e) {
      console.error('Error checking saved status', e);
    }
  };

  const fetchDetails = async () => {
    try {
      const data = await getMovieDetails(movieId);
      setMovie(data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      let list = stored ? JSON.parse(stored) : [];
      
      if (isFavorite) {
        list = list.filter((m: any) => m.id !== movie.id);
      } else {
        list.push(movie);
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(list));
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.error('Error toggling favorite', e);
    }
  };

  const toggleWatchlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('watchlist');
      let list = stored ? JSON.parse(stored) : [];
      
      if (inWatchlist) {
        list = list.filter((m: any) => m.id !== movie.id);
      } else {
        list.push(movie);
      }
      
      await AsyncStorage.setItem('watchlist', JSON.stringify(list));
      setInWatchlist(!inWatchlist);
    } catch (e) {
      console.error('Error toggling watchlist', e);
    }
  };

  if (loading || !movie) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderCast = () => {
    const cast = movie.credits?.cast?.slice(0, 10) || [];
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castList}>
          {cast.map((actor: any) => (
            <View key={actor.id} style={styles.castItem}>
              <Image 
                source={{ uri: actor.profile_path ? getImageUrl(actor.profile_path, 'w500') : 'https://via.placeholder.com/150' }} 
                style={styles.castImage} 
              />
              <Text style={styles.castName} numberOfLines={1}>{actor.name}</Text>
              <Text style={styles.castCharacter} numberOfLines={1}>{actor.character}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.posterContainer}>
          <Image 
            source={{ uri: getImageUrl(movie.poster_path, 'original') }} 
            style={styles.posterImage}
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{movie.title}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <Text style={styles.year}>{movie.release_date?.substring(0, 4)}</Text>
            <View style={styles.dot} />
            <Text style={styles.runtime}>{movie.runtime} min</Text>
            <View style={styles.dot} />
            <Text style={styles.rating}>★ {movie.vote_average?.toFixed(1)}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genresContainer}>
            {movie.genres?.map((genre: any) => (
              <View key={genre.id} style={styles.genreBadge}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actionButtons}>
            <CustomButton 
              title={inWatchlist ? "In Watchlist" : "Add to Watchlist"} 
              onPress={toggleWatchlist}
              style={{ flex: 1, marginRight: 10 }}
              variant={inWatchlist ? 'secondary' : 'primary'}
            />
            <TouchableOpacity 
              style={[styles.iconButton, isFavorite && styles.iconButtonActive]}
              onPress={toggleFavorite}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? Colors.white : Colors.primary} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overview}>{movie.overview}</Text>
          </View>

          {renderCast()}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  posterContainer: {
    width: SCREEN_WIDTH,
    height: POSTER_HEIGHT * 0.8, // Slightly shorter than full poster to show content
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  year: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  runtime: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  rating: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: 8,
  },
  genresContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  genreBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  genreText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: Colors.primary,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  overview: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  castList: {
    flexDirection: 'row',
  },
  castItem: {
    width: 100,
    marginRight: 15,
  },
  castImage: {
    width: 100,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  castName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  castCharacter: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default MovieDetailsScreen;
