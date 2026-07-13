import genreRepository from "../repositories/genreRepository.js";

const getAll = () => genreRepository.findAll();

const getById = async (id) => {
  const genre = await genreRepository.findById(id);
  if (!genre) {
    const error = new Error("Género no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return genre;
};

const create = async ({ name }) => {
  if (!name) {
    const error = new Error("El nombre es requerido");
    error.statusCode = 400;
    throw error;
  }

  const existingGenre = await genreRepository.findByName(name);
  if (existingGenre) {
    const error = new Error("El género ya existe");
    error.statusCode = 409;
    throw error;
  }

  return genreRepository.create({ name });
};

const update = async (id, { name }) => {
  if (!name) {
    const error = new Error("El nombre es requerido");
    error.statusCode = 400;
    throw error;
  }

  const genre = await genreRepository.updateById(id, { name });
  if (!genre) {
    const error = new Error("Género no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return genre;
};

const remove = async (id) => {
  const genre = await genreRepository.deleteById(id);
  if (!genre) {
    const error = new Error("Género no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return genre;
};

export default { getAll, getById, create, update, remove };
