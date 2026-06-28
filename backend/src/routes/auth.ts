import { Router } from "express";
import { register, login, ownerLogin, getMe } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/owner/login", ownerLogin);
router.get("/me", authMiddleware, getMe);

export default router;
