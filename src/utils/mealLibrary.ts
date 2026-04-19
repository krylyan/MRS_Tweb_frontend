import { FOOD_CATALOGUE } from "../data/meals";
import type { FoodItem, MealCategory, MealItemType } from "../types/meal";

const MEAL_LIBRARY_KEY = "fitlife_meal_library";

interface MealLibraryState {
  customMeals: FoodItem[];
  updatedMeals: Record<string, FoodItem>;
  deletedMealIds: string[];
  categories: string[];
}

interface MealOperationResult {
  ok: boolean;
  message?: string;
}

interface MealInput {
  name: string;
  category: MealCategory;
  kcal: number;
  protein: number;
  fats: number;
  carbs: number;
  grams: number;
  imageUrl: string;
  description: string;
  itemType: MealItemType;
  preparationSteps: string[];
  priority: number;
  popularity: number;
}

export type MealSortMode = "priority" | "popularity" | "category";

const DEFAULT_CATEGORY_SET = Array.from(
  new Set(FOOD_CATALOGUE.map((meal) => meal.category.trim().toLowerCase())),
).sort((left, right) => left.localeCompare(right));

const normalizeCategory = (value: string): string => value.trim().toLowerCase();

const parseNumber = (value: number | undefined, fallback = 0): number =>
  Number.isFinite(value) ? Number(value) : fallback;

const sanitizeMeal = (meal: FoodItem): FoodItem => {
  const itemType: MealItemType =
    meal.itemType ?? (meal.preparationSteps?.length ? "prepared" : "simple");

  return {
    id: meal.id,
    name: meal.name.trim(),
    kcal: parseNumber(meal.kcal),
    protein: parseNumber(meal.protein),
    carbs: parseNumber(meal.carbs),
    fats: parseNumber(meal.fats),
    grams: parseNumber(meal.grams),
    imageUrl: meal.imageUrl.trim(),
    category: normalizeCategory(meal.category),
    description: meal.description.trim(),
    itemType,
    preparationSteps:
      itemType === "prepared"
        ? (meal.preparationSteps ?? []).map((step) => step.trim()).filter(Boolean)
        : [],
    recommended: meal.recommended === true,
    hidden: meal.hidden === true,
    priority: parseNumber(meal.priority),
    popularity: parseNumber(meal.popularity),
  };
};

const defaultState = (): MealLibraryState => ({
  customMeals: [],
  updatedMeals: {},
  deletedMealIds: [],
  categories: [...DEFAULT_CATEGORY_SET],
});

const readState = (): MealLibraryState => {
  const raw = localStorage.getItem(MEAL_LIBRARY_KEY);

  if (!raw) {
    return defaultState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MealLibraryState>;

    return {
      customMeals: Array.isArray(parsed.customMeals)
        ? parsed.customMeals.map((meal) => sanitizeMeal(meal))
        : [],
      updatedMeals: Object.fromEntries(
        Object.entries(parsed.updatedMeals ?? {}).map(([id, meal]) => [
          id,
          sanitizeMeal(meal as FoodItem),
        ]),
      ),
      deletedMealIds: Array.isArray(parsed.deletedMealIds)
        ? parsed.deletedMealIds.filter((value): value is string => typeof value === "string")
        : [],
      categories: Array.isArray(parsed.categories)
        ? parsed.categories
            .filter((value): value is string => typeof value === "string")
            .map((value) => normalizeCategory(value))
        : [...DEFAULT_CATEGORY_SET],
    };
  } catch {
    return defaultState();
  }
};

const writeState = (state: MealLibraryState): void => {
  localStorage.setItem(MEAL_LIBRARY_KEY, JSON.stringify(state));
};

const getBaseMealById = (id: string): FoodItem | undefined =>
  FOOD_CATALOGUE.find((meal) => meal.id === id);

const sortMeals = (meals: FoodItem[], sortMode: MealSortMode = "priority"): FoodItem[] =>
  [...meals].sort((left, right) => {
    if (sortMode === "popularity") {
      return (right.popularity ?? 0) - (left.popularity ?? 0) || left.name.localeCompare(right.name);
    }

    if (sortMode === "category") {
      return left.category.localeCompare(right.category) || left.name.localeCompare(right.name);
    }

    return (right.priority ?? 0) - (left.priority ?? 0) || left.name.localeCompare(right.name);
  });

