import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export function requireSchoolOwner(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== "school_owner") {
    res.status(403).json({ error: "Forbidden: school owner access required" });
    return;
  }
  if (!req.user?.school_id) {
    res.status(403).json({ error: "Forbidden: school_id missing from token" });
    return;
  }
  next();
}
