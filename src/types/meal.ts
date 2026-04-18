export type MealCategory =
  | "breakfast"
  | "protein"
  | "fruits"
  | "vegetables"
  | "carbs"
  | "healthy-fats"
  | "dairy";

export interface FoodItem {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  grams: number;
  imageUrl: string;
  category: MealCategory;
  description: string;
  preparationSteps?: string[];
}
