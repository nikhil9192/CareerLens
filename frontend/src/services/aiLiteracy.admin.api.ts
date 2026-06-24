import type {
  AiLiteracyLevel,
  AiLiteracyContent,
  AiLiteracyQuizQuestion,
  AdminProgressRow,
  LevelInput,
  ContentInput,
  QuizQuestionInput,
} from "../types/aiLiteracy";

const ADMIN_SECRET_KEY = "careerlens_admin_secret";

export function getAdminSecret(): string | null {
  return localStorage.getItem(ADMIN_SECRET_KEY);
}

export function setAdminSecret(secret: string): void {
  localStorage.setItem(ADMIN_SECRET_KEY, secret);
}

export function clearAdminSecret(): void {
  localStorage.removeItem(ADMIN_SECRET_KEY);
}

/** Thrown when the admin secret is missing or rejected (HTTP 401). */
export class AdminUnauthorizedError extends Error {
  constructor(message = "Invalid admin secret") {
    super(message);
    this.name = "AdminUnauthorizedError";
  }
}

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url;
  if (import.meta.env.DEV) return "http://localhost:8000";
  throw new Error("VITE_API_URL is not set.");
}

async function adminFetch(
  path: string,
  options: { method?: string; body?: object } = {}
): Promise<unknown> {
  const secret = getAdminSecret();
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret ?? "",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the API server. Is the backend running?");
  }

  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (res.status === 401) {
    throw new AdminUnauthorizedError(
      (data as { error?: string })?.error ?? "Invalid admin secret"
    );
  }

  if (!res.ok) {
    const message =
      (data as { error?: string })?.error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

/** Validates the given secret by storing it and hitting a protected route. */
export async function verifyAdminSecret(secret: string): Promise<boolean> {
  setAdminSecret(secret);
  try {
    await adminFetch("/api/ai-literacy/admin/levels");
    return true;
  } catch (err) {
    clearAdminSecret();
    if (err instanceof AdminUnauthorizedError) return false;
    throw err;
  }
}

// ---- Levels ----
export async function adminListLevels(): Promise<AiLiteracyLevel[]> {
  const data = (await adminFetch("/api/ai-literacy/admin/levels")) as {
    levels: AiLiteracyLevel[];
  };
  return data.levels ?? [];
}

export async function adminCreateLevel(
  payload: LevelInput
): Promise<AiLiteracyLevel> {
  const data = (await adminFetch("/api/ai-literacy/admin/levels", {
    method: "POST",
    body: payload,
  })) as { level: AiLiteracyLevel };
  return data.level;
}

export async function adminUpdateLevel(
  id: string,
  payload: LevelInput
): Promise<AiLiteracyLevel> {
  const data = (await adminFetch(`/api/ai-literacy/admin/levels/${id}`, {
    method: "PUT",
    body: payload,
  })) as { level: AiLiteracyLevel };
  return data.level;
}

export async function adminDeleteLevel(id: string): Promise<void> {
  await adminFetch(`/api/ai-literacy/admin/levels/${id}`, { method: "DELETE" });
}

// ---- Content ----
export async function adminListLevelContent(
  levelId: string
): Promise<AiLiteracyContent[]> {
  const data = (await adminFetch(
    `/api/ai-literacy/admin/levels/${levelId}/content`
  )) as { content: AiLiteracyContent[] };
  return data.content ?? [];
}

export async function adminGetContent(contentId: string): Promise<{
  content: AiLiteracyContent;
  questions: AiLiteracyQuizQuestion[];
}> {
  const data = (await adminFetch(
    `/api/ai-literacy/admin/content/${contentId}`
  )) as { content: AiLiteracyContent; questions: AiLiteracyQuizQuestion[] };
  return { content: data.content, questions: data.questions ?? [] };
}

export async function adminCreateContent(
  payload: ContentInput
): Promise<AiLiteracyContent> {
  const data = (await adminFetch("/api/ai-literacy/admin/content", {
    method: "POST",
    body: payload,
  })) as { content: AiLiteracyContent };
  return data.content;
}

export async function adminUpdateContent(
  id: string,
  payload: ContentInput
): Promise<AiLiteracyContent> {
  const data = (await adminFetch(`/api/ai-literacy/admin/content/${id}`, {
    method: "PUT",
    body: payload,
  })) as { content: AiLiteracyContent };
  return data.content;
}

export async function adminDeleteContent(id: string): Promise<void> {
  await adminFetch(`/api/ai-literacy/admin/content/${id}`, { method: "DELETE" });
}

// ---- Quiz questions ----
export async function adminCreateQuizQuestion(
  payload: QuizQuestionInput
): Promise<AiLiteracyQuizQuestion> {
  const data = (await adminFetch("/api/ai-literacy/admin/quiz", {
    method: "POST",
    body: payload,
  })) as { question: AiLiteracyQuizQuestion };
  return data.question;
}

export async function adminUpdateQuizQuestion(
  id: string,
  payload: QuizQuestionInput
): Promise<AiLiteracyQuizQuestion> {
  const data = (await adminFetch(`/api/ai-literacy/admin/quiz/${id}`, {
    method: "PUT",
    body: payload,
  })) as { question: AiLiteracyQuizQuestion };
  return data.question;
}

export async function adminDeleteQuizQuestion(id: string): Promise<void> {
  await adminFetch(`/api/ai-literacy/admin/quiz/${id}`, { method: "DELETE" });
}

// ---- Progress ----
export async function adminListProgress(): Promise<AdminProgressRow[]> {
  const data = (await adminFetch("/api/ai-literacy/admin/progress")) as {
    progress: AdminProgressRow[];
  };
  return data.progress ?? [];
}
