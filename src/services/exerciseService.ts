import { exercises } from "../data/exercises";
import type { Exercise, MuscleGroup } from "../types/exercise";

const getAllExercises = (): Exercise[] => exercises;

const getExercisesByMuscleGroup = (muscleGroup: MuscleGroup): Exercise[] =>
  exercises.filter((exercise) => exercise.muscleGroup === muscleGroup);

const searchExercises = (query: string): Exercise[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return exercises.filter((exercise) => exercise.name.toLowerCase().includes(normalized));
};

export const exerciseService = {
  getAllExercises,
  getExercisesByMuscleGroup,
  searchExercises,
};

