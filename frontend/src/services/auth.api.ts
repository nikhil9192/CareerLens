import api from "./api";

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
  const { data } = await api.post<RegisterResponse>(
    "/api/auth/register",
    payload
  );
  return data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", payload);
  return data;
}
