export type PlanCompletionType = "workout" | "meal";

export interface DayPlanCompletion {
  workoutPlanIds: string[];
  mealPlanIds: string[];
  workoutDayIds: string[];
  mealDayIds: string[];
}

export type PlanCompletions = Record<string, DayPlanCompletion>;

const COMPLETIONS_KEY = "fitlife_plan_completions";

const emptyDayCompletion = (): DayPlanCompletion => ({
  workoutPlanIds: [],
  mealPlanIds: [],
  workoutDayIds: [],
  mealDayIds: [],
});

const padDatePart = (value: number): string => String(value).padStart(2, "0");

export const getDateKey = (value: Date | string | null = new Date()): string => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

  return [
    safeDate.getFullYear(),
    padDatePart(safeDate.getMonth() + 1),
    padDatePart(safeDate.getDate()),
  ].join("-");
};

const readCompletions = (): PlanCompletions => {
  try {
    const raw = localStorage.getItem(COMPLETIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PlanCompletions;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeCompletions = (data: PlanCompletions): void => {
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(data));
};

const getListKey = (type: PlanCompletionType): keyof DayPlanCompletion =>
  type === "workout" ? "workoutPlanIds" : "mealPlanIds";

const getDayListKey = (type: PlanCompletionType): keyof DayPlanCompletion =>
  type === "workout" ? "workoutDayIds" : "mealDayIds";

const getDayToken = (planId: string, dayId: string): string => `${planId}:${dayId}`;

export const getDayCompletion = (dateKey: string): DayPlanCompletion => {
  const completions = readCompletions();
  const completion = completions[dateKey] ?? emptyDayCompletion();

  return {
    workoutPlanIds: Array.isArray(completion.workoutPlanIds) ? completion.workoutPlanIds : [],
    mealPlanIds: Array.isArray(completion.mealPlanIds) ? completion.mealPlanIds : [],
    workoutDayIds: Array.isArray(completion.workoutDayIds) ? completion.workoutDayIds : [],
    mealDayIds: Array.isArray(completion.mealDayIds) ? completion.mealDayIds : [],
  };
};

export const isPlanCompleted = (
  type: PlanCompletionType,
  planId: string | null | undefined,
  dateKey: string,
): boolean => {
  if (!planId) return false;
  const completion = getDayCompletion(dateKey);
  return completion[getListKey(type)].includes(planId);
};

export const isPlanDayCompleted = (
  type: PlanCompletionType,
  planId: string | null | undefined,
  dayId: string | null | undefined,
  dateKey: string,
): boolean => {
  if (!planId || !dayId) return false;
  const completion = getDayCompletion(dateKey);
  return completion[getDayListKey(type)].includes(getDayToken(planId, dayId));
};

export const hasCompletedPlanDay = (
  type: PlanCompletionType,
  planId: string | null | undefined,
  dateKey: string,
): boolean => {
  if (!planId) return false;
  const completion = getDayCompletion(dateKey);
  return completion[getDayListKey(type)].some((token) => token.startsWith(`${planId}:`));
};

export const markPlanCompleted = (
  type: PlanCompletionType,
  planId: string,
  dateKey: string,
): void => {
  const completions = readCompletions();
  const completion = completions[dateKey] ?? emptyDayCompletion();
  const listKey = getListKey(type);
  const currentList = Array.isArray(completion[listKey]) ? completion[listKey] : [];

  completions[dateKey] = {
    workoutPlanIds: Array.isArray(completion.workoutPlanIds) ? completion.workoutPlanIds : [],
    mealPlanIds: Array.isArray(completion.mealPlanIds) ? completion.mealPlanIds : [],
    workoutDayIds: Array.isArray(completion.workoutDayIds) ? completion.workoutDayIds : [],
    mealDayIds: Array.isArray(completion.mealDayIds) ? completion.mealDayIds : [],
    [listKey]: currentList.includes(planId) ? currentList : [...currentList, planId],
  };

  writeCompletions(completions);
};

export const markPlanDayCompleted = (
  type: PlanCompletionType,
  planId: string,
  dayId: string,
  dateKey: string,
): void => {
  const completions = readCompletions();
  const completion = completions[dateKey] ?? emptyDayCompletion();
  const listKey = getDayListKey(type);
  const currentList = Array.isArray(completion[listKey]) ? completion[listKey] : [];
  const token = getDayToken(planId, dayId);

  completions[dateKey] = {
    workoutPlanIds: Array.isArray(completion.workoutPlanIds) ? completion.workoutPlanIds : [],
    mealPlanIds: Array.isArray(completion.mealPlanIds) ? completion.mealPlanIds : [],
    workoutDayIds: Array.isArray(completion.workoutDayIds) ? completion.workoutDayIds : [],
    mealDayIds: Array.isArray(completion.mealDayIds) ? completion.mealDayIds : [],
    [listKey]: currentList.includes(token) ? currentList : [...currentList, token],
  };

  writeCompletions(completions);
};

export const unmarkPlanCompleted = (
  type: PlanCompletionType,
  planId: string,
  dateKey: string,
): void => {
  const completions = readCompletions();
  const completion = completions[dateKey] ?? emptyDayCompletion();
  const listKey = getListKey(type);

  completions[dateKey] = {
    workoutPlanIds: Array.isArray(completion.workoutPlanIds) ? completion.workoutPlanIds : [],
    mealPlanIds: Array.isArray(completion.mealPlanIds) ? completion.mealPlanIds : [],
    workoutDayIds: Array.isArray(completion.workoutDayIds) ? completion.workoutDayIds : [],
    mealDayIds: Array.isArray(completion.mealDayIds) ? completion.mealDayIds : [],
    [listKey]: (completion[listKey] ?? []).filter((id) => id !== planId),
  };

  writeCompletions(completions);
};

/**
 * Remove all day-level completions for a specific plan across ALL stored dates.
 * Used when a cycle resets so that everything starts fresh.
 */
export const clearAllDayCompletionsForPlan = (
  type: PlanCompletionType,
  planId: string,
): void => {
  const completions = readCompletions();
  const dayListKey = getDayListKey(type);
  const prefix = `${planId}:`;

  for (const dateKey of Object.keys(completions)) {
    const completion = completions[dateKey];
    if (!completion) continue;
    const dayList = Array.isArray(completion[dayListKey]) ? completion[dayListKey] : [];
    const filtered = dayList.filter((token) => !token.startsWith(prefix));
    if (filtered.length !== dayList.length) {
      completions[dateKey] = { ...completion, [dayListKey]: filtered };
    }
  }

  writeCompletions(completions);
};

/**
 * Remove completions older than `keepDays` days to prevent localStorage bloat.
 */
export const cleanupOldCompletions = (keepDays = 8): void => {
  const completions = readCompletions();
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - keepDays);
  const cutoffKey = getDateKey(cutoff);

  let changed = false;
  for (const dateKey of Object.keys(completions)) {
    if (dateKey < cutoffKey) {
      delete completions[dateKey];
      changed = true;
    }
  }

  if (changed) writeCompletions(completions);
};
