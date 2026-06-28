import { Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../lib/errors";

// ─── shared types ──────────────────────────────────────────────────────────

interface BaseStudent {
  id: string;
  name: string;
  class_grade: string;
  gender: string | null;
  medium: string | null;
  teacher_id: string | null;
}

// Exact columns from career_matches table: student_id, career_id, match_score, rank
interface RawMatchRow {
  student_id: string;
  career_id: string;
  rank: number;
  match_score: number;
}

// Exact columns from ai_literacy_progress table: student_id, level, completed
interface LiteracyRow {
  student_id: string;
  level: number;
  completed: boolean;
}

// Exact columns from reports table: student_id, pdf_url, status
interface ReportRow {
  student_id: string;
  status: string | null;
}

interface EnrichedStudent extends BaseStudent {
  quiz_completed: boolean;
  career_top2: Array<{ title: string; match_score: number; rank: number }>;
  ai_literacy_count: number;
  report_status: string | null;
}

// ─── helper ────────────────────────────────────────────────────────────────

async function enrichStudents(
  students: BaseStudent[]
): Promise<EnrichedStudent[]> {
  if (students.length === 0) return [];

  const studentIds = students.map((s) => s.id);

  // Step 1 — fetch raw career_matches (no join, only the exact 4 columns)
  const { data: matchData } = await supabase
    .from("career_matches")
    .select("student_id, career_id, rank, match_score")
    .in("student_id", studentIds)
    .lte("rank", 2)
    .order("rank", { ascending: true });

  // Step 2 — fetch career titles for those career_ids (separate query, no FK join)
  const uniqueCareerIds = [
    ...new Set(
      ((matchData ?? []) as RawMatchRow[])
        .map((m) => m.career_id)
        .filter(Boolean)
    ),
  ];
  const careerTitleMap = new Map<string, string>();
  if (uniqueCareerIds.length > 0) {
    const { data: careersData } = await supabase
      .from("careers")
      .select("id, title")
      .in("id", uniqueCareerIds);
    for (const c of (careersData ?? []) as Array<{ id: string; title: string }>) {
      careerTitleMap.set(c.id, c.title);
    }
  }

  // Step 3 — ai_literacy_progress (exact columns: student_id, level, completed)
  const { data: literacyData } = await supabase
    .from("ai_literacy_progress")
    .select("student_id, level, completed")
    .in("student_id", studentIds);

  // Step 4 — reports (exact columns: student_id, pdf_url, status)
  const { data: reportsData } = await supabase
    .from("reports")
    .select("student_id, status")
    .in("student_id", studentIds);

  // Build lookup maps
  const matchesByStudent = new Map<
    string,
    Array<{ title: string; match_score: number; rank: number }>
  >();
  for (const m of (matchData ?? []) as RawMatchRow[]) {
    if (!matchesByStudent.has(m.student_id)) {
      matchesByStudent.set(m.student_id, []);
    }
    matchesByStudent.get(m.student_id)!.push({
      title: careerTitleMap.get(m.career_id) ?? "—",
      match_score: m.match_score,
      rank: m.rank,
    });
  }

  // Count literacy rows per student (each row = one level, any value of completed)
  const literacyCountByStudent = new Map<string, number>();
  for (const l of (literacyData ?? []) as LiteracyRow[]) {
    literacyCountByStudent.set(
      l.student_id,
      (literacyCountByStudent.get(l.student_id) ?? 0) + 1
    );
  }

  const reportByStudent = new Map<string, string | null>();
  for (const r of (reportsData ?? []) as ReportRow[]) {
    reportByStudent.set(r.student_id, r.status ?? null);
  }

  return students.map((s) => ({
    ...s,
    quiz_completed: (matchesByStudent.get(s.id) ?? []).length > 0,
    career_top2: matchesByStudent.get(s.id) ?? [],
    ai_literacy_count: literacyCountByStudent.get(s.id) ?? 0,
    report_status: reportByStudent.get(s.id) ?? null,
  }));
}

// ─── GET /api/school/dashboard ─────────────────────────────────────────────

export async function getDashboard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const schoolId = req.user!.school_id!;

    const [schoolRes, studentsRes, teachersRes] = await Promise.all([
      supabase
        .from("schools")
        .select(
          "id, name, name_hindi, district, logo_url, tagline, principal_name, principal_mobile"
        )
        .eq("id", schoolId)
        .single(),
      supabase
        .from("students")
        .select("id, name, class_grade, gender, medium, teacher_id")
        .eq("school_id", schoolId)
        .order("name"),
      supabase
        .from("teachers")
        .select("id, name, email")
        .eq("school_id", schoolId)
        .order("name"),
    ]);

    if (schoolRes.error) throw new AppError(schoolRes.error.message, 500);

    const students = (studentsRes.data ?? []) as BaseStudent[];
    const enriched = await enrichStudents(students);

    // Stats
    const quizCompleted = enriched.filter((s) => s.quiz_completed).length;
    const aiStarted = enriched.filter((s) => s.ai_literacy_count > 0).length;
    const reportsGenerated = enriched.filter(
      (s) => s.report_status === "generated" || s.report_status === "completed"
    ).length;

    // Class breakdown
    const classMap = new Map<
      string,
      { total: number; completed: number }
    >();
    for (const s of enriched) {
      const key = s.class_grade ?? "Unknown";
      if (!classMap.has(key)) classMap.set(key, { total: 0, completed: 0 });
      const entry = classMap.get(key)!;
      entry.total += 1;
      if (s.quiz_completed) entry.completed += 1;
    }
    const class_breakdown = Array.from(classMap.entries())
      .map(([class_grade, v]) => ({ class_grade, ...v }))
      .sort((a, b) => String(a.class_grade).localeCompare(String(b.class_grade)));

    // Teachers with student counts
    const teachers = (teachersRes.data ?? []) as Array<{
      id: string;
      name: string;
      email: string;
    }>;
    const studentCountByTeacher = new Map<string, number>();
    for (const s of students) {
      if (s.teacher_id) {
        studentCountByTeacher.set(
          s.teacher_id,
          (studentCountByTeacher.get(s.teacher_id) ?? 0) + 1
        );
      }
    }
    const teacherRows = teachers.map((t) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      student_count: studentCountByTeacher.get(t.id) ?? 0,
    }));

    res.json({
      school: schoolRes.data,
      stats: {
        total_students: students.length,
        quiz_completed: quizCompleted,
        ai_literacy_started: aiStarted,
        reports_generated: reportsGenerated,
      },
      students: enriched,
      class_breakdown,
      teachers: teacherRows,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/school/students ──────────────────────────────────────────────

export async function getStudents(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const schoolId = req.user!.school_id!;
    const { class_grade, teacher_id, search, status } = req.query as Record<
      string,
      string | undefined
    >;

    let query = supabase
      .from("students")
      .select("id, name, class_grade, gender, medium, teacher_id")
      .eq("school_id", schoolId)
      .order("name");

    if (class_grade && class_grade !== "all") {
      query = query.eq("class_grade", class_grade);
    }
    if (teacher_id) {
      query = query.eq("teacher_id", teacher_id);
    }
    if (search && search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data: students, error } = await query;
    if (error) throw new AppError(error.message, 500);

    const enriched = await enrichStudents((students ?? []) as BaseStudent[]);

    // Client-supplied status filter (quiz_completed / ai_started / has_report)
    const filtered =
      status && status !== "all"
        ? enriched.filter((s) => {
            if (status === "quiz_completed") return s.quiz_completed;
            if (status === "ai_started") return s.ai_literacy_count > 0;
            if (status === "has_report") return Boolean(s.report_status);
            return true;
          })
        : enriched;

    res.json({ students: filtered });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/school/teachers ──────────────────────────────────────────────

export async function getTeachers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const schoolId = req.user!.school_id!;

    const { data: teachers, error } = await supabase
      .from("teachers")
      .select("id, name, email")
      .eq("school_id", schoolId)
      .order("name");

    if (error) throw new AppError(error.message, 500);

    const { data: students } = await supabase
      .from("students")
      .select("id, teacher_id, class_grade")
      .eq("school_id", schoolId);

    const countByTeacher = new Map<string, number>();
    const classesByTeacher = new Map<string, Set<string>>();

    for (const s of students ?? []) {
      if (s.teacher_id) {
        countByTeacher.set(
          s.teacher_id,
          (countByTeacher.get(s.teacher_id) ?? 0) + 1
        );
        if (!classesByTeacher.has(s.teacher_id)) {
          classesByTeacher.set(s.teacher_id, new Set());
        }
        if (s.class_grade) {
          classesByTeacher.get(s.teacher_id)!.add(String(s.class_grade));
        }
      }
    }

    const rows = (teachers ?? []).map(
      (t: { id: string; name: string; email: string }) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        student_count: countByTeacher.get(t.id) ?? 0,
        classes: Array.from(classesByTeacher.get(t.id) ?? []).sort(),
        active: true,
      })
    );

    res.json({ teachers: rows });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/school/student/:id ───────────────────────────────────────────

export async function getStudentDetail(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const schoolId = req.user!.school_id!;
    const { id: studentId } = req.params;

    // Security: student must belong to this school
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select(
        "id, name, class_grade, gender, medium, mobile, created_at, school_id"
      )
      .eq("id", studentId)
      .eq("school_id", schoolId)
      .single();

    if (studentError || !student) {
      throw new AppError("Student not found", 404);
    }

    const [marksRes, rawMatchesRes, literacyRes, reportRes] = await Promise.all([
      supabase
        .from("marks")
        .select("subject, exam_term, marks, total_marks")
        .eq("student_id", studentId)
        .order("subject"),
      // Only the exact columns in career_matches: student_id, career_id, match_score, rank
      supabase
        .from("career_matches")
        .select("rank, match_score, career_id")
        .eq("student_id", studentId)
        .order("rank", { ascending: true }),
      // Only the exact columns in ai_literacy_progress: student_id, level, completed
      supabase
        .from("ai_literacy_progress")
        .select("level, completed")
        .eq("student_id", studentId)
        .order("level", { ascending: true }),
      // Only the exact columns in reports: student_id, pdf_url, status
      supabase
        .from("reports")
        .select("status, pdf_url")
        .eq("student_id", studentId)
        .maybeSingle(),
    ]);

    // Resolve career details via a separate query (avoids FK join dependency)
    const careerIds = (
      (rawMatchesRes.data ?? []) as Array<{ career_id: string }>
    )
      .map((m) => m.career_id)
      .filter(Boolean);

    const careersDetailMap = new Map<
      string,
      { id: string; title: string; description: string | null; salary_range: string | null; entry_path: string | null }
    >();
    if (careerIds.length > 0) {
      const { data: careersDetail } = await supabase
        .from("careers")
        .select("id, title, description, salary_range, entry_path")
        .in("id", careerIds);
      for (const c of careersDetail ?? []) {
        careersDetailMap.set(c.id, c as typeof c & { id: string; title: string; description: string | null; salary_range: string | null; entry_path: string | null });
      }
    }

    const career_matches = (
      (rawMatchesRes.data ?? []) as Array<{
        rank: number;
        match_score: number;
        career_id: string;
      }>
    ).map((m) => ({
      rank: m.rank,
      match_score: m.match_score,
      careers: careersDetailMap.get(m.career_id) ?? null,
    }));

    const { school_id: _removed, ...safeStudent } = student as typeof student & { school_id: string };

    res.json({
      student: safeStudent,
      marks: marksRes.data ?? [],
      career_matches,
      ai_literacy: literacyRes.data ?? [],
      report: reportRes.data ?? null,
    });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/school/profile ───────────────────────────────────────────────

export async function updateProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const schoolId = req.user!.school_id!;
    const { name, name_hindi, tagline, district, principal_name, principal_mobile } =
      req.body as {
        name?: string;
        name_hindi?: string;
        tagline?: string;
        district?: string;
        principal_name?: string;
        principal_mobile?: string;
      };

    const patch: Record<string, string | null> = {};
    if (name !== undefined) patch.name = name.trim();
    if (name_hindi !== undefined) patch.name_hindi = name_hindi.trim() || null;
    if (tagline !== undefined) patch.tagline = tagline.trim() || null;
    if (district !== undefined) patch.district = district.trim() || null;
    if (principal_name !== undefined) patch.principal_name = principal_name.trim() || null;
    if (principal_mobile !== undefined) patch.principal_mobile = principal_mobile.trim() || null;

    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "No fields provided to update" });
      return;
    }

    const { data, error } = await supabase
      .from("schools")
      .update(patch)
      .eq("id", schoolId)
      .select(
        "id, name, name_hindi, district, logo_url, tagline, principal_name, principal_mobile"
      )
      .single();

    if (error) throw new AppError(error.message, 500);

    res.json({ school: data });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/school/logo ─────────────────────────────────────────────────

