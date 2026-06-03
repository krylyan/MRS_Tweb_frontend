import apiClient from "../utils/apiClient";
import type { Exercise, MuscleGroup } from "../types/exercise";
import { MUSCLE_GROUPS } from "../types/exercise";
import { normalizeMediaUrl } from "../utils/media";

// ─── Tipul brut returnat de GET /api/exercise ──────────────────────────────
export interface ApiExercise {
  id: number;
  name: string;
  muscleGroup: string; // vine ca string din backend (HasConversion<string>)
  gifUrl: string;
  instructions: string;
}

// ─── Mapper API → tip frontend ────────────────────────────────────────────
const mapApiExercise = (e: ApiExercise): Exercise => ({
  id: e.id,
  name: e.name,
  muscleGroup: e.muscleGroup as MuscleGroup,
  gifUrl: normalizeMediaUrl(e.gifUrl),
  instructions: e.instructions,
});

// ─── Fetch toate exercițiile ──────────────────────────────────────────────
const getAllExercises = async (): Promise<Exercise[]> => {
  const result = await apiClient.get<ApiExercise[]>("/exercise");
  if (!result.ok) return [];
  return result.data.map(mapApiExercise);
};

// ─── Căutare locală (backend nu are search endpoint) ─────────────────────
const searchExercises = async (query: string): Promise<Exercise[]> => {
  const all = await getAllExercises();
  if (!query.trim()) return all;
  const q = query.trim().toLowerCase();
  return all.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.muscleGroup.toLowerCase().includes(q) ||
      e.instructions.toLowerCase().includes(q),
  );
};

// ─── Fetch după muscle group ───────────────────────────────────────────────
const getExercisesByMuscleGroup = async (muscleGroup: MuscleGroup): Promise<Exercise[]> => {
  const result = await apiClient.get<ApiExercise[]>(`/exercise/by-muscle/${muscleGroup}`);
  if (!result.ok) return [];
  return result.data.map(mapApiExercise);
};

// ─── Categorii fixe din enum (nu mai vin dinamic) ─────────────────────────
const getFilterCategories = (): string[] => [...MUSCLE_GROUPS];

// ─── Admin: Adaugă exercițiu ──────────────────────────────────────────────
const createExercise = async (dto: {
  name: string;
  muscleGroup: string;
  gifUrl: string;
  instructions: string;
}): Promise<{ ok: boolean; message?: string }> => {
  const result = await apiClient.post<ApiExercise>("/exercise", dto);
  if (result.ok) return { ok: true };
  return { ok: false, message: (result as { ok: false; message: string }).message };
};

const updateExercise = async (
  id: number,
  dto: {
    name: string;
    muscleGroup: string;
    gifUrl: string;
    instructions: string;
  },
): Promise<{ ok: boolean; message?: string }> => {
  const result = await apiClient.put<ApiExercise>(`/exercise/${id}`, dto);
  if (result.ok) return { ok: true };
  return { ok: false, message: (result as { ok: false; message: string }).message };
};

// ─── Admin: Șterge exercițiu ──────────────────────────────────────────────
const deleteExercise = async (id: number): Promise<{ ok: boolean; message?: string }> => {
  const result = await apiClient.delete<void>(`/exercise/${id}`);
  if (result.ok) return { ok: true };
  return { ok: false, message: (result as { ok: false; message: string }).message };
};

// ─── Folosit în GymPlanMenu pentru a converti name → apiId ───────────────
const buildNameToApiIdMap = async (): Promise<Map<string, number>> => {
  const all = await getAllExercises();
  const map = new Map<string, number>();
  all.forEach((e) => map.set(e.name.toLowerCase().trim(), e.id));
  return map;
};

export const exerciseService = {
  getAllExercises,
  searchExercises,
  getExercisesByMuscleGroup,
  getFilterCategories,
  createExercise,
  updateExercise,
  deleteExercise,
  buildNameToApiIdMap,
  // Păstrat pentru compatibilitate cu orice import vechi:
  fetchExercisesFromApi: getAllExercises,
};
