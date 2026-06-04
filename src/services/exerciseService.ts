import apiClient from "../utils/apiClient";
import type { Exercise, MuscleGroup } from "../types/exercise";
import { MUSCLE_GROUPS } from "../types/exercise";
import { normalizeMediaUrl } from "../utils/media";

export interface ApiExercise {
  id: number;
  name: string;
  muscleGroup: string;
  gifUrl: string;
  instructions: string;
}

const mapApiExercise = (e: ApiExercise): Exercise => ({
  id: e.id,
  name: e.name,
  muscleGroup: e.muscleGroup as MuscleGroup,
  gifUrl: normalizeMediaUrl(e.gifUrl),
  instructions: e.instructions,
});

const getAllExercises = async (): Promise<Exercise[]> => {
  const result = await apiClient.get<ApiExercise[]>("/exercise");
  if (!result.ok) return [];
  return result.data.map(mapApiExercise);
};

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

const getExercisesByMuscleGroup = async (muscleGroup: MuscleGroup): Promise<Exercise[]> => {
  const result = await apiClient.get<ApiExercise[]>(`/exercise/by-muscle/${muscleGroup}`);
  if (!result.ok) return [];
  return result.data.map(mapApiExercise);
};

const getFilterCategories = (): string[] => [...MUSCLE_GROUPS];

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

const deleteExercise = async (id: number): Promise<{ ok: boolean; message?: string }> => {
  const result = await apiClient.delete<void>(`/exercise/${id}`);
  if (result.ok) return { ok: true };
  return { ok: false, message: (result as { ok: false; message: string }).message };
};

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
  fetchExercisesFromApi: getAllExercises,
};
