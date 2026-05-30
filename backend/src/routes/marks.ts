import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { saveMarks } from "../controllers/marks.controller";

const router = Router();

router.use(authMiddleware);
router.post("/", saveMarks);

export default router;
