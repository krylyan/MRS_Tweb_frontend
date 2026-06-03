import AuthUtils from "./authUtils";

// Baza URL — toate requesturile merg prin proxy-ul Vite la http://localhost:5227
const API_BASE = "/api";

// ─── Tipuri ───────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  ok: true;
  data: T;
  status: number;
}

export interface ApiError {
  ok: false;
  message: string;
  status: number;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// ─── Core fetch cu JWT automat ────────────────────────────────────────────────
async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = AuthUtils.getToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}

// ─── Parser răspuns ───────────────────────────────────────────────────────────
async function parseResponse<T>(response: Response): Promise<ApiResult<T>> {
  const status = response.status;

  if (response.status === 204) {
    // No Content — succes fără body
    return { ok: true, data: undefined as T, status };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    // 401 — token expirat sau invalid: logout + redirect automat la login
    if (status === 401) {
      AuthUtils.logout();
      window.location.href = "/signin";
      return { ok: false, message: "Session expired. Please sign in again.", status };
    }

    let message = `Server error ${status}`;
    if (typeof body === "string") message = body;
    else if (body && typeof body === "object") {
      const b = body as Record<string, unknown>;
      if (typeof b["title"] === "string") message = b["title"];
      else if (typeof b["message"] === "string") message = b["message"];
    }
    return { ok: false, message, status };
  }

  return { ok: true, data: body as T, status };
}

// ─── Metode HTTP convenabile ──────────────────────────────────────────────────
async function get<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch(path, { method: "GET" });
    return parseResponse<T>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { ok: false, message: `Cannot reach server: ${message}`, status: 0 };
  }
}

async function post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return parseResponse<T>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { ok: false, message: `Cannot reach server: ${message}`, status: 0 };
  }
}

async function postForm<T>(path: string, body: FormData): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch(path, {
      method: "POST",
      body,
    });
    return parseResponse<T>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { ok: false, message: `Cannot reach server: ${message}`, status: 0 };
  }
}

async function put<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return parseResponse<T>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { ok: false, message: `Cannot reach server: ${message}`, status: 0 };
  }
}

async function del<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch(path, { method: "DELETE" });
    return parseResponse<T>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { ok: false, message: `Cannot reach server: ${message}`, status: 0 };
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
export const apiClient = {
  get,
  post,
  postForm,
  put,
  delete: del,
};

export default apiClient;
