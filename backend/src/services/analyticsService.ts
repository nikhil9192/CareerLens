import NodeCache from "node-cache";
import { supabase } from "../lib/supabase";
import { AppError, NotFoundError } from "../lib/errors";

const rankingCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const PASS_THRESHOLD = 60;

export function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function scoreToGpa(score: number): number {
  return Math.round((score / 100) * 4 * 100) / 100;
}

function weightedGpa(marks: { marks: number; totalMarks: number }[]): number {
  if (marks.length === 0) return 0;

  const totalEarned = marks.reduce((sum, m) => sum + m.marks, 0);
  const totalPossible = marks.reduce((sum, m) => sum + m.totalMarks, 0);

  if (totalPossible === 0) return 0;

  return Math.round((totalEarned / totalPossible) * 4 * 100) / 100;
}

async function getStudentOrThrow(studentId: string) {
  const { data: student, error } = await supabase
    .from("students")
    .select("id, school_id, class_grade")
    .eq("id", studentId)
    .single();

  if (error || !student) {
    throw new NotFoundError("Student not found");
  }

  return student;
}

export async function getGpaAnalytics(studentId: string) {
  await getStudentOrThrow(studentId);

  const { data: marks, error } = await supabase
    .from("marks")
    .select("exam_term, marks, total_marks")
    .eq("student_id", studentId)
    .order("exam_term", { ascending: true });

  if (error) {
    throw new AppError(error.message, 500);
  }

  const semesterMap = new Map<
    string,
    { marks: number; totalMarks: number }[]
  >();

  for (const mark of marks ?? []) {
    const term = mark.exam_term;
    const existing = semesterMap.get(term) ?? [];
    existing.push({ marks: mark.marks, totalMarks: mark.total_marks });
    semesterMap.set(term, existing);
  }

  const normalizedMarks = (marks ?? []).map((mark) => ({
    marks: mark.marks,
    totalMarks: mark.total_marks,
  }));

  const semesterBreakdown = Array.from(semesterMap.entries()).map(
    ([semester, semesterMarks]) => ({
      semester,
      gpa: weightedGpa(semesterMarks),
      subjectCount: semesterMarks.length,
    })
  );

  const overallGpa = weightedGpa(normalizedMarks);

  let trend: "up" | "down" | "stable" = "stable";
  let change = 0;

  if (semesterBreakdown.length >= 2) {
    const prev = semesterBreakdown[semesterBreakdown.length - 2].gpa;
    const latest = semesterBreakdown[semesterBreakdown.length - 1].gpa;
    change = Math.round((latest - prev) * 100) / 100;

    if (change > 0.05) trend = "up";
    else if (change < -0.05) trend = "down";
  }

  return { overallGpa, semesterBreakdown, trend, change };
}

export async function getSubjectAnalytics(studentId: string) {
  await getStudentOrThrow(studentId);

  const { data: marks, error } = await supabase
    .from("marks")
    .select("subject, marks, total_marks")
    .eq("student_id", studentId);

  if (error) {
    throw new AppError(error.message, 500);
  }

  const subjectScores = new Map<string, { total: number; count: number }>();

  for (const mark of marks ?? []) {
    const score = (mark.marks / mark.total_marks) * 100;
    const existing = subjectScores.get(mark.subject) ?? {
      total: 0,
      count: 0,
    };
    existing.total += score;
    existing.count += 1;
    subjectScores.set(mark.subject, existing);
  }

  const all = Array.from(subjectScores.entries())
    .map(([name, { total, count }]) => {
      const score = Math.round((total / count) * 100) / 100;
      return {
        name,
        score,
        grade: scoreToGrade(score),
        status: (score >= PASS_THRESHOLD ? "pass" : "fail") as "pass" | "fail",
      };
    })
    .sort((a, b) => b.score - a.score);

  return {
    topSubjects: all.slice(0, 3).map(({ name, score, grade }) => ({
      name,
      score,
      grade,
    })),
    weakSubjects: [...all]
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(({ name, score, grade }) => ({ name, score, grade })),
    all,
  };
}

async function computeRanking(
  studentId: string,
  schoolId: string,
  classGrade: string
) {
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id")
    .eq("school_id", schoolId)
    .eq("class_grade", classGrade);

  if (studentsError) {
    throw new AppError(studentsError.message, 500);
  }

  const gpaList: { id: string; gpa: number }[] = [];

  for (const student of students ?? []) {
    const { data: marks, error: marksError } = await supabase
      .from("marks")
      .select("marks, total_marks")
      .eq("student_id", student.id);

    if (marksError) {
      throw new AppError(marksError.message, 500);
    }

    const normalizedMarks = (marks ?? []).map((mark) => ({
      marks: mark.marks,
      totalMarks: mark.total_marks,
    }));

    gpaList.push({ id: student.id, gpa: weightedGpa(normalizedMarks) });
  }

  gpaList.sort((a, b) => b.gpa - a.gpa);

  const rank =
    gpaList.findIndex((entry) => entry.id === studentId) + 1 || gpaList.length;
  const totalStudents = gpaList.length;
  const percentile =
    totalStudents > 0
      ? Math.round(((totalStudents - rank + 1) / totalStudents) * 10000) / 100
      : 0;

  const batch = `Class ${classGrade}`;

  return { rank, totalStudents, percentile, batch };
}

export async function getRankingAnalytics(studentId: string) {
  const student = await getStudentOrThrow(studentId);
  const cacheKey = `ranking:${studentId}`;

  const cached = rankingCache.get<{
    rank: number;
    totalStudents: number;
    percentile: number;
    batch: string;
  }>(cacheKey);

  if (cached) {
    return cached;
  }

  const result = await computeRanking(
    studentId,
    student.school_id,
    student.class_grade
  );
  rankingCache.set(cacheKey, result);
  return result;
}

export async function getSummaryAnalytics(studentId: string) {
  const [gpa, subjects, ranking] = await Promise.all([
    getGpaAnalytics(studentId),
    getSubjectAnalytics(studentId),
    getRankingAnalytics(studentId),
  ]);

  return { gpa, subjects, ranking };
}
