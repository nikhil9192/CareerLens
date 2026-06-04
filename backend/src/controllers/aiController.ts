import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../lib/errors";
import {
  handleChat,
  getChatHistory,
  clearChatHistory,
  getSuggestions,
} from "../services/aiService";

function getStudentId(req: AuthRequest): string {
  const studentId = req.user?.userId ?? req.userId;
  if (!studentId) {
    throw new AppError("Unauthorized", 401);
  }
  return studentId;
}

export async function chat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = getStudentId(req);
    const { message } = req.body as { message?: unknown };

    if (typeof message !== "string") {
      throw new AppError("Message cannot be empty", 400);
    }

    const result = await handleChat(studentId, message);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function history(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = getStudentId(req);
    const messages = await getChatHistory(studentId);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

export async function clearHistory(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = getStudentId(req);
    await clearChatHistory(studentId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function suggestions(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = getStudentId(req);
    const items = await getSuggestions(studentId);
    res.json({ suggestions: items });
  } catch (err) {
    next(err);
  }
}
