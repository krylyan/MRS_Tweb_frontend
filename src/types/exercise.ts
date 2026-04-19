export type MuscleGroup = string;

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  gifUrl: string;
  instructions: string;
  recommended?: boolean;
  hidden?: boolean;
}