export async function uploadLogo(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const schoolId = req.user!.school_id!;
    const { logo_base64 } = req.body as { logo_base64?: string };

    if (!logo_base64 || typeof logo_base64 !== "string") {
      throw new AppError("logo_base64 is required", 400);
    }

    const match = logo_base64.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      throw new AppError("Invalid base64 image format (expected data:<mime>;base64,...)", 400);
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(mimeType)) {
      throw new AppError("Only JPEG, PNG, and WebP images are allowed", 400);
    }

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.byteLength > 2 * 1024 * 1024) {
      throw new AppError("Image must be under 2 MB", 400);
    }

    const ext = mimeType === "image/jpeg" || mimeType === "image/jpg" ? "jpg" : mimeType.split("/")[1];
    const filePath = `${schoolId}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("school-logos")
      .upload(filePath, buffer, { contentType: mimeType, upsert: true });

    if (uploadError) throw new AppError(uploadError.message, 500);

    const { data: urlData } = supabase.storage
      .from("school-logos")
      .getPublicUrl(filePath);

    const logoUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("schools")
      .update({ logo_url: logoUrl })
      .eq("id", schoolId);

    if (updateError) throw new AppError(updateError.message, 500);

    res.json({ logo_url: logoUrl });
  } catch (err) {
    next(err);
  }
}
