import { Router } from "express";
import movieController from "../controllers/movieController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateMovie } from "../middleware/validate.js";

const router = Router();

router.use(authMiddleware);

router.get("/", movieController.getAll);
router.get("/:id", movieController.getById);
router.post("/", validateMovie, movieController.create);
router.put("/:id", validateMovie, movieController.update);
router.put("/:id/favorite", movieController.toggleFavorite);
router.delete("/:id", movieController.remove);

export default router;
