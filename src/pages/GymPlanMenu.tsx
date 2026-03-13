import {
  CalendarCheck2,
  ClipboardCheck,
  Grid3X3,
  Heart,
  Plus,
  Search,
  Trophy,
  UserRoundPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ActivitiesList from "../components/ActivitiesList";
import WorkoutPreview from "../components/WorkoutPreview";
import { exerciseService } from "../services/exerciseService";
import type { Exercise, MuscleGroup } from "../types/exercise";

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface WorkoutItem {
  id: string;
  name: string;
  volume: string;
  note: string;
}

interface DayPlan {
  id: string;
  label: string;
  exercises: Exercise[];
}

interface DaysSelectorProps {
  days: DayPlan[];
  activeDayId: string;
  onSelectDay: (day: DayPlan) => void;
  onAddDay: () => void;
}

interface ActivityDetailsProps {
  activeDayLabel: string;
  selectedExercisesCount: number;
  selectedExerciseName: string | null;
  activeWorkout: WorkoutItem;
  onWorkoutVolumeChange: (value: string) => void;
  onWorkoutNoteChange: (value: string) => void;
  onApplyToWorkout: () => void;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "search", label: "Search", icon: Search },
  { id: "dashboard", label: "Dashboard", icon: Grid3X3 },
  { id: "community", label: "Community", icon: Users },
  { id: "coach", label: "Coach", icon: UserRoundPlus },
  { id: "calendar", label: "Calendar", icon: CalendarCheck2 },
  { id: "tasks", label: "Tasks", icon: ClipboardCheck },
];

const EXERCISE_ICON_BY_GROUP: Record<MuscleGroup, LucideIcon> = {
  chest: Trophy,
  back: CalendarCheck2,
  legs: Users,
  arms: UserRoundPlus,
  core: Grid3X3,
  cardio: Heart,
};

const INITIAL_DAY_EXERCISE_IDS = [
  "Barbell_Bench_Press_-_Medium_Grip",
  "Bent_Over_Barbell_Row",
  "90_90_Hamstring",
];

const getExercisesByIds = (allExercises: Exercise[], ids: string[]): Exercise[] =>
  ids
    .map((id) => allExercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => !!exercise);

