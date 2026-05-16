import api from './api';

export interface MovieData {
  movieId: number;
  title: string;
  posterPath: string;
  rating: number;
  releaseDate?: string;
}

export const movieService = {
  // Watchlist
  getWatchlist: async () => {
    const response = await api.get('/movies/watchlist');
    return response.data;
  },

  addToWatchlist: async (movie: MovieData) => {
    const response = await api.post('/movies/watchlist', movie);
    return response.data;
  },

  removeFromWatchlist: async (movieId: number) => {
    const response = await api.delete(`/movies/watchlist/${movieId}`);
    return response.data;
  },

  // Favorites
  getFavorites: async () => {
    const response = await api.get('/movies/favorites');
    return response.data;
  },

  addToFavorites: async (movie: MovieData) => {
    const response = await api.post('/movies/favorites', movie);
    return response.data;
  },

  removeFromFavorites: async (movieId: number) => {
    const response = await api.delete(`/movies/favorites/${movieId}`);
    return response.data;
  },

  // Health Check
  checkHealth: async () => {
    const response = await api.get('/');
    return response.data;
  }
};
