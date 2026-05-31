import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase";
import { registerSchema } from "../schemas/students.schema";

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ userId, role: "student" }, secret, { expiresIn: "7d" });
}

export async function createStudent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors.map((e) => e.message).join(", "),
      });
      return;
    }

    const { password, ...fields } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("students")
      .insert({
        name: fields.name,
        class_grade: fields.class_grade,
        school_name: fields.school_name,
        mobile: fields.mobile,
        gender: fields.gender,
        medium: fields.medium,
        password_hash: passwordHash,
      })
      .select("id, name, class_grade, school_name, mobile, gender, medium, created_at")
      .single();

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    const token = signToken(data.id);

    res.status(201).json({
      success: true,
      student: data,
      token,
    });
  } catch (err) {
    next(err);
  }
}
