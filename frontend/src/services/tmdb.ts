import api from './api';

export const getTrendingMovies = async (): Promise<any[]> => {
  const response = await api.get('/movies/tmdb/trending');
  return response.data.results ?? response.data ?? [];
};

export const getPopularMovies = async (page = 1): Promise<any[]> => {
  const response = await api.get('/movies/tmdb/popular', { params: { page } });
  return response.data.results ?? response.data ?? [];
};

export const getTopRatedMovies = async (page = 1): Promise<any[]> => {
  const response = await api.get('/movies/tmdb/top_rated', { params: { page } });
  return response.data.results ?? response.data ?? [];
};

export const getUpcomingMovies = async (page = 1): Promise<any[]> => {
  const response = await api.get('/movies/tmdb/upcoming', { params: { page } });
  return response.data.results ?? response.data ?? [];
};

export const searchMovies = async (query: string, page = 1): Promise<any[]> => {
  const response = await api.get('/movies/tmdb/search', { params: { query, page } });
  return response.data.results ?? response.data ?? [];
};

export const getMovieDetails = async (movieId: number): Promise<any> => {
  const response = await api.get(`/movies/tmdb/${movieId}`);
  return response.data;
};

export const getImageUrl = (path: string | null | undefined, size: 'w200' | 'w500' | 'original' = 'w500'): string => {
  if (!path) return `https://placehold.co/500x750/1a1a1a/ffffff?text=No+Image`;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
