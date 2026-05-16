import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface MovieData {
  movieId: number;
  title: string;
  posterPath: string;
  backdropPath?: string;
  rating: number;
  releaseDate?: string;
}

const CACHE_KEYS = {
  WATCHLIST: '@movievault_watchlist',
  FAVORITES: '@movievault_favorites',
};

export const movieService = {
  // Watchlist
  getWatchlist: async () => {
    try {
      // 1. Try fetching from backend first
      const response = await api.get('/movies/watchlist');
      // 2. If successful, cache it
      await AsyncStorage.setItem(CACHE_KEYS.WATCHLIST, JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      // 3. If network fails or server sleeps, fallback to cache
      console.warn('[MovieVault] Backend fetch failed, loading Watchlist from cache');
      const cached = await AsyncStorage.getItem(CACHE_KEYS.WATCHLIST);
      if (cached) return JSON.parse(cached);
      throw error;
    }
  },

  addToWatchlist: async (movie: MovieData) => {
    const response = await api.post('/movies/watchlist/add', movie);
    // Optimistically update cache (optional but helpful)
    return response.data;
  },

  removeFromWatchlist: async (movieId: number) => {
    const response = await api.delete(`/movies/watchlist/remove/${movieId}`);
    return response.data;
  },

  // Favorites
  getFavorites: async () => {
    try {
      const response = await api.get('/movies/favorites');
      await AsyncStorage.setItem(CACHE_KEYS.FAVORITES, JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.warn('[MovieVault] Backend fetch failed, loading Favorites from cache');
      const cached = await AsyncStorage.getItem(CACHE_KEYS.FAVORITES);
      if (cached) return JSON.parse(cached);
      throw error;
    }
  },

  addToFavorites: async (movie: MovieData) => {
    const response = await api.post('/movies/favorites/add', movie);
    return response.data;
  },

  removeFromFavorites: async (movieId: number) => {
    const response = await api.delete(`/movies/favorites/remove/${movieId}`);
    return response.data;
  },

  // Health Check
  checkHealth: async () => {
    const response = await api.get('/');
    return response.data;
  }
};
