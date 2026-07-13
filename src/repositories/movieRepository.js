import Movie from "../models/Movie.js";

const findAllByUser = (userId) =>
  Movie.find({ user: userId }).populate("genre");

const findById = (id) => Movie.findById(id).populate("genre");

const create = (movieData) => Movie.create(movieData);

const updateById = (id, movieData) =>
  Movie.findByIdAndUpdate(id, movieData, { new: true, runValidators: true });

const deleteById = (id) => Movie.findByIdAndDelete(id);

export default { findAllByUser, findById, create, updateById, deleteById };
