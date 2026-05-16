import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import MovieCard from '../components/MovieCard';
import { searchMovies } from '../services/tmdb';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// Debounce hook could be in a separate file, but for simplicity we'll keep it here
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const { width } = Dimensions.get('window');
const numColumns = 2;
const cardWidth = (width - 40) / numColumns; // 20 padding on each side

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const navigation = useNavigation<any>();
  const { user, showAuthModal } = useAuth();

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const data = await searchMovies(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onMoviePress = (movie: any) => {
    if (!user) {
      showAuthModal(() => navigation.navigate('MovieDetails', { movieId: movie.id }));
    } else {
      navigation.navigate('MovieDetails', { movieId: movie.id });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies..."
            value={query}
            onChangeText={setQuery}
            placeholderTextColor={Colors.gray[500]}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={Colors.gray[500]} 
              onPress={() => setQuery('')}
            />
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <MovieCard movie={item} onPress={onMoviePress} width={cardWidth - 10} />
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : query.length > 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No movies found for "{query}"</Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="film-outline" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyText}>Find your next favorite movie</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default SearchScreen;
