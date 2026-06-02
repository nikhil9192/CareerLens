import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as reportController from "../controllers/reportController";

const router = Router();

router.use(authMiddleware);
router.get("/generate", reportController.generateReport);

export default router;
