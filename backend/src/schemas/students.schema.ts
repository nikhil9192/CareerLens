import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  class_grade: z.string().trim().min(1, "Class is required"),
  school_name: z.string().trim().min(1, "School name is required"),
  mobile: z.string().trim().min(10, "Valid mobile number is required"),
  gender: z.string().trim().min(1, "Gender is required"),
  medium: z.string().trim().min(1, "Medium is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
