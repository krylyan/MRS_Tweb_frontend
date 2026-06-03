import apiClient from "../utils/apiClient";

// ─── Tipuri ───────────────────────────────────────────────────────────────────

export type UserRole = "Admin" | "User";

export interface AdminUser {
  id: number;
  fullName: string;
  username: string;
  role: UserRole;
  blocked: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const adminApi = {
  /**
   * GET /api/user — toți userii (Admin only)
   */
  async getAll(): Promise<AdminUser[]> {
    const result = await apiClient.get<AdminUser[]>("/user");
    return result.ok ? result.data : [];
  },

  /**
   * PUT /api/user/{id}/role — schimbă rolul unui user
   */
  async setRole(id: number, role: UserRole): Promise<AdminUser | null> {
    const result = await apiClient.put<AdminUser>(`/user/${id}/role`, { role });
    return result.ok ? result.data : null;
  },

  /**
   * PUT /api/user/{id}/block — toggle blocare/deblocare
   */
  async toggleBlocked(id: number): Promise<AdminUser | null> {
    const result = await apiClient.put<AdminUser>(`/user/${id}/block`, {});
    return result.ok ? result.data : null;
  },

  /**
   * DELETE /api/user/{id} — șterge user
   */
  async delete(id: number): Promise<boolean> {
    const result = await apiClient.delete<void>(`/user/${id}`);
    return result.ok;
  },
};
