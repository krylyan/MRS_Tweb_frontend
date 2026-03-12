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
import ActivityItem from "../components/ActivityItem";
import ExerciseSearch from "../components/ExerciseSearch";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { exercises as exerciseDatabase, type Exercise, type ExerciseType } from "../data/exercises";

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

interface ActivitiesListProps {
  exercises: Exercise[];
  getIconForType: (type: ExerciseType) => LucideIcon;
  onSelectExercise: (exercise: Exercise) => void;
  onDeleteExercise: (exerciseId: number) => void;
}

interface ActivityDetailsProps {
  activeDayLabel: string;
  selectedExercises: Exercise[];
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

const EXERCISE_ICON_BY_TYPE: Record<ExerciseType, LucideIcon> = {
  strength: Trophy,
  cardio: CalendarCheck2,
  core: Grid3X3,
  mobility: ClipboardCheck,
  plyometric: Users,
  recovery: Heart,
};

const INITIAL_DAY_EXERCISE_IDS = [2, 5, 17];

const getExercisesByIds = (ids: number[]): Exercise[] =>
  ids
    .map((id) => exerciseDatabase.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => !!exercise);

const createInitialDays = (): DayPlan[] => [
  { id: "day-1", label: "Day 1", exercises: getExercisesByIds(INITIAL_DAY_EXERCISE_IDS) },
  { id: "day-2", label: "Day 2", exercises: [] },
  { id: "day-3", label: "Day 3", exercises: [] },
];

function DaysSelector({ days, activeDayId, onSelectDay, onAddDay }: DaysSelectorProps) {
  return (
    <section className="mb-4 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
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

function ActivitiesList({
  exercises,
  getIconForType,
  onSelectExercise,
  onDeleteExercise,
}: ActivitiesListProps) {
  return (
    <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <h2 className="mb-3 text-lg font-semibold text-slate-50">Activities</h2>

      <ExerciseSearch
        exercises={exerciseDatabase}
        addedExerciseIds={exercises.map((exercise) => exercise.id)}
        getIconForType={getIconForType}
        onSelectExercise={onSelectExercise}
      />

      <div className="max-h-[620px] space-y-2.5 overflow-auto pr-1">
        {exercises.length ? (
          exercises.map((exercise) => (
            <ActivityItem
              key={exercise.id}
              exercise={exercise}
              Icon={getIconForType(exercise.type)}
              onDelete={onDeleteExercise}
            />
          ))
        ) : (
          <p className="rounded-[10px] border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
            No activities selected for this day yet.
          </p>
        )}
      </div>
    </section>
  );
}

function ActivityDetails({
  activeDayLabel,
  selectedExercises,
  activeWorkout,
  onWorkoutVolumeChange,
  onWorkoutNoteChange,
  onApplyToWorkout,
}: ActivityDetailsProps) {
  const primaryExercise = selectedExercises[0];

  return (
    <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <h2 className="mb-3 text-lg font-semibold text-slate-50">Activity details</h2>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
        <div className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Active day</p>
          <p className="text-sm font-semibold text-slate-100">{activeDayLabel}</p>
        </div>
        <div className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Selected activities</p>
          <p className="text-sm font-semibold text-slate-100">{selectedExercises.length}</p>
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
          <label className="mb-1 block text-xs font-semibold text-slate-300">Primary activity</label>
          <p className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100">
            {primaryExercise?.name ?? "No activity selected"}
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
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>("search");
  const [statusMessage, setStatusMessage] = useState<string>(
    "Search from the exercise database and build your workout list.",
  );
  const [days, setDays] = useState<DayPlan[]>(() => createInitialDays());
  const [activeDayId, setActiveDayId] = useState<string>("day-1");
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([
    {
      id: "workout-1",
      name: "Bicep curl",
      volume: "12x 20 kg / 10x 22 kg",
      note: "Keep elbows close to your torso and avoid swinging.",
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

  const getIconForType = (type: ExerciseType): LucideIcon => EXERCISE_ICON_BY_TYPE[type];

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
      volume: "3 sets / 8 reps",
      note: "Add your focus and progression notes here.",
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
    setActiveDayId(nextDay.id);
    setStatusMessage(`${nextDay.label} added to your schedule.`);
  };

  const handleSelectExercise = (exercise: Exercise): void => {
    const alreadyAdded = activeDayExercises.some((activity) => activity.id === exercise.id);
    if (alreadyAdded) {
      setStatusMessage(`${exercise.name} is already in ${activeDay?.label ?? "this day"}.`);
      return;
    }

    setDays((prev) =>
      prev.map((day) =>
        day.id === activeDayId ? { ...day, exercises: [...day.exercises, exercise] } : day,
      ),
    );
    setStatusMessage(`${exercise.name} added to ${activeDay?.label ?? "current day"}.`);
  };

  const handleDeleteExercise = (exerciseId: number): void => {
    const deletedExercise = activeDayExercises.find((exercise) => exercise.id === exerciseId);
    if (!deletedExercise) {
      return;
    }

    setDays((prev) =>
      prev.map((day) =>
        day.id === activeDayId
          ? { ...day, exercises: day.exercises.filter((exercise) => exercise.id !== exerciseId) }
          : day,
      ),
    );
    setStatusMessage(`${deletedExercise.name} removed from ${activeDay?.label ?? "current day"}.`);
  };

  const handleApplySelectedActivities = (): void => {
    if (!activeDayExercises.length) {
      setStatusMessage("Add at least one exercise for the selected day first.");
      return;
    }

    const primaryActivity = activeDayExercises[0];
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === activeWorkoutId
          ? {
              ...workout,
              name: primaryActivity.name,
              volume: `${activeDayExercises.length} selected exercises`,
            }
          : workout,
      ),
    );
    setStatusMessage(
      `${activeDayExercises.length} activities linked to ${activeDay?.label ?? "selected day"}.`,
    );
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
          <aside className="hidden w-[78px] shrink-0 rounded-[14px] border border-white/12 bg-white/4 p-2.5 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px] lg:flex lg:flex-col lg:justify-between">
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
            <header className="mb-4 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px] md:p-5">
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
              <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
                <h2 className="mb-3 text-lg font-semibold text-slate-50">Workout image</h2>
                <div className="overflow-hidden rounded-[10px] border border-white/10">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                    alt="Gym training"
                    className="h-[250px] w-full object-cover md:h-[280px]"
                  />
                </div>
              </section>

              <ActivitiesList
                exercises={activeDayExercises}
                getIconForType={getIconForType}
                onSelectExercise={handleSelectExercise}
                onDeleteExercise={handleDeleteExercise}
              />

              <ActivityDetails
                activeDayLabel={activeDay?.label ?? "Day"}
                selectedExercises={activeDayExercises}
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

