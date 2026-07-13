import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import seedGenres from "./utils/seedGenres.js";

const PORT = process.env.PORT || 4000;

connectDB().then(async () => {
  await seedGenres();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
