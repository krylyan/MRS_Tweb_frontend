export type MuscleGroup = "chest" | "back" | "legs" | "arms" | "core" | "cardio";

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: MuscleGroup;
  videoUrl: string;
  instructions: string;
  defaultSets: number;
  duration?: string;
}

