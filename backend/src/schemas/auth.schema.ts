import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  mobile: z.string().length(10, "Mobile must be exactly 10 digits"),
  school_id: z.string().uuid("school_id must be a valid UUID"),
  class_grade: z.coerce
    .number()
    .min(6, "Class grade must be at least 6")
    .max(12, "Class grade must be at most 12"),
  gender: z.string().trim().min(1, "Gender is required"),
  medium: z.string().trim().min(1, "Medium is required"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
