import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireSchoolOwner } from "../middleware/requireRole";
import * as schoolOwnerController from "../controllers/schoolOwnerController";

const router = Router();

router.use(authMiddleware);
router.use(requireSchoolOwner);

router.get("/dashboard", schoolOwnerController.getDashboard);
router.get("/students", schoolOwnerController.getStudents);
router.get("/teachers", schoolOwnerController.getTeachers);
router.get("/student/:id", schoolOwnerController.getStudentDetail);
router.put("/profile", schoolOwnerController.updateProfile);
router.post("/logo", schoolOwnerController.uploadLogo);

export default router;
