import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

export type PlanTypeApi = "Workout" | "Meal";

export interface PlanCustomizationApi {
  planType: PlanTypeApi;
  planIdentifier: string;
  colorId: string;
  imageUrl: string;
}

export interface UserPlanFavoriteApi {
  planType: PlanTypeApi;
  planIdentifier: string;
}

export interface PlanCustomization {
  colorId: string;
  imageUrl: string;
}

export type PlanCustomizations = Record<string, PlanCustomization>;

const getUserId = (): number | null => AuthUtils.getSession()?.userId ?? null;

export const toCustomizationMap = (
  items: PlanCustomizationApi[],
  planType: PlanTypeApi,
): PlanCustomizations =>
  Object.fromEntries(
    items
      .filter((item) => item.planType === planType)
      .map((item) => [
        item.planIdentifier,
        {
          colorId: item.colorId,
          imageUrl: item.imageUrl,
        },
      ]),
  );

export const toFavoriteIds = (
  items: UserPlanFavoriteApi[],
  planType: PlanTypeApi,
): string[] =>
  items
    .filter((item) => item.planType === planType)
    .map((item) => item.planIdentifier);

export const planPreferencesApi = {
  async getCustomizations(): Promise<PlanCustomizationApi[]> {
    const userId = getUserId();
    if (!userId) return [];
    const result = await apiClient.get<PlanCustomizationApi[]>(`/plancustomization?userId=${userId}`);
    return result.ok ? result.data : [];
  },

  async saveCustomization(dto: PlanCustomizationApi): Promise<PlanCustomizationApi | null> {
    const userId = getUserId();
    if (!userId) return null;
    const result = await apiClient.put<PlanCustomizationApi>(`/plancustomization?userId=${userId}`, dto);
    return result.ok ? result.data : null;
  },

  async getFavorites(): Promise<UserPlanFavoriteApi[]> {
    const userId = getUserId();
    if (!userId) return [];
    const result = await apiClient.get<UserPlanFavoriteApi[]>(`/userplanfavorite?userId=${userId}`);
    return result.ok ? result.data : [];
  },

  async addFavorite(dto: UserPlanFavoriteApi): Promise<boolean> {
    const userId = getUserId();
    if (!userId) return false;
    const result = await apiClient.post<UserPlanFavoriteApi>(`/userplanfavorite?userId=${userId}`, dto);
    return result.ok;
  },

  async removeFavorite(planType: PlanTypeApi, planIdentifier: string): Promise<boolean> {
    const userId = getUserId();
    if (!userId) return false;
    const result = await apiClient.delete<void>(
      `/userplanfavorite?userId=${userId}&planType=${planType}&planIdentifier=${encodeURIComponent(planIdentifier)}`,
    );
    return result.ok;
  },
};
