import { z } from "zod";

export const studentIdParamSchema = z.object({
  studentId: z.string().uuid({ message: "studentId must be a valid UUID" }),
});

export type StudentIdParam = z.infer<typeof studentIdParamSchema>;
