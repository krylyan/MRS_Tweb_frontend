import { exercises as defaultExercises } from "../data/exercises";
import type { Exercise, MuscleGroup } from "../types/exercise";

const EXERCISE_LIBRARY_KEY = "fitlife_exercise_library";

interface ExerciseLibraryState {
  customExercises: Exercise[];
  updatedExercises: Record<string, Exercise>;
  deletedExerciseIds: string[];
  categories: string[];
}

interface ExerciseOperationResult {
  ok: boolean;
  message?: string;
}

interface ExerciseInput {
  name: string;
  muscleGroup: MuscleGroup;
  gifUrl: string;
  instructions: string;
}

const normalizeCategory = (value: string): string => value.trim().toLowerCase();

const sanitizeExercise = (exercise: Exercise): Exercise => ({
  id: exercise.id,
  name: exercise.name.trim(),
  muscleGroup: normalizeCategory(exercise.muscleGroup),
  gifUrl: exercise.gifUrl.trim(),
  instructions: exercise.instructions.trim(),
  recommended: exercise.recommended === true,
  hidden: exercise.hidden === true,
});

const DEFAULT_CATEGORY_SET = Array.from(
  new Set(defaultExercises.map((exercise) => normalizeCategory(exercise.muscleGroup))),
).sort((left, right) => left.localeCompare(right));

const defaultState = (): ExerciseLibraryState => ({
  customExercises: [],
  updatedExercises: {},
  deletedExerciseIds: [],
  categories: [...DEFAULT_CATEGORY_SET],
});

