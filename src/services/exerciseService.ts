import { exercises } from "../data/exercises";
import type { Exercise, ExerciseType } from "../types/exercise";

const getAllExercises = (): Exercise[] => exercises;

const getExercisesByType = (type: ExerciseType): Exercise[] =>
  exercises.filter((exercise) => exercise.type === type);

const searchExercises = (query: string): Exercise[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return exercises.filter((exercise) => exercise.name.toLowerCase().includes(normalized));
};

export const exerciseService = {
  getAllExercises,
  getExercisesByType,
  searchExercises,
};