const getMergedMeals = (): FoodItem[] => {
  const state = readState();
  const deletedIds = new Set(state.deletedMealIds);

  const baseMeals = FOOD_CATALOGUE
    .filter((meal) => !deletedIds.has(meal.id))
    .map((meal) => sanitizeMeal(state.updatedMeals[meal.id] ?? meal));

  const customMeals = state.customMeals.map((meal) => sanitizeMeal(meal));

  return [...baseMeals, ...customMeals];
};

const getAllCategories = (): string[] => {
  const state = readState();
  const usedCategories = getMergedMeals().map((meal) => normalizeCategory(meal.category));

  return Array.from(new Set([...state.categories, ...usedCategories])).sort((left, right) =>
    left.localeCompare(right),
  );
};

const normalizeMealInput = (input: MealInput): MealInput => ({
  name: input.name.trim(),
  category: normalizeCategory(input.category),
  kcal: parseNumber(input.kcal),
  protein: parseNumber(input.protein),
  fats: parseNumber(input.fats),
  carbs: parseNumber(input.carbs),
  grams: parseNumber(input.grams),
  imageUrl: input.imageUrl.trim(),
  description: input.description.trim(),
  itemType: input.itemType,
  preparationSteps:
    input.itemType === "prepared"
      ? input.preparationSteps.map((step) => step.trim()).filter(Boolean)
      : [],
  priority: parseNumber(input.priority),
  popularity: parseNumber(input.popularity),
});

const persistCategoryIfMissing = (category: string): void => {
  const normalizedCategory = normalizeCategory(category);

  if (!normalizedCategory) {
    return;
  }

  const state = readState();

  if (state.categories.includes(normalizedCategory)) {
    return;
  }

  state.categories = [...state.categories, normalizedCategory].sort((left, right) =>
    left.localeCompare(right),
  );
  writeState(state);
};

const generateMealId = (name: string): string => {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `custom-meal-${slug || "item"}-${Date.now()}`;
};

const validateMealInput = (input: MealInput): MealOperationResult => {
  if (!input.name || !input.category || !input.description) {
    return { ok: false, message: "Name, category, and description are required." };
  }

  if (!input.imageUrl) {
    return { ok: false, message: "Image URL is required." };
  }

  if (input.kcal < 0 || input.protein < 0 || input.fats < 0 || input.carbs < 0 || input.grams <= 0) {
    return { ok: false, message: "Nutrition values must be valid positive numbers." };
  }

  if (input.itemType === "prepared" && input.preparationSteps.length === 0) {
    return { ok: false, message: "Prepared meals need at least one preparation step." };
  }

  return { ok: true };
};

