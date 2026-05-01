export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface PauseTime {
  minutes: number;
  seconds: number;
}

export interface WorkoutTrackingState {
  pauseTime: PauseTime;
  sets: WorkoutSet[];
}

export interface StoredDayPlan {
  id: string;
  label: string;
  exerciseIds: string[];
}

export interface StoredWorkoutPlan {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  days: StoredDayPlan[];
  selectedExerciseByDay: Record<string, string | null>;
  workoutTracking: WorkoutTrackingState;
}

const PLANS_KEY = "fitlife_workout_plans";

const DEFAULT_PAUSE_TIME: PauseTime = {
  minutes: 2,
  seconds: 0,
};

const DEFAULT_TRACKING: WorkoutTrackingState = {
  pauseTime: { ...DEFAULT_PAUSE_TIME },
  sets: [{ weight: 0, reps: 0 }],
};

const createPlanRecord = (
  id: string,
  name: string,
  exerciseIds: string[] = [],
  tracking: WorkoutTrackingState = DEFAULT_TRACKING,
): StoredWorkoutPlan => {
  const timestamp = new Date().toISOString();

  return {
    id,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
    days: [
      {
        id: "day-1",
        label: "Day 1",
        exerciseIds,
      },
    ],
    selectedExerciseByDay: {
      "day-1": exerciseIds[0] ?? null,
    },
    workoutTracking: {
      pauseTime: { ...tracking.pauseTime },
      sets: tracking.sets.map((set) => ({ ...set })),
    },
  };
};

const DEFAULT_PLANS: StoredWorkoutPlan[] = [
  createPlanRecord("plan-push-day", "Push Day", ["Barbell_Bench_Press_-_Medium_Grip"], {
    pauseTime: { minutes: 2, seconds: 0 },
    sets: [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 8 },
    ],
  }),
  createPlanRecord("plan-pull-day", "Pull Day", ["Bent_Over_Barbell_Row"], {
    pauseTime: { minutes: 1, seconds: 30 },
    sets: [
      { weight: 45, reps: 12 },
      { weight: 45, reps: 10 },
    ],
  }),
  createPlanRecord("plan-mobility", "Mobility Reset", ["90_90_Hamstring"], {
    pauseTime: { minutes: 1, seconds: 0 },
    sets: [{ weight: 0, reps: 12 }],
  }),
];

const clonePlan = (plan: StoredWorkoutPlan): StoredWorkoutPlan => ({
  ...plan,
  days: plan.days.map((day) => ({
    ...day,
    exerciseIds: [...day.exerciseIds],
  })),
  selectedExerciseByDay: { ...plan.selectedExerciseByDay },
  workoutTracking: {
    pauseTime: { ...plan.workoutTracking.pauseTime },
    sets: plan.workoutTracking.sets.map((set) => ({ ...set })),
  },
});

const readPlans = (): StoredWorkoutPlan[] => {
  const raw = localStorage.getItem(PLANS_KEY);

  if (!raw) {
    const seeded = DEFAULT_PLANS.map(clonePlan);
    localStorage.setItem(PLANS_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as StoredWorkoutPlan[];
    if (!Array.isArray(parsed) || !parsed.length) {
      const seeded = DEFAULT_PLANS.map(clonePlan);
      localStorage.setItem(PLANS_KEY, JSON.stringify(seeded));
      return seeded;
    }

    return parsed.map(clonePlan);
  } catch {
    const seeded = DEFAULT_PLANS.map(clonePlan);
    localStorage.setItem(PLANS_KEY, JSON.stringify(seeded));
    return seeded;
  }
};

const writePlans = (plans: StoredWorkoutPlan[]): void => {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
};

export const createEmptyWorkoutPlan = (name = ""): StoredWorkoutPlan => {
  const timestamp = new Date().toISOString();

  return {
    id: `plan-${Date.now()}`,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
    days: [
      {
        id: "day-1",
        label: "Day 1",
        exerciseIds: [],
      },
    ],
    selectedExerciseByDay: {
      "day-1": null,
    },
    workoutTracking: {
      pauseTime: { ...DEFAULT_TRACKING.pauseTime },
      sets: DEFAULT_TRACKING.sets.map((set) => ({ ...set })),
    },
  };
};

export const getWorkoutPlans = (): StoredWorkoutPlan[] =>
  readPlans().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

export const getWorkoutPlanById = (planId: string): StoredWorkoutPlan | null =>
  getWorkoutPlans().find((plan) => plan.id === planId) ?? null;

export const saveWorkoutPlan = (plan: StoredWorkoutPlan): StoredWorkoutPlan => {
  const plans = readPlans();
  const nextPlan: StoredWorkoutPlan = {
    ...clonePlan(plan),
    updatedAt: new Date().toISOString(),
  };
  const existingIndex = plans.findIndex((item) => item.id === plan.id);

  if (existingIndex === -1) {
    plans.push(nextPlan);
  } else {
    plans[existingIndex] = nextPlan;
  }

  writePlans(plans);
  return nextPlan;
};

export const deleteWorkoutPlan = (planId: string): void => {
  const plans = readPlans().filter((plan) => plan.id !== planId);
  writePlans(plans);

  if (getActivePlanId() === planId) {
    setActivePlanId(null);
  }
};

/* ── Active plan tracking ─────────────────────────────────────────────────── */

import { savePlanActivation, removePlanActivation } from "./planCycleTracker";

const ACTIVE_PLAN_KEY = "fitlife_active_workout_plan";

export const getActivePlanId = (): string | null =>
  localStorage.getItem(ACTIVE_PLAN_KEY);

export const setActivePlanId = (planId: string | null): void => {
  if (planId) {
    localStorage.setItem(ACTIVE_PLAN_KEY, planId);
    // Save plan activation for cycle tracking
    const plan = getWorkoutPlanById(planId);
    if (plan) {
      savePlanActivation("workout", planId, plan.days.length);
    }
  } else {
    localStorage.removeItem(ACTIVE_PLAN_KEY);
    removePlanActivation("workout");
  }
};

export const getActivePlan = (): StoredWorkoutPlan | null => {
  const activeId = getActivePlanId();
  if (!activeId) return null;
  return getWorkoutPlanById(activeId);
};
