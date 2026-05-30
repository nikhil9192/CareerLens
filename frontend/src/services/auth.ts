const TOKEN_KEY = "careerlens_token";
const STUDENT_ID_KEY = "student_id";

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

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function logout(): void {
  clearAuthToken();
  localStorage.removeItem(STUDENT_ID_KEY);
}
