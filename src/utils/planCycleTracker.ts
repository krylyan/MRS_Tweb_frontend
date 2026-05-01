/**
 * Plan Cycle Tracker
 *
 * Manages cyclic day-mapping for active plans.
 * - Stores the date a plan was activated.
 * - Maps any calendar date → plan Day (cyclic modulo totalDays).
 * - Detects when a full cycle is completed and auto-resets.
 * - Provides a 7-day history window (today + 6 days back).
 */

import { getDateKey } from "./planCompletion";

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface PlanActivation {
  planId: string;
  planType: "workout" | "meal";
  activatedAt: string;      // date key "YYYY-MM-DD"
  totalDays: number;         // how many Days the plan contains
  lastCycleResetAt?: string; // date key of last cycle reset
}

export interface ActiveDayInfo {
  dayIndex: number;  // 0-based
  dayNumber: number; // 1-based (Day 1, Day 2, …)
  dayId: string;     // "day-1", "day-2", …
  dayLabel: string;  // "Day 1", "Day 2", …
}

/* ── Storage keys ──────────────────────────────────────────────────────────── */

const ACTIVATION_KEY_WORKOUT = "fitlife_plan_activation_workout";
const ACTIVATION_KEY_MEAL = "fitlife_plan_activation_meal";

const getStorageKey = (type: "workout" | "meal"): string =>
  type === "workout" ? ACTIVATION_KEY_WORKOUT : ACTIVATION_KEY_MEAL;

/* ── Date helpers ──────────────────────────────────────────────────────────── */

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** Number of calendar days between two date keys (b - a). */
const daysBetween = (a: string, b: string): number => {
  const msA = parseDateKey(a).getTime();
  const msB = parseDateKey(b).getTime();
  return Math.round((msB - msA) / (1000 * 60 * 60 * 24));
};

export const addDaysToKey = (dateKey: string, days: number): string => {
  const d = parseDateKey(dateKey);
  d.setDate(d.getDate() + days);
  return getDateKey(d);
};

/* ── Read / Write ──────────────────────────────────────────────────────────── */

export const getPlanActivation = (type: "workout" | "meal"): PlanActivation | null => {
  try {
    const raw = localStorage.getItem(getStorageKey(type));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanActivation;
    if (!parsed || !parsed.planId || !parsed.activatedAt || !parsed.totalDays) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const savePlanActivation = (
  type: "workout" | "meal",
  planId: string,
  totalDays: number,
): void => {
  const activation: PlanActivation = {
    planId,
    planType: type,
    activatedAt: getDateKey(),
    totalDays,
  };
  localStorage.setItem(getStorageKey(type), JSON.stringify(activation));
};

export const removePlanActivation = (type: "workout" | "meal"): void => {
  localStorage.removeItem(getStorageKey(type));
};

/* ── Day mapping ───────────────────────────────────────────────────────────── */

/**
 * Given a plan activation and a calendar date, compute which Day of the plan
 * is "active" for that date. Uses cyclic modulo arithmetic.
 *
 * - If the date is before the activation date, returns Day 1.
 * - Otherwise: dayIndex = (daysDiff % totalDays)
 */
export const getActiveDayForDate = (
  activation: PlanActivation,
  dateKey: string,
): ActiveDayInfo => {
  const startKey = activation.lastCycleResetAt ?? activation.activatedAt;
  const diff = daysBetween(startKey, dateKey);
  const safeDiff = Math.max(0, diff);
  const dayIndex = safeDiff % activation.totalDays;
  const dayNumber = dayIndex + 1;

  return {
    dayIndex,
    dayNumber,
    dayId: `day-${dayNumber}`,
    dayLabel: `Day ${dayNumber}`,
  };
};

/* ── Cycle completion check ────────────────────────────────────────────────── */

/**
 * Check if ALL days in the current cycle have been completed.
 * We scan the last `totalDays` calendar days from the given date
 * and verify each one has its corresponding plan day marked as completed.
 */
export const isFullCycleCompleted = (
  activation: PlanActivation,
  checkDayCompletedFn: (dayId: string, dateKey: string) => boolean,
  dateKey: string,
): boolean => {
  const startKey = activation.lastCycleResetAt ?? activation.activatedAt;
  const diff = daysBetween(startKey, dateKey);

  // Need at least totalDays elapsed to have a full cycle
  if (diff < activation.totalDays - 1) return false;

  // Check each day in the current cycle
  // The current cycle started at: startKey + (currentCycleStart)
  const currentCycleStartOffset = Math.floor(diff / activation.totalDays) * activation.totalDays;

  for (let i = 0; i < activation.totalDays; i++) {
    const checkDate = addDaysToKey(startKey, currentCycleStartOffset + i);
    const dayInfo = getActiveDayForDate(activation, checkDate);
    if (!checkDayCompletedFn(dayInfo.dayId, checkDate)) {
      return false;
    }
  }

  return true;
};

/**
 * If the previous cycle was fully completed, reset the cycle by updating
 * the activation's lastCycleResetAt to today.
 * Returns true if a reset happened.
 */
export const checkAndResetCycle = (
  type: "workout" | "meal",
  checkDayCompletedFn: (dayId: string, dateKey: string) => boolean,
): boolean => {
  const activation = getPlanActivation(type);
  if (!activation) return false;

  const todayKey = getDateKey();
  const startKey = activation.lastCycleResetAt ?? activation.activatedAt;
  const diff = daysBetween(startKey, todayKey);

  // Check if the previous cycle (not the current partial one) was completed
  if (diff < activation.totalDays) return false;

  // Check the previous full cycle
  const prevCycleStartOffset = (Math.floor(diff / activation.totalDays) - 1) * activation.totalDays;
  if (prevCycleStartOffset < 0) return false;

  let allCompleted = true;
  for (let i = 0; i < activation.totalDays; i++) {
    const checkDate = addDaysToKey(startKey, prevCycleStartOffset + i);
    const dayInfo = getActiveDayForDate(activation, checkDate);
    if (!checkDayCompletedFn(dayInfo.dayId, checkDate)) {
      allCompleted = false;
      break;
    }
  }

  if (!allCompleted) return false;

  // Reset: update the activation start to the beginning of the current cycle
  const currentCycleStartOffset = Math.floor(diff / activation.totalDays) * activation.totalDays;
  const newStartDate = addDaysToKey(startKey, currentCycleStartOffset);

  const updated: PlanActivation = {
    ...activation,
    lastCycleResetAt: newStartDate,
  };
  localStorage.setItem(getStorageKey(type), JSON.stringify(updated));
  return true;
};

/* ── History helpers ───────────────────────────────────────────────────────── */

/**
 * Returns an array of date keys from today going back `limit` days (inclusive).
 * Example with limit=7: [today, yesterday, … , 6 days ago]
 */
export const getHistoryDays = (limit = 7): string[] => {
  const todayKey = getDateKey();
  const days: string[] = [];
  for (let i = 0; i < limit; i++) {
    days.push(addDaysToKey(todayKey, -i));
  }
  return days;
};

/**
 * Check if a date key is within the allowed navigation range.
 * Max: today. Min: 6 days ago (7 days total).
 */
export const isDateInRange = (dateKey: string): { canGoPrev: boolean; canGoNext: boolean } => {
  const todayKey = getDateKey();
  const minKey = addDaysToKey(todayKey, -6);

  return {
    canGoPrev: dateKey > minKey,
    canGoNext: dateKey < todayKey,
  };
};
