import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

// Module 2 marks CRUD — mounted at /api/marks
// Endpoints implemented in src/routes/marks.ts (existing module)

export default router;
