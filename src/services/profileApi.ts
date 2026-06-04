import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

export interface UserProfileDto {
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  bmi?: number;
  bmr?: number;
  tdee?: number;
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

function getUserId(): number | null {
  return AuthUtils.getSession()?.userId ?? null;
}

export const profileApi = {
  async getProfile(): Promise<UserProfileDto | null> {
    const userId = getUserId();
    if (!userId) return null;
    const result = await apiClient.get<UserProfileDto>(`/user/${userId}/profile`);
    return result.ok ? result.data : null;
  },

  async updateProfile(dto: UserProfileDto): Promise<UserProfileDto | null> {
    const userId = getUserId();
    if (!userId) return null;
    const result = await apiClient.put<UserProfileDto>(`/user/${userId}/profile`, dto);
    return result.ok ? result.data : null;
  },

  async updateMe(dto: UserUpdateDto): Promise<UserResponseDto | null> {
    const result = await apiClient.put<UserResponseDto>("/user/me", dto);
    return result.ok ? result.data : null;
  },

  async getMe(): Promise<UserResponseDto | null> {
    const result = await apiClient.get<UserResponseDto>("/user/me");
    return result.ok ? result.data : null;
  },
};
