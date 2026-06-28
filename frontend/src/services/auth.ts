import { TOKEN_KEY } from "../lib/api";

// ─── Storage keys ────────────────────────────────────────────────────────────

const STUDENT_ID_KEY   = "student_id";
const STUDENT_NAME_KEY = "student_name";
const OWNER_NAME_KEY   = "owner_name";

// School owner token is kept SEPARATE from the student token so the two
// sessions never interfere with each other.
export const SCHOOL_TOKEN_KEY = "school_owner_token";

// ─── Student auth ────────────────────────────────────────────────────────────

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStudentId(): string | null {
  return localStorage.getItem(STUDENT_ID_KEY);
}

export function setStudentId(id: string): void {
  localStorage.setItem(STUDENT_ID_KEY, id);
}

export function getStudentName(): string | null {
  return localStorage.getItem(STUDENT_NAME_KEY);
}

export function setStudentName(name: string): void {
  localStorage.setItem(STUDENT_NAME_KEY, name);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function logout(): void {
  clearAuthToken();
  localStorage.removeItem(STUDENT_ID_KEY);
  localStorage.removeItem(STUDENT_NAME_KEY);
}

// ─── School owner token helpers ──────────────────────────────────────────────

export function getSchoolOwnerToken(): string | null {
  return localStorage.getItem(SCHOOL_TOKEN_KEY);
}

export function setSchoolOwnerToken(token: string): void {
  localStorage.setItem(SCHOOL_TOKEN_KEY, token);
}

export function clearSchoolOwnerToken(): void {
  localStorage.removeItem(SCHOOL_TOKEN_KEY);
}

export function schoolOwnerLogout(): void {
  clearSchoolOwnerToken();
  localStorage.removeItem(OWNER_NAME_KEY);
}

// ─── JWT decode helpers ──────────────────────────────────────────────────────

interface JwtPayload {
  userId?: string;
  role?: string;
  school_id?: string;
  exp?: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Convert base64url → base64 and add required padding
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

// Decode the school owner token (reads from school_owner_token key)
function decodeSchoolToken(): JwtPayload | null {
  const token = localStorage.getItem(SCHOOL_TOKEN_KEY);
  if (!token) return null;
  return decodeJwt(token);
}

export function isSchoolOwner(): boolean {
  return decodeSchoolToken()?.role === "school_owner";
}

export function getSchoolId(): string | null {
  return decodeSchoolToken()?.school_id ?? null;
}

// ─── Owner name helpers ──────────────────────────────────────────────────────

export function setOwnerName(name: string): void {
  localStorage.setItem(OWNER_NAME_KEY, name);
}

export function getOwnerName(): string | null {
  return localStorage.getItem(OWNER_NAME_KEY);
}
