import movieRepository from "../repositories/movieRepository.js";

const getAll = (userId) => movieRepository.findAllByUser(userId);

const getById = async (id) => {
  const movie = await movieRepository.findById(id);
  if (!movie) {
    const error = new Error("Película no encontrada");
    error.statusCode = 404;
    throw error;
  }
  return movie;
};

const create = async (movieData, userId) => {
  if (!movieData.title) {
    const error = new Error("El título es requerido");
    error.statusCode = 400;
    throw error;
  }

  return movieRepository.create({ ...movieData, user: userId });
};

const update = async (id, movieData) => {
  const movie = await movieRepository.updateById(id, movieData);
  if (!movie) {
    const error = new Error("Película no encontrada");
    error.statusCode = 404;
    throw error;
  }
  return movie;
};

const remove = async (id) => {
  const movie = await movieRepository.deleteById(id);
  if (!movie) {
    const error = new Error("Película no encontrada");
    error.statusCode = 404;
    throw error;
  }
  return movie;
};

const toggleFavorite = async (id) => {
  const movie = await movieRepository.findById(id);

  if (!movie) {
    const error = new Error("Película no encontrada");
    error.statusCode = 404;
    throw error;
  }

  movie.favorite = !movie.favorite;

  return movieRepository.updateById(id, {
    favorite: movie.favorite,
  });
};

export default { 
  getAll, 
  getById, 
  create, 
  update, 
  remove,
  toggleFavorite
};