import genreService from "../services/genreService.js";

const getAll = async (req, res, next) => {
  try {
    const genres = await genreService.getAll();
    res.status(200).json(genres);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const genre = await genreService.getById(req.params.id);
    res.status(200).json(genre);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const genre = await genreService.create(req.body);
    res.status(201).json(genre);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const genre = await genreService.update(req.params.id, req.body);
    res.status(200).json(genre);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await genreService.remove(req.params.id);
    res.status(200).json({ message: "Género eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};

export default { getAll, getById, create, update, remove };
