export type MealCategory = string;
export type MealItemType = "Simple" | "Prepared";

export interface FoodItem {
  id: number;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  grams: number;
  imageUrl: string;
  category: MealCategory;
  description: string;
  itemType: MealItemType;
  preparationSteps?: string | null;
}
