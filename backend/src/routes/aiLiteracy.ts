import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminAuth } from "../middleware/adminAuth";
import * as aiLiteracyController from "../controllers/aiLiteracyController";

const router = Router();

// ============================================================
// ADMIN ROUTES (require x-admin-secret header)
// ============================================================
// Read (admin sees unpublished too — needed by the admin panel)
router.get("/admin/levels", adminAuth, aiLiteracyController.adminListLevels);
router.get(
  "/admin/levels/:id/content",
  adminAuth,
  aiLiteracyController.adminListLevelContent
);
router.get("/admin/content/:id", adminAuth, aiLiteracyController.adminGetContent);
router.get("/admin/progress", adminAuth, aiLiteracyController.adminListProgress);

// Levels
router.post("/admin/levels", adminAuth, aiLiteracyController.createLevel);
router.put("/admin/levels/:id", adminAuth, aiLiteracyController.updateLevel);
router.delete("/admin/levels/:id", adminAuth, aiLiteracyController.deleteLevel);

// Content
router.post("/admin/content", adminAuth, aiLiteracyController.createContent);
router.put("/admin/content/:id", adminAuth, aiLiteracyController.updateContent);
router.delete("/admin/content/:id", adminAuth, aiLiteracyController.deleteContent);

// Quiz questions
router.post("/admin/quiz", adminAuth, aiLiteracyController.createQuizQuestion);
router.put("/admin/quiz/:id", adminAuth, aiLiteracyController.updateQuizQuestion);
router.delete("/admin/quiz/:id", adminAuth, aiLiteracyController.deleteQuizQuestion);

// ============================================================
// STUDENT ROUTES (require student JWT)
// ============================================================
router.get("/levels", authMiddleware, aiLiteracyController.getLevels);
router.get(
  "/levels/:id/content",
  authMiddleware,
  aiLiteracyController.getLevelContent
);
router.get("/content/:id", authMiddleware, aiLiteracyController.getContentItem);
router.post("/progress", authMiddleware, aiLiteracyController.saveProgress);
router.get("/my-progress", authMiddleware, aiLiteracyController.getMyProgress);

export default router;
