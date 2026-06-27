const TMDB_API_KEY = process.env.TMDB_API_KEY || '2e9b43087d0f9736eab380d2151b3b8c';
const BASE_URL = 'https://api.themoviedb.org/3';

const fetchFromTMDB = async (endpoint, queryParams = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  
  for (const [key, value] of Object.entries(queryParams)) {
    if (value) url.searchParams.append(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB Error: ${response.status}`);
  }
  return response.json();
};

exports.getTrendingMovies = async (req, res) => {
  try {
    const data = await fetchFromTMDB('/trending/movie/day');
    console.log("TMDB RESPONSE:", data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPopularMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB('/movie/popular', { page });
    console.log("TMDB RESPONSE:", data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTopRatedMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB('/movie/top_rated', { page });
    console.log("TMDB RESPONSE:", data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUpcomingMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB('/movie/upcoming', { page });
    console.log("TMDB RESPONSE:", data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchMovies = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) {
      return res.json({ results: [] });
    }
    const data = await fetchFromTMDB('/search/movie', { query, page });
    console.log("TMDB RESPONSE:", data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMovieDetails = async (req, res) => {
  try {
    const { movieId } = req.params;
    const data = await fetchFromTMDB(`/movie/${movieId}`, {
      append_to_response: 'credits,videos,similar'
    });
    console.log("TMDB RESPONSE:", data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
