import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

// ─── Tipuri ───────────────────────────────────────────────────────────────────

export interface UserProfileDto {
  weight?: number;
  height?: number;
  age?: number;
  streak?: number;
  avatarUrl?: string;
}

export interface UserResponseDto {
  id: number;
  fullName: string;
  username: string;
}

export interface UserUpdateDto {
  fullName: string;
  username: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getUserId(): number | null {
  return AuthUtils.getSession()?.userId ?? null;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const profileApi = {
  /**
   * GET /api/user/{userId}/profile
   * Citește profilul extins (greutate, înălțime, vârstă, streak) din DB.
   */
  async getProfile(): Promise<UserProfileDto | null> {
    const userId = getUserId();
    if (!userId) return null;
    const result = await apiClient.get<UserProfileDto>(`/user/${userId}/profile`);
    return result.ok ? result.data : null;
  },

  /**
   * PUT /api/user/{userId}/profile
   * Salvează profilul extins în DB.
   */
  async updateProfile(dto: UserProfileDto): Promise<UserProfileDto | null> {
    const userId = getUserId();
    if (!userId) return null;
    const result = await apiClient.put<UserProfileDto>(`/user/${userId}/profile`, dto);
    return result.ok ? result.data : null;
  },

  /**
   * PUT /api/user/me
   * Actualizează fullName și username-ul propriu.
   */
  async updateMe(dto: UserUpdateDto): Promise<UserResponseDto | null> {
    const result = await apiClient.put<UserResponseDto>("/user/me", dto);
    return result.ok ? result.data : null;
  },

  /**
   * GET /api/user/me
   * Citește datele proprii de cont.
   */
  async getMe(): Promise<UserResponseDto | null> {
    const result = await apiClient.get<UserResponseDto>("/user/me");
    return result.ok ? result.data : null;
  },
};
