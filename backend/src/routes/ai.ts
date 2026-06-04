import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as aiController from "../controllers/aiController";

const router = Router();

router.use(authMiddleware);

router.post("/chat", aiController.chat);
router.get("/history", aiController.history);
router.delete("/clear", aiController.clearHistory);
router.get("/suggestions", aiController.suggestions);

export default router;
