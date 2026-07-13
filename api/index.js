import "dotenv/config";
import app from "../src/app.js";
import connectDB from "../src/config/db.js";
import seedGenres from "../src/utils/seedGenres.js";

let initialized = false;

async function init() {
  if (!initialized) {
    await connectDB();
    await seedGenres();
    initialized = true;
  }
}

export default async function handler(req, res) {
  await init();
  return app(req, res);
}