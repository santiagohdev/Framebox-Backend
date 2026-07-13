import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    year: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    poster: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pendiente", "Viendo", "Vista"],
      default: "Pendiente",
    },
    rating: {
      type: Number,
    },
    favorite: {
    type: Boolean,
    default: false,
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Genre",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
