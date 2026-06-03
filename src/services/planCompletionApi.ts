import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

// ─── Tipuri ───────────────────────────────────────────────────────────────────

export type PlanTypeApi = "Workout" | "Meal";

export interface PlanCompletionCreateDto {
  planType: PlanTypeApi;
  dayToken: string;  // format: "planId:dayId"
  dateKey: string;   // format: "YYYY-MM-DD"
}

export interface PlanCompletionResponseDto {
  id: number;
  planType: PlanTypeApi;
  dayToken: string;
  dateKey: string;
  completedAt: string;
}

// ─── API Client ───────────────────────────────────────────────────────────────

function getUserId(): number | null {
  const session = AuthUtils.getSession();
  return session?.userId ?? null;
}

export const planCompletionApi = {
  /**
   * POST /api/plancompletion?userId=X
   * Marchează o zi ca finalizată în DB.
   */
  async markComplete(dto: PlanCompletionCreateDto): Promise<boolean> {
    const userId = getUserId();
    if (!userId) return false;
    const result = await apiClient.post<PlanCompletionResponseDto>(
      `/plancompletion?userId=${userId}`,
      dto,
    );
    return result.ok;
  },

  /**
   * DELETE /api/plancompletion?userId=X&dayToken=...&dateKey=...
   * Anulează marcarea unei zile ca finalizată.
   */
  async unmark(dayToken: string, dateKey: string): Promise<boolean> {
    const userId = getUserId();
    if (!userId) return false;
    const result = await apiClient.delete<void>(
      `/plancompletion?userId=${userId}&dayToken=${encodeURIComponent(dayToken)}&dateKey=${dateKey}`,
    );
    return result.ok;
  },

  /**
   * GET /api/plancompletion?userId=X
   * Returnează toate completările unui user (opțional filtrat pe planType).
   */
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
