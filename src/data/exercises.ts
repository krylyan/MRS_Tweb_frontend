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
  defaultSets: number;
  duration?: string;
}

export const exercises: Exercise[] = [
  { id: 1, name: "Squat", type: "strength", defaultSets: 5 },
  { id: 2, name: "Bicep Curl", type: "strength", defaultSets: 3 },
  { id: 3, name: "Push-up", type: "strength", defaultSets: 4 },
  { id: 4, name: "Bench Press", type: "strength", defaultSets: 4 },
  { id: 5, name: "Deadlift", type: "strength", defaultSets: 4 },
  { id: 6, name: "Overhead Press", type: "strength", defaultSets: 4 },
  { id: 7, name: "Lat Pulldown", type: "strength", defaultSets: 4 },
  { id: 8, name: "Seated Row", type: "strength", defaultSets: 4 },
  { id: 9, name: "Incline Dumbbell Press", type: "strength", defaultSets: 4 },
  { id: 10, name: "Romanian Deadlift", type: "strength", defaultSets: 4 },
  { id: 11, name: "Leg Press", type: "strength", defaultSets: 4 },
  { id: 12, name: "Lunge", type: "strength", defaultSets: 3 },
  { id: 13, name: "Hip Thrust", type: "strength", defaultSets: 4 },
  { id: 14, name: "Calf Raise", type: "strength", defaultSets: 4 },
  { id: 15, name: "Tricep Dip", type: "strength", defaultSets: 3 },
  { id: 16, name: "Hammer Curl", type: "strength", defaultSets: 3 },
  { id: 17, name: "Running", type: "cardio", defaultSets: 1, duration: "10 min" },
  { id: 18, name: "Cycling", type: "cardio", defaultSets: 1, duration: "20 min" },
  { id: 19, name: "Rowing", type: "cardio", defaultSets: 1, duration: "12 min" },
  { id: 20, name: "Jump Rope", type: "cardio", defaultSets: 1, duration: "8 min" },
  { id: 21, name: "Stair Climber", type: "cardio", defaultSets: 1, duration: "15 min" },
  { id: 22, name: "Elliptical", type: "cardio", defaultSets: 1, duration: "18 min" },
  { id: 23, name: "Mountain Climbers", type: "cardio", defaultSets: 3, duration: "45 sec" },
  { id: 24, name: "High Knees", type: "cardio", defaultSets: 3, duration: "30 sec" },
  { id: 25, name: "Plank", type: "core", defaultSets: 3, duration: "60 sec" },
  { id: 26, name: "Side Plank", type: "core", defaultSets: 3, duration: "40 sec" },
  { id: 27, name: "Russian Twist", type: "core", defaultSets: 3, duration: "45 sec" },
  { id: 28, name: "Leg Raise", type: "core", defaultSets: 3 },
  { id: 29, name: "Hollow Hold", type: "core", defaultSets: 3, duration: "35 sec" },
  { id: 30, name: "Bird Dog", type: "core", defaultSets: 3 },
  { id: 31, name: "Dynamic Hamstring Stretch", type: "mobility", defaultSets: 2, duration: "30 sec" },
  { id: 32, name: "Hip Flexor Stretch", type: "mobility", defaultSets: 2, duration: "30 sec" },
  { id: 33, name: "Thoracic Rotation", type: "mobility", defaultSets: 2, duration: "30 sec" },
  { id: 34, name: "Ankle Mobility Drill", type: "mobility", defaultSets: 2, duration: "30 sec" },
  { id: 35, name: "Shoulder Dislocates", type: "mobility", defaultSets: 2 },
  { id: 36, name: "World's Greatest Stretch", type: "mobility", defaultSets: 2 },
  { id: 37, name: "Jump Squat", type: "plyometric", defaultSets: 4 },
  { id: 38, name: "Burpee", type: "plyometric", defaultSets: 4 },
  { id: 39, name: "Box Jump", type: "plyometric", defaultSets: 4 },
  { id: 40, name: "Skater Jump", type: "plyometric", defaultSets: 4 },
  { id: 41, name: "Medicine Ball Slam", type: "plyometric", defaultSets: 4 },
  { id: 42, name: "Clap Push-up", type: "plyometric", defaultSets: 3 },
  { id: 43, name: "Foam Rolling Quads", type: "recovery", defaultSets: 2, duration: "60 sec" },
  { id: 44, name: "Foam Rolling Back", type: "recovery", defaultSets: 2, duration: "60 sec" },
  { id: 45, name: "Breathing Drill", type: "recovery", defaultSets: 2, duration: "90 sec" },
];

