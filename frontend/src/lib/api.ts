const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "careerlens_token";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res: Response): Promise<unknown> {
  const hadToken = Boolean(getToken());
  let data: unknown;

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    if (hadToken) {
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    throw { response: { data, status: res.status } };
  }

  return data;
}

export async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function apiPost(path: string, body: object): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiPut(path: string, body: object): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiDelete(path: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export { getToken, TOKEN_KEY };
