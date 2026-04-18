import { FOOD_CATALOGUE } from "../data/meals";
import type { FoodItem, MealCategory } from "../types/meal";

const getAllMeals = (): FoodItem[] => FOOD_CATALOGUE;

const getMealsByCategory = (category: MealCategory): FoodItem[] =>
  FOOD_CATALOGUE.filter((meal) => meal.category === category);

const searchMeals = (query: string): FoodItem[] => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return FOOD_CATALOGUE;
  }

  return FOOD_CATALOGUE.filter((meal) => meal.name.toLowerCase().includes(normalized));
};

export const mealService = {
  getAllMeals,
  getMealsByCategory,
  searchMeals,
};