function DaysSelector({ days, activeDayId, onSelectDay, onAddDay }: DaysSelectorProps) {
  return (
    <section className="reveal-up reveal-delay-2 mb-4 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-50">Days</h2>
        <button
          type="button"
          onClick={onAddDay}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border-0 bg-gradient-to-r from-emerald-500 to-blue-500 text-white transition-all duration-300 hover:from-emerald-600 hover:to-blue-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {days.map((day) => {
          const isActive = day.id === activeDayId;
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`rounded-[10px] border px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                  : "border-white/10 bg-white/[0.02] text-slate-200 hover:bg-white/[0.08]"
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ActivityDetails({
  activeDayLabel,
  selectedExercisesCount,
  selectedExerciseName,
  activeWorkout,
  onWorkoutVolumeChange,
  onWorkoutNoteChange,
  onApplyToWorkout,
}: ActivityDetailsProps) {
  return (
    <section className="reveal-up reveal-delay-5 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <h2 className="mb-3 text-lg font-semibold text-slate-50">Activity details</h2>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
        <div className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Active day</p>
          <p className="text-sm font-semibold text-slate-100">{activeDayLabel}</p>
        </div>
        <div className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Selected activities</p>
          <p className="text-sm font-semibold text-slate-100">{selectedExercisesCount}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-300">Workout title</label>
          <p className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100">
            {activeWorkout.name}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-300">Volume</label>
          <input
            type="text"
            value={activeWorkout.volume}
            onChange={(event) => onWorkoutVolumeChange(event.target.value)}
            className="h-10 w-full rounded-[10px] border border-white/20 bg-white/[0.03] px-3 text-sm text-slate-100 outline-none transition-all focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.2)]"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-300">Selected exercise</label>
          <p className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100">
            {selectedExerciseName ?? "No exercise selected"}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-300">Notes</label>
          <textarea
            value={activeWorkout.note}
            onChange={(event) => onWorkoutNoteChange(event.target.value)}
            className="h-28 w-full resize-none rounded-[10px] border border-white/20 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none transition-all focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.2)]"
            placeholder="Add workout notes..."
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onApplyToWorkout}
        className="mt-4 w-full rounded-[10px] border-0 bg-gradient-to-r from-emerald-500 to-blue-500 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-blue-600"
      >
        Update workout details
      </button>
    </section>
  );
}

export default function GymPlanMenu() {
  const allExercises = useMemo(() => exerciseService.getAllExercises(), []);
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>("search");
  const [statusMessage, setStatusMessage] = useState<string>(
    "Search the professional database and configure exercises per day.",
  );
  const [days, setDays] = useState<DayPlan[]>(() => [
    {
      id: "day-1",
      label: "Day 1",
      exercises: getExercisesByIds(allExercises, INITIAL_DAY_EXERCISE_IDS),
    },
    { id: "day-2", label: "Day 2", exercises: [] },
    { id: "day-3", label: "Day 3", exercises: [] },
  ]);
  const [activeDayId, setActiveDayId] = useState<string>("day-1");
  const [selectedExerciseByDay, setSelectedExerciseByDay] = useState<Record<string, string | null>>({
    "day-1": INITIAL_DAY_EXERCISE_IDS[0] ?? null,
    "day-2": null,
    "day-3": null,
  });
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([
    {
      id: "workout-1",
      name: "Workout",
      volume: "4 sets",
      note: "Keep good form and controlled tempo.",
    },
  ]);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string>("workout-1");

  const activeWorkout = useMemo<WorkoutItem>(() => {
    return (
      workouts.find((workout) => workout.id === activeWorkoutId) ?? {
        id: "workout-fallback",
        name: "Workout",
        volume: "3 sets",
        note: "",
      }
    );
  }, [activeWorkoutId, workouts]);

  const activeDay = useMemo<DayPlan | undefined>(
    () => days.find((day) => day.id === activeDayId),
    [days, activeDayId],
  );
  const activeDayExercises = activeDay?.exercises ?? [];
  const selectedExerciseId = selectedExerciseByDay[activeDayId] ?? null;
  const selectedExercise =
    activeDayExercises.find((exercise) => exercise.id === selectedExerciseId) ?? null;

  const getIconForMuscleGroup = (muscleGroup: MuscleGroup): LucideIcon =>
    EXERCISE_ICON_BY_GROUP[muscleGroup];

  const handleSidebarAction = (item: SidebarItem): void => {
    setActiveSidebarItem(item.id);
    setStatusMessage(`${item.label} section activated.`);
  };

  const handleCreateWorkout = (): void => {
    const nextWorkoutNumber = workouts.length + 1;
    const newWorkoutId = `workout-${Date.now()}`;
    const newWorkout: WorkoutItem = {
      id: newWorkoutId,
      name: `Workout ${nextWorkoutNumber}`,
      volume: "4 sets",
      note: "Add your progression notes for this workout.",
    };

    setWorkouts((prev) => [...prev, newWorkout]);
    setActiveWorkoutId(newWorkoutId);
    setStatusMessage(`${newWorkout.name} created.`);
  };

  const handleSelectDay = (day: DayPlan): void => {
    setActiveDayId(day.id);
    setStatusMessage(`${day.label} selected.`);
  };

  const handleAddDay = (): void => {
    const nextDayNumber = days.length + 1;
    const nextDay: DayPlan = {
      id: `day-${nextDayNumber}`,
      label: `Day ${nextDayNumber}`,
      exercises: [],
    };

    setDays((prev) => [...prev, nextDay]);
    setSelectedExerciseByDay((prev) => ({ ...prev, [nextDay.id]: null }));
    setActiveDayId(nextDay.id);
    setStatusMessage(`${nextDay.label} added to your schedule.`);
  };

  const handleSelectExercise = (exercise: Exercise): void => {
    const existsInActiveDay = activeDayExercises.some((item) => item.id === exercise.id);
    if (!existsInActiveDay) {
      return;
    }

    setSelectedExerciseByDay((prev) => ({ ...prev, [activeDayId]: exercise.id }));
    setStatusMessage(`${exercise.name} selected.`);
  };

  const handleAddExerciseToActiveDay = (exercise: Exercise): void => {
    const existsInActiveDay = activeDayExercises.some((item) => item.id === exercise.id);

    if (!existsInActiveDay) {
      setDays((prev) =>
        prev.map((day) =>
          day.id === activeDayId ? { ...day, exercises: [...day.exercises, exercise] } : day,
        ),
      );
      setStatusMessage(`${exercise.name} added to ${activeDay?.label ?? "current day"}.`);
    } else {
      setStatusMessage(`${exercise.name} is already in ${activeDay?.label ?? "current day"}.`);
    }

    setSelectedExerciseByDay((prev) => ({ ...prev, [activeDayId]: exercise.id }));
  };

  const handleDeleteExerciseFromActiveDay = (exerciseId: string): void => {
    const deletedExercise = activeDayExercises.find((exercise) => exercise.id === exerciseId);
    if (!deletedExercise) {
      return;
    }

    const remainingExercises = activeDayExercises.filter((exercise) => exercise.id !== exerciseId);

    setDays((prev) =>
      prev.map((day) =>
        day.id === activeDayId ? { ...day, exercises: remainingExercises } : day,
      ),
    );

    setSelectedExerciseByDay((prev) => {
      if (prev[activeDayId] !== exerciseId) {
        return prev;
      }
      return { ...prev, [activeDayId]: remainingExercises[0]?.id ?? null };
    });

    setStatusMessage(`${deletedExercise.name} removed from ${activeDay?.label ?? "current day"}.`);
  };

  const handleApplySelectedActivities = (): void => {
    const exerciseForWorkout = selectedExercise ?? activeDayExercises[0];
    if (!exerciseForWorkout) {
      setStatusMessage("Select an exercise for the active day first.");
      return;
    }

    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === activeWorkoutId
          ? {
              ...workout,
              name: exerciseForWorkout.name,
              volume: `${activeDayExercises.length || 1} exercises`,
            }
          : workout,
      ),
    );
    setStatusMessage(`${exerciseForWorkout.name} linked to ${activeDay?.label ?? "current day"}.`);
  };

  const handleWorkoutVolumeChange = (value: string): void => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === activeWorkoutId ? { ...workout, volume: value } : workout,
      ),
    );
  };

  const handleWorkoutNoteChange = (value: string): void => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === activeWorkoutId ? { ...workout, note: value } : workout,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-8">
        <div className="flex gap-4 lg:gap-5">
          <aside className="reveal-up hidden w-[78px] shrink-0 rounded-[14px] border border-white/12 bg-white/4 p-2.5 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px] lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-1.5">
              <div className="mb-3 flex justify-center">
                <Link
                  to="/home"
                  className="rounded-[10px] border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold tracking-[0.2em] text-white transition-colors hover:bg-white/10"
                >
                  FL
                </Link>
              </div>
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSidebarItem === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSidebarAction(item)}
                    title={item.label}
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-[10px] border transition-all duration-200 ${
                      isActive
                        ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
                        : "border-transparent bg-transparent text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </button>
                );
              })}
            </div>
            <Link
              to="/home"
              className="mx-auto inline-flex rounded-[10px] border border-white/20 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-white/14"
            >
              Home
            </Link>
          </aside>

          <div className="w-full">
            <header className="reveal-up reveal-delay-1 mb-4 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px] md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold leading-tight text-slate-50 md:text-4xl">Workout editor</h1>
                  <p className="mt-1 text-sm text-slate-300">{statusMessage}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/home"
                    className="rounded-[10px] border border-white/25 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/14"
                  >
                    Back to Home
                  </Link>
                  <button
                    type="button"
                    onClick={handleCreateWorkout}
                    className="inline-flex items-center gap-2 rounded-[10px] border-0 bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-blue-600"
                  >
                    <Plus className="h-4 w-4" />
                    Create workout
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSidebarItem === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSidebarAction(item)}
                      className={`inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
                          : "border-white/20 bg-white/6 text-slate-200 hover:bg-white/12"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </header>

            <DaysSelector
              days={days}
              activeDayId={activeDayId}
              onSelectDay={handleSelectDay}
              onAddDay={handleAddDay}
            />

            <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="reveal-up reveal-delay-3">
                <WorkoutPreview selectedExercise={selectedExercise} />
              </div>

              <div className="reveal-up reveal-delay-4">
                <ActivitiesList
                  dayExercises={activeDayExercises}
                  selectedExerciseId={selectedExerciseId}
                  getIconForMuscleGroup={getIconForMuscleGroup}
                  searchExercises={exerciseService.searchExercises}
                  onAddExercise={handleAddExerciseToActiveDay}
                  onSelectExercise={handleSelectExercise}
                  onDeleteExercise={handleDeleteExerciseFromActiveDay}
                />
              </div>

              <ActivityDetails
                activeDayLabel={activeDay?.label ?? "Day"}
                selectedExercisesCount={activeDayExercises.length}
                selectedExerciseName={selectedExercise?.name ?? null}
                activeWorkout={activeWorkout}
                onWorkoutVolumeChange={handleWorkoutVolumeChange}
                onWorkoutNoteChange={handleWorkoutNoteChange}
                onApplyToWorkout={handleApplySelectedActivities}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
