import tmdb from "../utils/tmdb.js";

const search = async (query) => {
  if (!query || !query.trim()) return [];

  try {
    return await tmdb.searchMovies(query.trim());
  } catch (error) {
    return [];
  }
};

export default { search };
