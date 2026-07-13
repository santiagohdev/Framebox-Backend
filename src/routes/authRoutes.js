import { Router } from "express";
import authController from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middleware/validate.js";

const router = Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/verify/:token", authController.verifyEmail);

export default router;
