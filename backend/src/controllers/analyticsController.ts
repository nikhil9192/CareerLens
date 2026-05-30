import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as analyticsService from "../services/analyticsService";
import { AppError } from "../lib/errors";

async function handleAnalyticsRequest(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
  handler: (studentId: string) => Promise<unknown>
): Promise<void> {
  try {
    const studentId = req.params.studentId as string;
    const data = await handler(studentId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getGpa(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await handleAnalyticsRequest(req, res, next, analyticsService.getGpaAnalytics);
}

export async function getSubjects(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await handleAnalyticsRequest(
    req,
    res,
    next,
    analyticsService.getSubjectAnalytics
  );
}

export async function getRanking(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await handleAnalyticsRequest(
    req,
    res,
    next,
    analyticsService.getRankingAnalytics
  );
}

export async function getSummary(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await handleAnalyticsRequest(
    req,
    res,
    next,
    analyticsService.getSummaryAnalytics
  );
}

export function analyticsErrorHandler(
  err: unknown,
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  next(err);
}
