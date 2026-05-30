import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../lib/errors";

export interface AuthUser {
  userId: string;
  role: string;
  school_id?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  /** @deprecated Use req.user.userId */
  userId?: string;
}

interface JwtPayload {
  userId: string;
  role: string;
  school_id?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: missing or invalid token" });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    next(new AppError("JWT_SECRET is not configured", 500));
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = {
      userId: payload.userId,
      role: payload.role,
      school_id: payload.school_id,
    };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized: invalid or expired token" });
  }
}

export function authorizeStudentAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const userId = req.user?.userId ?? req.userId;

  if (userId !== req.params.studentId) {
    res.status(403).json({
      error: "Forbidden: you can only access your own analytics",
    });
    return;
  }
  next();
}
