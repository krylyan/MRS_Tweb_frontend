const BASE_URL = "/api/auth";

export interface RegisterPayload {
  fullName: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  fullName: string;
}

export interface LoginPayload {
  username: string;
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

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body === "string") return body;
    if (body?.title) return body.title;
    if (body?.message) return body.message;
  } catch {
    return `Server error: ${response.status}`;
  }
  return `Server error: ${response.status}`;
}

export async function registerUser(
  payload: RegisterPayload
): Promise<ApiResult<RegisterResponse>> {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const message = await parseError(response);
      console.error("[AUTH] Register FAILED:", message);
      return { ok: false, message };
    }
    const data = (await response.json()) as RegisterResponse;
    console.log("[AUTH] Register SUCCESS:", data);
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    console.error("[AUTH] Register ERROR:", message);
    return { ok: false, message: `Cannot reach server: ${message}` };
  }
}

export async function loginUser(
  payload: LoginPayload
): Promise<ApiResult<LoginResponse>> {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const message = await parseError(response);
      console.error("[AUTH] Login FAILED:", message);
      return { ok: false, message };
    }
    const data = (await response.json()) as LoginResponse;
    console.log("[AUTH] Login SUCCESS:", {
      userId: data.userId,
      fullName: data.fullName,
      role: data.role,
      token: data.token,
      expiresAt: data.expiresAt,
    });
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    console.error("[AUTH] Login ERROR:", message);
    return { ok: false, message: `Cannot reach server: ${message}` };
  }
}

export const authService = {
  registerUser,
  loginUser,
};
