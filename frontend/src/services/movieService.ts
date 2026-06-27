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

// Helper: Update the local cache for a given key
const updateCache = async (key: string, data: any[]) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[MovieVault] Cache write failed:', e);
  }
};

// Helper: Read from local cache
const readCache = async (key: string): Promise<any[] | null> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.warn('[MovieVault] Cache read failed:', e);
    return null;
  }
};

export const movieService = {
  // ────────────────────── Watchlist ──────────────────────

  getWatchlist: async (): Promise<MovieData[]> => {
    try {
      const response = await api.get('/movies/watchlist');
      const data: MovieData[] = Array.isArray(response.data) ? response.data : [];
      await updateCache(CACHE_KEYS.WATCHLIST, data);
      return data;
    } catch (error: any) {
      const status = error.response?.status;
      console.warn(`[MovieVault] Watchlist fetch failed (${status}), checking cache...`);
      const cached = await readCache(CACHE_KEYS.WATCHLIST);
      if (cached) return cached;
      // Re-throw only if it's not a 401 (auth issue is expected on first load)
      if (status !== 401) throw error;
      return [];
    }
  },

  addToWatchlist: async (movie: MovieData): Promise<any> => {
    try {
      const response = await api.post('/movies/watchlist/add', movie);
      // Optimistically update cache
      const cached = await readCache(CACHE_KEYS.WATCHLIST);
      if (cached) {
        const exists = cached.some((m) => m.movieId === movie.movieId);
        if (!exists) {
          await updateCache(CACHE_KEYS.WATCHLIST, [...cached, movie]);
        }
      }
      return response.data;
    } catch (error: any) {
      console.error('[MovieVault] addToWatchlist failed:', error.message);
      throw error;
    }
  },

  removeFromWatchlist: async (movieId: number): Promise<any> => {
    try {
      const response = await api.delete(`/movies/watchlist/remove/${movieId}`);
      // Update cache
      const cached = await readCache(CACHE_KEYS.WATCHLIST);
      if (cached) {
        await updateCache(CACHE_KEYS.WATCHLIST, cached.filter((m) => m.movieId !== movieId));
      }
      return response.data;
    } catch (error: any) {
      console.error('[MovieVault] removeFromWatchlist failed:', error.message);
      throw error;
    }
  },

  // ────────────────────── Favorites ──────────────────────

  getFavorites: async (): Promise<MovieData[]> => {
    try {
      const response = await api.get('/movies/favorites');
      const data: MovieData[] = Array.isArray(response.data) ? response.data : [];
      await updateCache(CACHE_KEYS.FAVORITES, data);
      return data;
    } catch (error: any) {
      const status = error.response?.status;
      console.warn(`[MovieVault] Favorites fetch failed (${status}), checking cache...`);
      const cached = await readCache(CACHE_KEYS.FAVORITES);
      if (cached) return cached;
      if (status !== 401) throw error;
      return [];
    }
  },

  addToFavorites: async (movie: MovieData): Promise<any> => {
    try {
      const response = await api.post('/movies/favorites/add', movie);
      // Optimistically update cache
      const cached = await readCache(CACHE_KEYS.FAVORITES);
      if (cached) {
        const exists = cached.some((m) => m.movieId === movie.movieId);
        if (!exists) {
          await updateCache(CACHE_KEYS.FAVORITES, [...cached, movie]);
        }
      }
      return response.data;
    } catch (error: any) {
      console.error('[MovieVault] addToFavorites failed:', error.message);
      throw error;
    }
  },

  removeFromFavorites: async (movieId: number): Promise<any> => {
    try {
      const response = await api.delete(`/movies/favorites/remove/${movieId}`);
      // Update cache
      const cached = await readCache(CACHE_KEYS.FAVORITES);
      if (cached) {
        await updateCache(CACHE_KEYS.FAVORITES, cached.filter((m) => m.movieId !== movieId));
      }
      return response.data;
    } catch (error: any) {
      console.error('[MovieVault] removeFromFavorites failed:', error.message);
      throw error;
    }
  },

  // ────────────────────── Health Check ──────────────────────

  checkHealth: async (): Promise<any> => {
    const response = await api.get('/');
    return response.data;
  },
};
