import { Router } from "express";
import { getSchools } from "../controllers/schools.controller";

const router = Router();

router.get("/", getSchools);

export default router;
