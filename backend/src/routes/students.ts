import { Router } from "express";
import { createStudent } from "../controllers/students.controller";

const router = Router();

router.post("/", createStudent);

export default router;
