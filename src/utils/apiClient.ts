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

const GET_CACHE_TTL_MS = 30_000;

type CacheEntry = {
  expiresAt: number;
  result: ApiResult<unknown>;
};

const getCache = new Map<string, CacheEntry>();
const pendingGets = new Map<string, Promise<ApiResult<unknown>>>();

function getCacheKey(path: string) {
  const token = AuthUtils.getToken() ?? "";
  return `${token}:${path}`;
}

function clearGetCache() {
  getCache.clear();
  pendingGets.clear();
}

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
  const cacheKey = getCacheKey(path);
  const cached = getCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.result as ApiResult<T>;
  }

  const pending = pendingGets.get(cacheKey);
  if (pending) {
    return pending as Promise<ApiResult<T>>;
  }

  const request: Promise<ApiResult<T>> = (async () => {
    try {
      const response = await apiFetch(path, { method: "GET" });
      const result = await parseResponse<T>(response);

      if (result.ok) {
        getCache.set(cacheKey, {
          expiresAt: Date.now() + GET_CACHE_TTL_MS,
          result,
        });
      } else {
        getCache.delete(cacheKey);
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      return { ok: false as const, message: `Cannot reach server: ${message}`, status: 0 };
    } finally {
      pendingGets.delete(cacheKey);
    }
  })();

  pendingGets.set(cacheKey, request as Promise<ApiResult<unknown>>);
  return request;
}

async function post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const result = await parseResponse<T>(response);
    if (result.ok) clearGetCache();
    return result;
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
    const result = await parseResponse<T>(response);
    if (result.ok) clearGetCache();
    return result;
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
    const result = await parseResponse<T>(response);
    if (result.ok) clearGetCache();
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { ok: false, message: `Cannot reach server: ${message}`, status: 0 };
  }
}

async function del<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch(path, { method: "DELETE" });
    const result = await parseResponse<T>(response);
    if (result.ok) clearGetCache();
    return result;
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
