import { Router } from "express";
import searchController from "../controllers/searchController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, searchController.suggestions);

export default router;
