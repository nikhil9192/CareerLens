import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as careerController from "../controllers/careerController";

const router = Router();

router.get("/questions", careerController.listQuestions);

router.use(authMiddleware);

router.post("/submit", careerController.submitAssessment);
router.get("/results", careerController.getResults);
router.get("/retake", careerController.retakeAssessment);

export default router;
