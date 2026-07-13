import movieService from "../services/movieService.js";

const getAll = async (req, res, next) => {
  try {
    const movies = await movieService.getAll(req.user.id);
    res.status(200).json(movies);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const movie = await movieService.getById(req.params.id);
    res.status(200).json(movie);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const movie = await movieService.create(req.body, req.user.id);
    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const movie = await movieService.update(req.params.id, req.body);
    res.status(200).json(movie);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await movieService.remove(req.params.id);
    res.status(200).json({ message: "Película eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};
const toggleFavorite = async (req, res, next) => {
  try {
    const movie = await movieService.toggleFavorite(req.params.id);

    res.status(200).json(movie);

  } catch (error) {
    next(error);
  }
};

export default { 
  getAll, 
  getById, 
  create, 
  update, 
  remove,
  toggleFavorite
};
