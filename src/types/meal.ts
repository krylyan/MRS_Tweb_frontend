export type MealCategory = string;
export type MealItemType = "prepared" | "simple";

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
  itemType?: MealItemType;
  preparationSteps?: string[];
  recommended?: boolean;
  hidden?: boolean;
  priority?: number;
  popularity?: number;
}
