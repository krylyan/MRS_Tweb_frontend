export type MuscleGroup = "chest" | "back" | "legs" | "arms" | "core" | "cardio";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  gifUrl: string;
  instructions: string;
}
