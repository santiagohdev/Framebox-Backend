import Genre from "../models/Genre.js";

const findAll = () => Genre.find();

const findById = (id) => Genre.findById(id);

const findByName = (name) => Genre.findOne({ name });

const create = (genreData) => Genre.create(genreData);

const updateById = (id, genreData) =>
  Genre.findByIdAndUpdate(id, genreData, { new: true, runValidators: true });

const deleteById = (id) => Genre.findByIdAndDelete(id);

export default { findAll, findById, findByName, create, updateById, deleteById };
