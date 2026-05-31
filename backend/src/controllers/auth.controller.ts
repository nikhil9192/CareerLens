import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { AppError } from "../lib/errors";
import { AuthRequest } from "../middleware/auth";

interface TokenPayload {
  userId: string;
  role: string;
  school_id: string;
}

function signToken(userId: string, role: string, school_id: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }
  return jwt.sign({ userId, role, school_id }, secret, { expiresIn: "7d" });
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { password, email, school_id, ...fields } = parsed.data;

    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("id")
      .eq("id", school_id)
      .single();

    if (schoolError || !school) {
      res.status(400).json({ error: "Invalid school selected" });
      return;
    }

    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const hash = await bcrypt.hash(password, 10);

    const { data: student, error } = await supabase
      .from("students")
      .insert({
        name: fields.name,
        email,
        password_hash: hash,
        mobile: fields.mobile,
        school_id,
        teacher_id: null,
        class_grade: String(fields.class_grade),
        gender: fields.gender,
        medium: fields.medium,
      })
      .select(
        "id, name, email, mobile, school_id, teacher_id, class_grade, gender, medium, created_at"
      )
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const token = signToken(student.id, "student", student.school_id);

    res.status(201).json({
      token,
      student,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parsed.data;

    const { data: student, error } = await supabase
      .from("students")
      .select(
        "id, name, email, password_hash, class_grade, school_id, teacher_id, schools(name, city, state)"
      )
      .eq("email", email)
      .single();

    if (error || !student) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const match = await bcrypt.compare(password, student.password_hash);

    if (!match) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const { password_hash: _, schools, ...safeStudent } = student;
    const token = signToken(student.id, "student", student.school_id);

    res.json({
      token,
      student: {
        ...safeStudent,
        school: schools,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data: student, error } = await supabase
      .from("students")
      .select(
        "id, name, email, mobile, class_grade, gender, medium, school_id, teacher_id, created_at, schools(name, city, state)"
      )
      .eq("id", userId)
      .single();

    if (error || !student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const { schools, ...profile } = student;

    res.json({
      ...profile,
      school: schools,
    });
  } catch (err) {
    next(err);
  }
}
