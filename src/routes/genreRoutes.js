import { Router } from "express";
import genreController from "../controllers/genreController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateGenre } from "../middleware/validate.js";

const router = Router();

router.get("/", genreController.getAll);
router.get("/:id", genreController.getById);
router.post("/", authMiddleware, validateGenre, genreController.create);
router.put("/:id", authMiddleware, validateGenre, genreController.update);
router.delete("/:id", authMiddleware, genreController.remove);

export default router;
