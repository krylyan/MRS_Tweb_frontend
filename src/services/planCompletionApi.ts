import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

export type PlanTypeApi = "Workout" | "Meal";

export interface PlanCompletionCreateDto {
  planType: PlanTypeApi;
  dayToken: string;
  dateKey: string;
}

export interface PlanCompletionResponseDto {
  id: number;
  planType: PlanTypeApi;
  dayToken: string;
  dateKey: string;
  completedAt: string;
}

function getUserId(): number | null {
  const session = AuthUtils.getSession();
  return session?.userId ?? null;
}

export const planCompletionApi = {
  async markComplete(dto: PlanCompletionCreateDto): Promise<boolean> {
    const userId = getUserId();
    if (!userId) return false;
    const result = await apiClient.post<PlanCompletionResponseDto>(
      `/plancompletion?userId=${userId}`,
      dto,
    );
    return result.ok;
  },

  async unmark(dayToken: string, dateKey: string): Promise<boolean> {
    const userId = getUserId();
    if (!userId) return false;
    const result = await apiClient.delete<void>(
      `/plancompletion?userId=${userId}&dayToken=${encodeURIComponent(dayToken)}&dateKey=${dateKey}`,
    );
    return result.ok;
  },

  async getByUser(planType?: PlanTypeApi): Promise<PlanCompletionResponseDto[]> {
    const userId = getUserId();
    if (!userId) return [];
    const typeParam = planType ? `&planType=${planType}` : "";
    const result = await apiClient.get<PlanCompletionResponseDto[]>(
      `/plancompletion?userId=${userId}${typeParam}`,
    );
    return result.ok ? result.data : [];
  },
};
