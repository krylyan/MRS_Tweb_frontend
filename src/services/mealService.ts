import apiClient from "../utils/apiClient";
import type { FoodItem, MealItemType } from "../types/meal";
import { normalizeMediaUrl } from "../utils/media";

export interface ApiFoodItem {
  id: number;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  grams: number;
  imageUrl: string;
  category: string;
  description: string;
  itemType: string;
  preparationSteps?: string | null;
}

const mapApiFoodItem = (f: ApiFoodItem): FoodItem => ({
  id: f.id,
  name: f.name,
  kcal: f.kcal,
  protein: f.protein,
  carbs: f.carbs,
  fats: f.fats,
  grams: f.grams,
  imageUrl: normalizeMediaUrl(f.imageUrl),
  category: f.category,
  description: f.description,
  itemType: (f.itemType === "Prepared" ? "Prepared" : "Simple") as MealItemType,
  preparationSteps: f.preparationSteps ?? null,
});

const getAllMeals = async (): Promise<FoodItem[]> => {
  const result = await apiClient.get<ApiFoodItem[]>("/fooditem");
  if (!result.ok) return [];
  return result.data.map(mapApiFoodItem);
};

const getMealsByCategory = async (category: string): Promise<FoodItem[]> => {
  const result = await apiClient.get<ApiFoodItem[]>(
    `/fooditem/category/${encodeURIComponent(category)}`,
  );
  if (!result.ok) return [];
  return result.data.map(mapApiFoodItem);
};

const searchMeals = async (query: string): Promise<FoodItem[]> => {
  const all = await getAllMeals();
  if (!query.trim()) return all;
  const q = query.trim().toLowerCase();
  return all.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q),
  );
};

const getFilterCategories = async (): Promise<string[]> => {
  const all = await getAllMeals();
  return Array.from(new Set(all.map((m) => m.category))).sort();
};

export interface FoodItemPayload {
  name: string;
  category: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  grams: number;
  imageUrl: string;
  description: string;
  itemType: string;
  preparationSteps?: string | null;
}

const createMeal = async (dto: FoodItemPayload): Promise<{ ok: boolean; message?: string }> => {
  const result = await apiClient.post<ApiFoodItem>("/fooditem", dto);
  if (result.ok) return { ok: true };
  return { ok: false, message: (result as { ok: false; message: string }).message };
};

const updateMeal = async (
  id: number,
  dto: FoodItemPayload,
): Promise<{ ok: boolean; message?: string }> => {
  const result = await apiClient.put<ApiFoodItem>(`/fooditem/${id}`, dto);
  if (result.ok) return { ok: true };
  return { ok: false, message: (result as { ok: false; message: string }).message };
};

const deleteMeal = async (id: number): Promise<{ ok: boolean; message?: string }> => {
  const result = await apiClient.delete<void>(`/fooditem/${id}`);
  if (result.ok) return { ok: true };
  return { ok: false, message: (result as { ok: false; message: string }).message };
};

export const mealService = {
  getAllMeals,
  getMealsByCategory,
  searchMeals,
  getFilterCategories,
  createMeal,
  updateMeal,
  deleteMeal,
};
