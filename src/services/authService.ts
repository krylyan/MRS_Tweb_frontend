// Toate requesturile merg la /api/... — Vite proxy le redirecteaza la http://localhost:5227
const BASE_URL = "/api/auth";

export interface RegisterPayload {
  fullName: string;
  username: string;   // email
  password: string;
}

export interface RegisterResponse {
  id: number;
  fullName: string;
}

export interface LoginPayload {
  username: string;   // email
  password: string;
}

export interface LoginResponse {
  userId: number;
  fullName: string;
  role: string;
  token: string;
  expiresAt: string;
}

export interface ApiError {
  ok: false;
  message: string;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

type ApiResult<T> = ApiSuccess<T> | ApiError;

// ─── helper intern ────────────────────────────────────────────────────────────
async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body === "string") return body;
    if (body?.title) return body.title;
    if (body?.message) return body.message;
  } catch { /* raspuns non-JSON */ }
  return `Server error: ${response.status}`;
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export async function registerUser(
  payload: RegisterPayload
): Promise<ApiResult<RegisterResponse>> {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { ok: false, message: await parseError(response) };
    const data = (await response.json()) as RegisterResponse;
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { ok: false, message: `Cannot reach server: ${message}` };
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export async function loginUser(
  payload: LoginPayload
): Promise<ApiResult<LoginResponse>> {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { ok: false, message: await parseError(response) };
    const data = (await response.json()) as LoginResponse;
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { ok: false, message: `Cannot reach server: ${message}` };
  }
}

export const authService = {
  registerUser,
  loginUser,
};

