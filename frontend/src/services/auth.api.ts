import { apiGet, apiPost } from "../lib/api";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  mobile: string;
  school_id: string;
  class_grade: number;
  gender: string;
  medium: string;
}

export interface RegisterResponse {
  token: string;
  student: {
    id: string;
    name: string;
    email: string;
    class_grade: string;
    school_id: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  student: {
    id: string;
    name: string;
    email: string;
    class_grade: string;
    school_id: string;
  };
}

export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  return apiPost("/api/auth/register", payload) as Promise<RegisterResponse>;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiPost("/api/auth/login", payload) as Promise<LoginResponse>;
}

export async function fetchMe() {
  return apiGet("/api/auth/me");
}
