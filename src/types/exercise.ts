export type MuscleGroup = "Chest" | "Back" | "Legs" | "Arms" | "Core" | "Cardio";

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: MuscleGroup;
  gifUrl: string;
  instructions: string;
  metValue: number;
}

export const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Arms", "Core", "Cardio"];
