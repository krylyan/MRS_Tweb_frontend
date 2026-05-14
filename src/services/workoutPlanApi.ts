import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

export interface DayPlanApi {
  id: number;
  label: string;
  exercises: { id: number; name: string; muscleGroup: string }[];
}

export interface WorkoutPlanApi {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  days: DayPlanApi[];
}

export interface DayPlanCreateBody {
  label: string;
  exerciseIds: number[];
}

export const workoutPlanApi = {
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

  async update(id: number, name: string, days: DayPlanCreateBody[]): Promise<boolean> {
    const result = await apiClient.put<WorkoutPlanApi>(`/workoutplan/${id}`, { name, days });
    return result.ok;
  },

  async delete(id: number): Promise<boolean> {
    const result = await apiClient.delete<void>(`/workoutplan/${id}`);
    return result.ok;
  },
};
