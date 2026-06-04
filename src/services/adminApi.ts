import apiClient from "../utils/apiClient";

export type UserRole = "Admin" | "User";

export interface AdminUser {
  id: number;
  fullName: string;
  username: string;
  role: UserRole;
  blocked: boolean;
}

export const adminApi = {
  async getAll(): Promise<AdminUser[]> {
    const result = await apiClient.get<AdminUser[]>("/user");
    return result.ok ? result.data : [];
  },

  async setRole(id: number, role: UserRole): Promise<AdminUser | null> {
    const result = await apiClient.put<AdminUser>(`/user/${id}/role`, { role });
    return result.ok ? result.data : null;
  },

  async toggleBlocked(id: number): Promise<AdminUser | null> {
    const result = await apiClient.put<AdminUser>(`/user/${id}/block`, {});
    return result.ok ? result.data : null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await apiClient.delete<void>(`/user/${id}`);
    return result.ok;
  },
};
