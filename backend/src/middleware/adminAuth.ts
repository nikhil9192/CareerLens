import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";

/**
 * Simple admin gate: requires an "x-admin-secret" header matching the
 * ADMIN_SECRET environment variable. Used only for AI Literacy admin routes.
 */
export function adminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    next(new AppError("ADMIN_SECRET is not configured", 500));
    return;
  }

  const provided = req.headers["x-admin-secret"];

  if (typeof provided !== "string" || provided !== secret) {
    res.status(401).json({ error: "Unauthorized: invalid admin secret" });
    return;
  }

  next();
}
