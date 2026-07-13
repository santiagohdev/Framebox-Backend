const searchMovies = async (query) => {
  const url = `${process.env.MOVIE_API_URL}/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Error consultando la API externa de películas");
  }

  const data = await response.json();

  return (data.results || []).slice(0, 8).map((m) => ({
    externalId: m.id,
    title: m.title,
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : null,
    description: m.overview || "",
  }));
};

export default { searchMovies };
