const TOKEN_KEY = "careerlens_token";

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url;

  // Dev fallback so registration works even before .env.local is loaded
  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }

  throw new Error(
    "VITE_API_URL is not set. Add it to frontend/.env.local or Vercel env vars."
  );
}

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
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}${path}`, {
      headers: authHeaders(),
    });
  } catch {
    throw {
      response: {
        data: {
          error: "Cannot reach the API server. Start the backend on port 8000.",
        },
        status: 0,
      },
    };
  }
  return handleResponse(res);
}

export async function apiPost(path: string, body: object): Promise<unknown> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiPut(path: string, body: object): Promise<unknown> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiDelete(path: string): Promise<unknown> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export { getToken, TOKEN_KEY };
