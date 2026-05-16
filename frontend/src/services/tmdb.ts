import axios from 'axios';
import Constants from 'expo-constants';

// For production, you should ideally proxy TMDB requests through your backend to hide the API key
// For this example, we'll use it directly if configured, otherwise fallback to our backend
const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || '2e9b43087d0f9736eab380d2151b3b8c';
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const getTrendingMovies = async () => {
  const response = await tmdbApi.get('/trending/movie/day');
  return response.data.results;
};

export const getPopularMovies = async (page = 1) => {
  const response = await tmdbApi.get('/movie/popular', { params: { page } });
  return response.data.results;
};

export const getTopRatedMovies = async (page = 1) => {
  const response = await tmdbApi.get('/movie/top_rated', { params: { page } });
  return response.data.results;
};

export const getUpcomingMovies = async (page = 1) => {
  const response = await tmdbApi.get('/movie/upcoming', { params: { page } });
  return response.data.results;
};

export const searchMovies = async (query: string, page = 1) => {
  const response = await tmdbApi.get('/search/movie', { params: { query, page } });
  return response.data.results;
};

export const getMovieDetails = async (movieId: number) => {
  const response = await tmdbApi.get(`/movie/${movieId}`, {
    params: { append_to_response: 'credits,videos,similar' },
  });
  return response.data;
};

export const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
