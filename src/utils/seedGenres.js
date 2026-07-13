import Genre from "../models/Genre.js";

const defaultGenres = [
  "Acción", "Aventura", "Animación", "Ciencia ficción", "Comedia",
  "Crimen", "Documental", "Drama", "Fantasía", "Historia",
  "Misterio", "Romance", "Suspenso", "Terror",
];

const seedGenres = async () => {
  for (const name of defaultGenres) {
    await Genre.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }
};

export default seedGenres;
