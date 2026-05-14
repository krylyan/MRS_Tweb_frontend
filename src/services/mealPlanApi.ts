import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

export interface MealPlanApi {
  id: number;
  name: string;
  updatedAt: string;
  meals: number;
}

export const mealPlanApi = {
  async getMyPlans(): Promise<MealPlanApi[]> {
    const session = AuthUtils.getSession();
    if (!session) return [];
    const result = await apiClient.get<MealPlanApi[]>(`/mealplan/user/${session.userId}`);
    return result.ok ? result.data : [];
  },

  async getById(id: number): Promise<MealPlanApi | null> {
    const result = await apiClient.get<MealPlanApi>(`/mealplan/${id}`);
    return result.ok ? result.data : null;
  },

  async create(name: string, meals: number): Promise<MealPlanApi | null> {
    const session = AuthUtils.getSession();
    if (!session) return null;
    const result = await apiClient.post<MealPlanApi>(`/mealplan/user/${session.userId}`, { name, meals });
    return result.ok ? result.data : null;
  },

  async update(id: number, name: string, meals: number): Promise<boolean> {
    const result = await apiClient.put<MealPlanApi>(`/mealplan/${id}`, { name, meals });
    return result.ok;
  },

  async delete(id: number): Promise<boolean> {
    const result = await apiClient.delete<void>(`/mealplan/${id}`);
    return result.ok;
  },
};
