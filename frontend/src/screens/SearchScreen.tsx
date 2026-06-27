import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import MovieCard from '../components/MovieCard';
import { searchMovies } from '../services/tmdb';
import { useNavigation } from '@react-navigation/native';

// Debounce hook
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
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 500);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      performSearch(debouncedQuery.trim());
    } else {
      setResults([]);
      setSearchError(null);
    }
  }, [debouncedQuery]);

  const performSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setSearchError(null);
    try {
      console.log('[MovieVault] Searching for:', searchQuery);
      const data = await searchMovies(searchQuery);
      console.log('[MovieVault] Search results:', data?.length ?? 0, 'movies found');
      setResults(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('[MovieVault] Search error:', error.message || error);
      setSearchError('Search failed. Please check your internet connection.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onMoviePress = (movie: any) => {
    if (!movie?.id) return;
    navigation.navigate('MovieDetails', { movieId: movie.id });
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearchError(null);
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
            returnKeyType="search"
            onSubmitEditing={() => {
              if (query.trim()) performSearch(query.trim());
            }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={Colors.gray[500]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searchError ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={Colors.primary} />
          <Text style={styles.errorText}>{searchError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => performSearch(query.trim())}
          >
            <Ionicons name="refresh" size={16} color={Colors.white} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : results.length > 0 ? (
        <>
          <Text style={styles.resultsCount}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "{debouncedQuery}"
          </Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
            numColumns={numColumns}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <MovieCard movie={item} onPress={onMoviePress} width={cardWidth - 10} />
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : query.length > 0 && !loading ? (
        <View style={styles.centerContainer}>
          <Ionicons name="film-outline" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyText}>No movies found for "{query}"</Text>
          <Text style={styles.emptySubText}>Try a different search term</Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyText}>Find your next favorite movie</Text>
          <Text style={styles.emptySubText}>Type a movie title to get started</Text>
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
    borderWidth: 1,
    borderColor: Colors.border,
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
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 8,
    gap: 6,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  resultsCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 10,
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
