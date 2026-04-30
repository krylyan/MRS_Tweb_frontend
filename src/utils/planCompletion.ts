export type PlanCompletionType = "workout" | "meal";

export interface DayPlanCompletion {
  workoutPlanIds: string[];
  mealPlanIds: string[];
}

export type PlanCompletions = Record<string, DayPlanCompletion>;

const COMPLETIONS_KEY = "fitlife_plan_completions";

const emptyDayCompletion = (): DayPlanCompletion => ({
  workoutPlanIds: [],
  mealPlanIds: [],
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

export const getDayCompletion = (dateKey: string): DayPlanCompletion => {
  const completions = readCompletions();
  const completion = completions[dateKey] ?? emptyDayCompletion();

  return {
    workoutPlanIds: Array.isArray(completion.workoutPlanIds) ? completion.workoutPlanIds : [],
    mealPlanIds: Array.isArray(completion.mealPlanIds) ? completion.mealPlanIds : [],
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
    [listKey]: currentList.includes(planId) ? currentList : [...currentList, planId],
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
    [listKey]: (completion[listKey] ?? []).filter((id) => id !== planId),
  };

  writeCompletions(completions);
};
