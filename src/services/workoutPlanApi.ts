import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

export interface DayPlanApi {
  id: number;
  label: string;
  dayNumber: number;
  isRestDay?: boolean;
  exercises: WorkoutExerciseApi[];
  dayExercises: WorkoutDayExerciseApi[];
}

export interface WorkoutSetApi {
  id: number;
  order: number;
  weight: number;
  reps: number;
}

export interface WorkoutExerciseApi {
  id: number;
  name: string;
  muscleGroup: string;
  gifUrl?: string;
  instructions?: string;
  metValue: number;
}

export interface WorkoutDayExerciseApi {
  dayPlanId: number;
  exerciseId: number;
  order: number;
  exercise: WorkoutExerciseApi;
  pauseTime: {
    minutes: number;
    seconds: number;
  };
  sets: WorkoutSetApi[];
}

export interface WorkoutPlanApi {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  days: DayPlanApi[];
  workoutTracking?: {
    id: number;
    pauseTime: {
      minutes: number;
      seconds: number;
    };
    sets: WorkoutSetApi[];
  } | null;
}

export interface WorkoutPlanDaySummaryApi {
  dayNumber: number;
  exerciseCount: number;
  totalWeight: number;
}

export interface WorkoutPlanSummaryApi {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  dayCount: number;
  exerciseCount: number;
  days: WorkoutPlanDaySummaryApi[];
}

export interface DayPlanCreateBody {
  label: string;
  dayNumber?: number;
  isRestDay?: boolean;
  exerciseIds?: number[];
  exercises?: {
    exerciseId: number;
    order: number;
    pauseTime: {
      minutes: number;
      seconds: number;
    };
    sets: {
      order: number;
      weight: number;
      reps: number;
    }[];
  }[];
}

export const workoutPlanApi = {
  async getMyPlanSummaries(): Promise<WorkoutPlanSummaryApi[]> {
    const session = AuthUtils.getSession();
    if (!session) return [];
    const result = await apiClient.get<WorkoutPlanSummaryApi[]>(`/workoutplan/user/${session.userId}/summary`);
    return result.ok ? result.data : [];
  },

  async getMyPlans(): Promise<WorkoutPlanApi[]> {
    const session = AuthUtils.getSession();
    if (!session) return [];
    const result = await apiClient.get<WorkoutPlanApi[]>(`/workoutplan/user/${session.userId}`);
    return result.ok ? result.data : [];
  },

  async getById(id: number): Promise<WorkoutPlanApi | null> {
    const result = await apiClient.get<WorkoutPlanApi>(`/workoutplan/${id}`);
    return result.ok ? result.data : null;
  },

  async create(name: string, days: DayPlanCreateBody[]): Promise<WorkoutPlanApi | null> {
    const session = AuthUtils.getSession();
    if (!session) return null;
    const result = await apiClient.post<WorkoutPlanApi>(`/workoutplan/user/${session.userId}`, { name, days });
    return result.ok ? result.data : null;
  },

  async update(id: number, name: string, days: DayPlanCreateBody[]): Promise<WorkoutPlanApi | null> {
    const result = await apiClient.put<WorkoutPlanApi>(`/workoutplan/${id}`, { name, days });
    return result.ok ? result.data : null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await apiClient.delete<void>(`/workoutplan/${id}`);
    return result.ok;
  },
};
