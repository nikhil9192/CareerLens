/**
 * All school-owner API calls use a DEDICATED token key ("school_owner_token")
 * and a dedicated HTTP helper so they are completely isolated from the student
 * auth flow.  On 401 we redirect to /school/login (not the student /login).
 */

import { SCHOOL_TOKEN_KEY } from "./auth";

// ─── Base URL (mirrors the logic in lib/api.ts) ───────────────────────────────

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL as string | undefined;
  if (url) return url;
  if (import.meta.env.DEV) return "http://localhost:8000";
  throw new Error("VITE_API_URL is not set.");
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function schoolFetch(
  path: string,
  method: string = "GET",
  body?: object
): Promise<unknown> {
  const token = localStorage.getItem(SCHOOL_TOKEN_KEY);

  // Debug: log what token we are sending (remove once stable)
  console.debug(
    `[schoolFetch] ${method} ${path} — token: ${token ? token.slice(0, 20) + "…" : "MISSING"}`
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw {
      response: {
        data: { error: "Cannot reach the server. Check your connection." },
        status: 0,
      },
    };
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (res.status === 401) {
    // Token is missing or expired — clear it and go to school login
    localStorage.removeItem(SCHOOL_TOKEN_KEY);
    window.location.href = "/school/login";
    throw { response: { data, status: 401 } };
  }

  if (!res.ok) {
    throw { response: { data, status: res.status } };
  }

  return data;
}

function schoolGet(path: string): Promise<unknown> {
  return schoolFetch(path, "GET");
}

function schoolPost(path: string, body: object): Promise<unknown> {
  return schoolFetch(path, "POST", body);
}

function schoolPut(path: string, body: object): Promise<unknown> {
  return schoolFetch(path, "PUT", body);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface OwnerLoginPayload {
  email: string;
  password: string;
}

export interface OwnerLoginResponse {
  token: string;
  owner: {
    id: string;
    name: string;
    email: string;
    school_id: string;
  };
}

// Login does NOT use schoolFetch because it doesn't need an existing token
export async function ownerLogin(
  payload: OwnerLoginPayload
): Promise<OwnerLoginResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}/api/auth/owner/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    throw {
      response: {
        data: { error: "Cannot reach the server. Check your connection." },
        status: 0,
      },
    };
  }

  let data: unknown;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    throw { response: { data, status: res.status } };
  }

  return data as OwnerLoginResponse;
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface SchoolInfo {
  id: string;
  name: string;
  name_hindi: string | null;
  district: string | null;
  logo_url: string | null;
  tagline: string | null;
  principal_name: string | null;
  principal_mobile: string | null;
}

export interface StudentRow {
  id: string;
  name: string;
  class_grade: string;
  gender: string | null;
  medium: string | null;
  teacher_id: string | null;
  quiz_completed: boolean;
  // Backend may return null when the student has no matches yet
  career_top2: Array<{ title: string; match_score: number; rank: number }> | null;
  ai_literacy_count: number;
  report_status: string | null;
}

export interface TeacherRow {
  id: string;
  name: string;
  email: string;
  student_count: number;
  // Backend may return null when no students are assigned yet
  classes: string[] | null;
  active: boolean;
}

export interface ClassBreakdown {
  class_grade: string;
  total: number;
  completed: number;
}

export interface DashboardStats {
  total_students: number;
  quiz_completed: number;
  ai_literacy_started: number;
  reports_generated: number;
}

export interface DashboardData {
  school: SchoolInfo;
  stats: DashboardStats;
  // All arrays may be null if the school has no data yet
  students: StudentRow[] | null;
  class_breakdown: ClassBreakdown[] | null;
  teachers: TeacherRow[] | null;
}

export interface CareerMatch {
  rank: number;
  match_score: number;
  careers: {
    id: string;
    title: string;
    description: string | null;
    salary_range: string | null;
    entry_path: string | null;
  } | null;
}

export interface Mark {
  subject: string;
  exam_term: string;
  marks: number;
  total_marks: number;
}

// Exact columns from ai_literacy_progress: student_id, level, completed
export interface LiteracyProgress {
  level: number;
  completed: boolean;
}

export interface StudentDetail {
  student: {
    id: string;
    name: string;
    class_grade: string;
    gender: string | null;
    medium: string | null;
    mobile: string | null;
    created_at: string;
  };
  marks: Mark[];
  career_matches: CareerMatch[];
  ai_literacy: LiteracyProgress[];
  // Exact columns from reports: student_id, pdf_url, status
  report: { status: string | null; pdf_url: string | null } | null;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchDashboard(): Promise<DashboardData> {
  return schoolGet("/api/school/dashboard") as Promise<DashboardData>;
}

export interface StudentsQuery {
  class_grade?: string;
  teacher_id?: string;
  search?: string;
  status?: string;
}

export async function fetchStudents(
  query: StudentsQuery = {}
): Promise<{ students: StudentRow[] }> {
  const params = new URLSearchParams();
  if (query.class_grade && query.class_grade !== "all")
    params.set("class_grade", query.class_grade);
  if (query.teacher_id) params.set("teacher_id", query.teacher_id);
  if (query.search) params.set("search", query.search);
  if (query.status && query.status !== "all") params.set("status", query.status);
  const qs = params.toString();
  return schoolGet(`/api/school/students${qs ? `?${qs}` : ""}`) as Promise<{
    students: StudentRow[];
  }>;
}

export async function fetchTeachers(): Promise<{ teachers: TeacherRow[] }> {
  return schoolGet("/api/school/teachers") as Promise<{ teachers: TeacherRow[] }>;
}

export async function fetchStudentDetail(id: string): Promise<StudentDetail> {
  return schoolGet(`/api/school/student/${id}`) as Promise<StudentDetail>;
}

export async function updateSchoolProfile(
  data: Partial<
    Pick<
      SchoolInfo,
      "name" | "name_hindi" | "tagline" | "district" | "principal_name" | "principal_mobile"
    >
  >
): Promise<{ school: SchoolInfo }> {
  return schoolPut("/api/school/profile", data) as Promise<{ school: SchoolInfo }>;
}

export async function uploadSchoolLogo(
  logo_base64: string
): Promise<{ logo_url: string }> {
  return schoolPost("/api/school/logo", { logo_base64 }) as Promise<{
    logo_url: string;
  }>;
}
