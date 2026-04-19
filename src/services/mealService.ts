import type { FoodItem, MealCategory } from "../types/meal";
import { mealLibrary, type MealSortMode } from "../utils/mealLibrary";

const getAllMeals = (): FoodItem[] => mealLibrary.getVisibleMeals();

const getMealsByCategory = (category: MealCategory): FoodItem[] =>
  mealLibrary.getVisibleMeals().filter((meal) => meal.category === category);

const searchMeals = (query: string): FoodItem[] => mealLibrary.searchMeals(query);

const getFilterCategories = (): string[] => mealLibrary.getFilterCategories();

const getMealsForSort = (sortMode: MealSortMode): FoodItem[] =>
  mealLibrary.getVisibleMeals(sortMode);

export const mealService = {
  getAllMeals,
  getMealsByCategory,
  searchMeals,
  getFilterCategories,
  getMealsForSort,
};
