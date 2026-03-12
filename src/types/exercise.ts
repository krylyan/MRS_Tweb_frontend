export type ExerciseType =
  | "strength"
  | "cardio"
  | "core"
  | "mobility"
  | "plyometric"
  | "recovery";

export interface Exercise {
  id: number;
  name: string;
  type: ExerciseType;
  instructions: string;
  defaultSets: number;
  duration?: string;
}
