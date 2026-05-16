import axios from 'axios';
import { ENV } from '../config/env';

const TMDB_API_KEY = ENV.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
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
