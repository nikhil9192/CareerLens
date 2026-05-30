import { Router } from "express";
import {
  authMiddleware,
  authorizeStudentAccess,
} from "../middleware/auth";
import { validateParams } from "../middleware/validate";
import { studentIdParamSchema } from "../schemas/analytics.schema";
import * as analyticsController from "../controllers/analyticsController";

const router = Router();

router.use(authMiddleware);

const guarded = [
  validateParams(studentIdParamSchema),
  authorizeStudentAccess,
] as const;

router.get("/gpa/:studentId", ...guarded, analyticsController.getGpa);
router.get("/subjects/:studentId", ...guarded, analyticsController.getSubjects);
router.get("/ranking/:studentId", ...guarded, analyticsController.getRanking);
router.get("/summary/:studentId", ...guarded, analyticsController.getSummary);

export default router;
