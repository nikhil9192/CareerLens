import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../lib/errors";
import { generateStudentReport } from "../services/reportService";

function getStudentId(req: AuthRequest): string {
  const studentId = req.user?.userId ?? req.userId;
  if (!studentId) {
    throw new AppError("Unauthorized", 401);
  }
  return studentId;
}

export async function generateReport(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = getStudentId(req);
    const { pdf, reportId, filename } = await generateStudentReport(studentId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("X-Report-Id", reportId);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
}
