import type { FoodItem } from "../types/meal";
import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

export type MealSlotApi = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

export interface MealPlanItemApi {
  id: number;
  foodItemId: number;
  order: number;
  quantityGrams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  foodItem: FoodItem;
}

export interface MealCategoryApi {
  id: number;
  slot: MealSlotApi;
  order: number;
  items: MealPlanItemApi[];
}

export interface MealPlanDayApi {
  id: number;
  label: string;
  dayNumber: number;
  categories: MealCategoryApi[];
}

export interface MealPlanApi {
  id: number;
  userId: number;
  name: string;
  updatedAt: string;
  meals: number;
  days: MealPlanDayApi[];
}

export interface MealPlanCreateDayBody {
  label: string;
  dayNumber: number;
  categories: {
    slot: MealSlotApi;
    order: number;
    items: {
      foodItemId: number;
      order: number;
      quantityGrams: number;
    }[];
  }[];
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

  async create(name: string, meals: number, days: MealPlanCreateDayBody[] = []): Promise<MealPlanApi | null> {
    const session = AuthUtils.getSession();
    if (!session) return null;
    const result = await apiClient.post<MealPlanApi>(`/mealplan/user/${session.userId}`, { name, meals, days });
    return result.ok ? result.data : null;
  },

  async update(id: number, name: string, meals: number, days: MealPlanCreateDayBody[]): Promise<MealPlanApi | null> {
    const result = await apiClient.put<MealPlanApi>(`/mealplan/${id}`, { name, meals, days });
    return result.ok ? result.data : null;
  },

  async updateItemQuantity(itemId: number, quantityGrams: number): Promise<MealPlanItemApi | null> {
    const result = await apiClient.put<MealPlanItemApi>(`/mealplan/item/${itemId}/quantity`, { quantityGrams });
    return result.ok ? result.data : null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await apiClient.delete<void>(`/mealplan/${id}`);
    return result.ok;
  },
};
