import { exerciseLibrary } from "../utils/exerciseLibrary";
import type { Exercise, MuscleGroup } from "../types/exercise";

const getAllExercises = (): Exercise[] => exerciseLibrary.getVisibleExercises();

const getExercisesByMuscleGroup = (muscleGroup: MuscleGroup): Exercise[] =>
  exerciseLibrary
    .getVisibleExercises()
    .filter((exercise) => exercise.muscleGroup === muscleGroup);

const searchExercises = (query: string): Exercise[] => exerciseLibrary.searchExercises(query);

const getFilterCategories = (): string[] => exerciseLibrary.getFilterCategories();

export const exerciseService = {
  getAllExercises,
  getExercisesByMuscleGroup,
  searchExercises,
  getFilterCategories,
};
