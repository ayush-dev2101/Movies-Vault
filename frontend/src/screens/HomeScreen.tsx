import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import Colors from '../constants/Colors';
import MovieCard from '../components/MovieCard';
import { getTrendingMovies, getPopularMovies, getTopRatedMovies } from '../services/tmdb';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';

const HomeScreen = () => {
  const { user } = useUser();
  const [trending, setTrending] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      console.log("[MovieVault] Fetching movies...");
      // We fetch each category independently so one failure doesn't kill the whole screen
      const results = await Promise.allSettled([
        getTrendingMovies(),
        getPopularMovies(),
        getTopRatedMovies()
      ]);

      const [trendingRes, popularRes, topRatedRes] = results;

      if (trendingRes.status === 'fulfilled') setTrending(trendingRes.value || []);
      if (popularRes.status === 'fulfilled') setPopular(popularRes.value || []);
      if (topRatedRes.status === 'fulfilled') setTopRated(topRatedRes.value || []);
      
    } catch (error) {
      console.error('[MovieVault] Critical Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onMoviePress = (movie: any) => {
    if (!movie?.id) return;
    navigation.navigate('MovieDetails', { movieId: movie.id });
  };

  const renderMovieSection = (title: string, data: any[]) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={Array.isArray(data) ? data : []} // Final safety guard
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          item ? <MovieCard movie={item} onPress={onMoviePress} width={120} /> : null
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Movie Vault</Text>
        </View>
        
        {renderMovieSection('Trending Today', trending)}
        {renderMovieSection('Popular Movies', popular)}
        {renderMovieSection('Top Rated', topRated)}
        
        <View style={{ height: 20 }} />
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 20,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 15, // Leaves 5px margin on card + 15 = 20 total
  },
});

export default HomeScreen;
