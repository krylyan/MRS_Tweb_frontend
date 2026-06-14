import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

export type PlanTypeApi = "Workout" | "Meal";

export interface PlanActivationApi {
  id: number;
  planType: PlanTypeApi;
  planIdentifier: string;
  activatedAt: string;
  totalDays: number;
  lastCycleResetAt?: string;
}

export const planActivationApi = {
  async getActive(planType: PlanTypeApi): Promise<PlanActivationApi | null> {
    const session = AuthUtils.getSession();
    if (!session) return null;
    const result = await apiClient.get<PlanActivationApi>(
      `/planactivation/active?userId=${session.userId}&planType=${planType}`
    );
    return result.ok ? result.data : null;
  },

  async activate(
    planIdentifier: string,
    planType: PlanTypeApi,
    totalDays: number
  ): Promise<PlanActivationApi | null> {
    const session = AuthUtils.getSession();
    if (!session) return null;
    const result = await apiClient.post<PlanActivationApi>(
      `/planactivation?userId=${session.userId}`,
      { planType, planIdentifier, totalDays }
    );
    return result.ok ? result.data : null;
  },

  async deactivate(planType: PlanTypeApi): Promise<boolean> {
    const session = AuthUtils.getSession();
    if (!session) return false;
    const result = await apiClient.delete<void>(
      `/planactivation?userId=${session.userId}&planType=${planType}`
    );
    return result.ok;
  },

  async resetCycle(planType: PlanTypeApi): Promise<boolean> {
    const session = AuthUtils.getSession();
    if (!session) return false;
    const result = await apiClient.post<PlanActivationApi>(
      `/planactivation/reset-cycle?userId=${session.userId}&planType=${planType}`,
      {}
    );
    return result.ok;
  },
};