export const mealLibrary = {
  getVisibleMeals: (sortMode: MealSortMode = "priority"): FoodItem[] =>
    sortMeals(getMergedMeals().filter((meal) => meal.hidden !== true), sortMode),

  getAllMealsForAdmin: (sortMode: MealSortMode = "priority"): FoodItem[] =>
    sortMeals(getMergedMeals(), sortMode),

  getFilterCategories: (): string[] => getAllCategories(),

  searchMeals: (query: string, sortMode: MealSortMode = "priority"): FoodItem[] => {
    const normalized = query.trim().toLowerCase();
    const visibleMeals = mealLibrary.getVisibleMeals(sortMode);

    if (!normalized) {
      return visibleMeals;
    }

    return visibleMeals.filter(
      (meal) =>
        meal.name.toLowerCase().includes(normalized) ||
        meal.description.toLowerCase().includes(normalized),
    );
  },

  createMeal: (input: MealInput): MealOperationResult => {
    const normalized = normalizeMealInput(input);
    const validation = validateMealInput(normalized);

    if (!validation.ok) {
      return validation;
    }

    const exists = getMergedMeals().some(
      (meal) => meal.name.toLowerCase() === normalized.name.toLowerCase(),
    );

    if (exists) {
      return { ok: false, message: "A meal with this name already exists." };
    }

    const state = readState();
    state.customMeals = [
      ...state.customMeals,
      {
        id: generateMealId(normalized.name),
        ...normalized,
        recommended: false,
        hidden: false,
      },
    ];
    writeState(state);
    persistCategoryIfMissing(normalized.category);
    return { ok: true };
  },

  updateMeal: (id: string, input: MealInput): MealOperationResult => {
    const normalized = normalizeMealInput(input);
    const validation = validateMealInput(normalized);

    if (!validation.ok) {
      return validation;
    }

    const state = readState();
    const customIndex = state.customMeals.findIndex((meal) => meal.id === id);

    if (customIndex >= 0) {
      state.customMeals[customIndex] = {
        ...state.customMeals[customIndex],
        ...normalized,
      };
      writeState(state);
      persistCategoryIfMissing(normalized.category);
      return { ok: true };
    }

    const baseMeal = getBaseMealById(id);

    if (!baseMeal) {
      return { ok: false, message: "Meal not found." };
    }

    const currentMeal = state.updatedMeals[id] ?? sanitizeMeal(baseMeal);
    state.updatedMeals[id] = {
      ...currentMeal,
      ...normalized,
    };
    writeState(state);
    persistCategoryIfMissing(normalized.category);
    return { ok: true };
  },

  deleteMeal: (id: string): MealOperationResult => {
    const state = readState();
    const customIndex = state.customMeals.findIndex((meal) => meal.id === id);

    if (customIndex >= 0) {
      state.customMeals.splice(customIndex, 1);
      writeState(state);
      return { ok: true };
    }

    if (!getBaseMealById(id)) {
      return { ok: false, message: "Meal not found." };
    }

    if (!state.deletedMealIds.includes(id)) {
      state.deletedMealIds = [...state.deletedMealIds, id];
    }

    delete state.updatedMeals[id];
    writeState(state);
    return { ok: true };
  },

  toggleRecommended: (id: string): MealOperationResult => {
    const state = readState();
    const customIndex = state.customMeals.findIndex((meal) => meal.id === id);

    if (customIndex >= 0) {
      const currentMeal = state.customMeals[customIndex];
      state.customMeals[customIndex] = { ...currentMeal, recommended: !(currentMeal.recommended === true) };
      writeState(state);
      return { ok: true };
    }

    const baseMeal = getBaseMealById(id);

    if (!baseMeal) {
      return { ok: false, message: "Meal not found." };
    }

    const currentMeal = state.updatedMeals[id] ?? sanitizeMeal(baseMeal);
    state.updatedMeals[id] = { ...currentMeal, recommended: !(currentMeal.recommended === true) };
    writeState(state);
    return { ok: true };
  },

  toggleHidden: (id: string): MealOperationResult => {
    const state = readState();
    const customIndex = state.customMeals.findIndex((meal) => meal.id === id);

    if (customIndex >= 0) {
      const currentMeal = state.customMeals[customIndex];
      state.customMeals[customIndex] = { ...currentMeal, hidden: !(currentMeal.hidden === true) };
      writeState(state);
      return { ok: true };
    }

    const baseMeal = getBaseMealById(id);

    if (!baseMeal) {
      return { ok: false, message: "Meal not found." };
    }

    const currentMeal = state.updatedMeals[id] ?? sanitizeMeal(baseMeal);
    state.updatedMeals[id] = { ...currentMeal, hidden: !(currentMeal.hidden === true) };
    writeState(state);
    return { ok: true };
  },

  addCategory: (category: string): MealOperationResult => {
    const normalizedCategory = normalizeCategory(category);

    if (!normalizedCategory) {
      return { ok: false, message: "Category name is required." };
    }

    if (getAllCategories().includes(normalizedCategory)) {
      return { ok: false, message: "This category already exists." };
    }

    const state = readState();
    state.categories = [...state.categories, normalizedCategory].sort((left, right) =>
      left.localeCompare(right),
    );
    writeState(state);
    return { ok: true };
  },

  removeCategory: (category: string): MealOperationResult => {
    const normalizedCategory = normalizeCategory(category);
    const mealsUsingCategory = getMergedMeals().some((meal) => meal.category === normalizedCategory);

    if (mealsUsingCategory) {
      return { ok: false, message: "Reassign meals from this category before deleting it." };
    }

    const state = readState();
    state.categories = state.categories.filter((value) => value !== normalizedCategory);
    writeState(state);
    return { ok: true };
  },
};
