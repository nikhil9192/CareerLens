import { Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../lib/errors";

interface SubjectMark {
  subject: string;
  marks: number;
  total_marks: number;
}

export async function saveMarks(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { student_id, exam_term, subjects } = req.body as {
      student_id?: string;
      exam_term?: string;
      subjects?: SubjectMark[];
    };

    if (!student_id || String(student_id).trim() === "") {
      res.status(400).json({
        success: false,
        error: "student_id is required",
      });
      return;
    }

    const userId = req.user?.userId;
    if (userId && userId !== student_id) {
      res.status(403).json({
        success: false,
        error: "Forbidden: you can only save your own marks",
      });
      return;
    }

    if (!exam_term || String(exam_term).trim() === "") {
      res.status(400).json({
        success: false,
        error: "exam_term is required",
      });
      return;
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      res.status(400).json({
        success: false,
        error: "subjects must be a non-empty array",
      });
      return;
    }

    const rows = subjects.map((item) => ({
      student_id,
      exam_term: String(exam_term).trim(),
      subject: item.subject,
      marks: item.marks,
      total_marks: item.total_marks,
    }));

    const { error } = await supabase.from("marks").insert(rows);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(201).json({
      success: true,
      message: "Marks saved",
    });
  } catch (err) {
    next(err);
  }
}