const readState = (): ExerciseLibraryState => {
  const raw = localStorage.getItem(EXERCISE_LIBRARY_KEY);

  if (!raw) {
    return defaultState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ExerciseLibraryState>;
    return {
      customExercises: Array.isArray(parsed.customExercises)
        ? parsed.customExercises.map((exercise) => sanitizeExercise(exercise))
        : [],
      updatedExercises: Object.fromEntries(
        Object.entries(parsed.updatedExercises ?? {}).map(([id, exercise]) => [
          id,
          sanitizeExercise(exercise as Exercise),
        ]),
      ),
      deletedExerciseIds: Array.isArray(parsed.deletedExerciseIds)
        ? parsed.deletedExerciseIds.filter((value): value is string => typeof value === "string")
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

const writeState = (state: ExerciseLibraryState): void => {
  localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify(state));
};

const getBaseExerciseById = (id: string): Exercise | undefined =>
  defaultExercises.find((exercise) => exercise.id === id);

const getMergedExercises = (): Exercise[] => {
  const state = readState();
  const deletedIds = new Set(state.deletedExerciseIds);

  const mergedBaseExercises = defaultExercises
    .filter((exercise) => !deletedIds.has(exercise.id))
    .map((exercise) => sanitizeExercise(state.updatedExercises[exercise.id] ?? exercise));

  const mergedCustomExercises = state.customExercises.map((exercise) => sanitizeExercise(exercise));

  return [...mergedBaseExercises, ...mergedCustomExercises].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
};

const getVisibleExercises = (): Exercise[] =>
  getMergedExercises().filter((exercise) => exercise.hidden !== true);

const getAllCategories = (): string[] => {
  const state = readState();
  const usedCategories = getMergedExercises().map((exercise) => normalizeCategory(exercise.muscleGroup));

  return Array.from(new Set([...state.categories, ...usedCategories])).sort(
    (left, right) => left.localeCompare(right),
  );
};

const normalizeExerciseInput = (input: ExerciseInput): ExerciseInput => ({
  name: input.name.trim(),
  muscleGroup: normalizeCategory(input.muscleGroup),
  gifUrl: input.gifUrl.trim(),
  instructions: input.instructions.trim(),
});

const persistCategoryIfMissing = (category: string): void => {
  const state = readState();
  const normalizedCategory = normalizeCategory(category);

  if (!normalizedCategory || state.categories.includes(normalizedCategory)) {
    return;
  }

  state.categories = [...state.categories, normalizedCategory].sort((left, right) =>
    left.localeCompare(right),
  );
  writeState(state);
};

const generateExerciseId = (name: string): string => {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `custom-${slug || "exercise"}-${Date.now()}`;
};

export const exerciseLibrary = {
  getVisibleExercises,

  getAllExercisesForAdmin: (): Exercise[] => getMergedExercises(),

  getFilterCategories: (): string[] => getAllCategories(),

  searchExercises: (query: string): Exercise[] => {
    const normalized = query.trim().toLowerCase();
    const visibleExercises = getVisibleExercises();

    if (!normalized) {
      return visibleExercises;
    }

    return visibleExercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(normalized) ||
        exercise.instructions.toLowerCase().includes(normalized),
    );
  },

  createExercise: (input: ExerciseInput): ExerciseOperationResult => {
    const normalized = normalizeExerciseInput(input);

    if (!normalized.name || !normalized.muscleGroup || !normalized.gifUrl || !normalized.instructions) {
      return { ok: false, message: "All fields are required to create an exercise." };
    }

    const state = readState();
    const exists = getMergedExercises().some(
      (exercise) => exercise.name.toLowerCase() === normalized.name.toLowerCase(),
    );

    if (exists) {
      return { ok: false, message: "An exercise with this name already exists." };
    }

    state.customExercises = [
      ...state.customExercises,
      {
        id: generateExerciseId(normalized.name),
        name: normalized.name,
        muscleGroup: normalized.muscleGroup,
        gifUrl: normalized.gifUrl,
        instructions: normalized.instructions,
        recommended: false,
        hidden: false,
      },
    ];
    writeState(state);
    persistCategoryIfMissing(normalized.muscleGroup);
    return { ok: true };
  },

  updateExercise: (id: string, input: ExerciseInput): ExerciseOperationResult => {
    const normalized = normalizeExerciseInput(input);

    if (!normalized.name || !normalized.muscleGroup || !normalized.gifUrl || !normalized.instructions) {
      return { ok: false, message: "All fields are required to update an exercise." };
    }

    const state = readState();
    const customIndex = state.customExercises.findIndex((exercise) => exercise.id === id);

    if (customIndex >= 0) {
      const currentExercise = state.customExercises[customIndex];
      state.customExercises[customIndex] = {
        ...currentExercise,
        ...normalized,
      };
      writeState(state);
      persistCategoryIfMissing(normalized.muscleGroup);
      return { ok: true };
    }

    const baseExercise = getBaseExerciseById(id);

    if (!baseExercise) {
      return { ok: false, message: "Exercise not found." };
    }

    const currentExercise = state.updatedExercises[id] ?? sanitizeExercise(baseExercise);
    state.updatedExercises[id] = {
      ...currentExercise,
      ...normalized,
    };
    writeState(state);
    persistCategoryIfMissing(normalized.muscleGroup);
    return { ok: true };
  },

  deleteExercise: (id: string): ExerciseOperationResult => {
    const state = readState();
    const customIndex = state.customExercises.findIndex((exercise) => exercise.id === id);

    if (customIndex >= 0) {
      state.customExercises.splice(customIndex, 1);
      writeState(state);
      return { ok: true };
    }

    const baseExercise = getBaseExerciseById(id);

    if (!baseExercise) {
      return { ok: false, message: "Exercise not found." };
    }

    if (!state.deletedExerciseIds.includes(id)) {
      state.deletedExerciseIds = [...state.deletedExerciseIds, id];
    }

    delete state.updatedExercises[id];
    writeState(state);
    return { ok: true };
  },

  toggleRecommended: (id: string): ExerciseOperationResult => {
    const state = readState();
    const customIndex = state.customExercises.findIndex((exercise) => exercise.id === id);

    if (customIndex >= 0) {
      const currentExercise = state.customExercises[customIndex];
      state.customExercises[customIndex] = {
        ...currentExercise,
        recommended: !(currentExercise.recommended === true),
      };
      writeState(state);
      return { ok: true };
    }

    const baseExercise = getBaseExerciseById(id);

    if (!baseExercise) {
      return { ok: false, message: "Exercise not found." };
    }

    const currentExercise = state.updatedExercises[id] ?? sanitizeExercise(baseExercise);
    state.updatedExercises[id] = {
      ...currentExercise,
      recommended: !(currentExercise.recommended === true),
    };
    writeState(state);
    return { ok: true };
  },

  toggleHidden: (id: string): ExerciseOperationResult => {
    const state = readState();
    const customIndex = state.customExercises.findIndex((exercise) => exercise.id === id);

    if (customIndex >= 0) {
      const currentExercise = state.customExercises[customIndex];
      state.customExercises[customIndex] = {
        ...currentExercise,
        hidden: !(currentExercise.hidden === true),
      };
      writeState(state);
      return { ok: true };
    }

    const baseExercise = getBaseExerciseById(id);

    if (!baseExercise) {
      return { ok: false, message: "Exercise not found." };
    }

    const currentExercise = state.updatedExercises[id] ?? sanitizeExercise(baseExercise);
    state.updatedExercises[id] = {
      ...currentExercise,
      hidden: !(currentExercise.hidden === true),
    };
    writeState(state);
    return { ok: true };
  },

  addCategory: (category: string): ExerciseOperationResult => {
    const normalizedCategory = normalizeCategory(category);

    if (!normalizedCategory) {
      return { ok: false, message: "Category name is required." };
    }

    const state = readState();

    if (getAllCategories().includes(normalizedCategory)) {
      return { ok: false, message: "This category already exists." };
    }

    state.categories = [...state.categories, normalizedCategory].sort((left, right) =>
      left.localeCompare(right),
    );
    writeState(state);
    return { ok: true };
  },

  removeCategory: (category: string): ExerciseOperationResult => {
    const normalizedCategory = normalizeCategory(category);
    const exercisesUsingCategory = getMergedExercises().some(
      (exercise) => normalizeCategory(exercise.muscleGroup) === normalizedCategory,
    );

    if (exercisesUsingCategory) {
      return { ok: false, message: "Reassign exercises from this category before deleting it." };
    }

    const state = readState();
    state.categories = state.categories.filter((value) => value !== normalizedCategory);
    writeState(state);
    return { ok: true };
  },
};
