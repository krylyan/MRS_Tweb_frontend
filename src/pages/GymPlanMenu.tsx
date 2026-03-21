import {
  CalendarCheck2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Grid3X3,
  Heart,
  Plus,
  Search,
  Trash2,
  Trophy,
  UserRoundPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

interface WorkoutSet {
  weight: number;
  reps: number;
}

interface PauseTime {
  minutes: number;
  seconds: number;
}

interface WorkoutTrackingState {
  pauseTime: PauseTime;
  sets: WorkoutSet[];
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
  selectedExerciseName: string | null;
  pauseTime: PauseTime;
  sets: WorkoutSet[];
  onPauseTimeChange: (value: PauseTime) => void;
  onSetChange: (index: number, field: keyof WorkoutSet, value: number) => void;
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
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

const DEFAULT_PAUSE_TIME: PauseTime = {
  minutes: 2,
  seconds: 0,
};

const DEFAULT_SET: WorkoutSet = {
  weight: 0,
  reps: 0,
};

const getExercisesByIds = (allExercises: Exercise[], ids: string[]): Exercise[] =>
  ids
    .map((id) => allExercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => !!exercise);

const createInitialWorkoutTrackingState = (): WorkoutTrackingState => ({
  pauseTime: { ...DEFAULT_PAUSE_TIME },
  sets: [{ ...DEFAULT_SET }],
});

const clampToNonNegativeInteger = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

const normalizePauseTime = (minutes: number, seconds: number): PauseTime => {
  const totalSeconds = Math.max(0, clampToNonNegativeInteger(minutes) * 60 + clampToNonNegativeInteger(seconds));

  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  };
};

const formatPauseTime = ({ minutes, seconds }: PauseTime): string =>
  `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

const parsePauseTimeInput = (value: string): PauseTime => {
  const sanitized = value.replace(/[^\d:]/g, "").trim();

  if (!sanitized) {
    return { ...DEFAULT_PAUSE_TIME };
  }

  const [rawMinutes = "", rawSeconds = ""] = sanitized.split(":", 2);
  const minutes = Number.parseInt(rawMinutes || "0", 10);
  const seconds = Number.parseInt(rawSeconds || "0", 10);

  if (!sanitized.includes(":")) {
    return normalizePauseTime(minutes, 0);
  }

  return normalizePauseTime(minutes, seconds);
};

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
  selectedExerciseName,
  pauseTime,
  sets,
  onPauseTimeChange,
  onSetChange,
  onAddSet,
  onRemoveSet,
}: ActivityDetailsProps) {
  const title = selectedExerciseName ?? "No exercise selected";
  const [pauseInput, setPauseInput] = useState<string>(formatPauseTime(pauseTime));
  const inputClassName =
    "h-10 w-full rounded-[10px] border border-white/20 bg-white/[0.03] px-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.2)]";
  const headerCellClassName = "text-[11px] font-semibold uppercase tracking-wide text-slate-400";

  useEffect(() => {
    setPauseInput(formatPauseTime(pauseTime));
  }, [pauseTime]);

  const commitPauseInput = (value: string): void => {
    const normalized = parsePauseTimeInput(value);
    onPauseTimeChange(normalized);
    setPauseInput(formatPauseTime(normalized));
  };

  const handlePauseInputChange = (value: string): void => {
    const sanitized = value.replace(/[^\d:]/g, "");
    const colonIndex = sanitized.indexOf(":");

    if (colonIndex === -1) {
      setPauseInput(sanitized.slice(0, 5));
      return;
    }

    const beforeColon = sanitized.slice(0, colonIndex).replace(/:/g, "");
    const afterColon = sanitized
      .slice(colonIndex + 1)
      .replace(/:/g, "")
      .slice(0, 2);

    setPauseInput(`${beforeColon}:${afterColon}`);
  };

  const handlePauseTimeStep = (deltaMinutes: number): void => {
    const nextPauseTime = normalizePauseTime(pauseTime.minutes + deltaMinutes, pauseTime.seconds);
    onPauseTimeChange(nextPauseTime);
    setPauseInput(formatPauseTime(nextPauseTime));
  };

  return (
    <section className="reveal-up reveal-delay-5 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <h2 className="mb-3 text-lg font-semibold text-slate-50">{title}</h2>

      <div className="mb-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-200">Pause between sets</h3>

        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={pauseInput}
            onChange={(event) => handlePauseInputChange(event.target.value)}
            onBlur={(event) => commitPauseInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
            placeholder="02:00"
            aria-label="Pause between sets"
            className={`${inputClassName} pr-10 text-center font-semibold tracking-wide`}
          />

          <div className="absolute inset-y-0 right-0 flex w-9 flex-col overflow-hidden rounded-r-[10px] border-l border-white/12">
            <button
              type="button"
              onClick={() => handlePauseTimeStep(1)}
              className="flex flex-1 items-center justify-center bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
              aria-label="Increase pause time by one minute"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handlePauseTimeStep(-1)}
              className="flex flex-1 items-center justify-center border-t border-white/12 bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
              aria-label="Decrease pause time by one minute"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Sets</h3>
          <span className="text-xs font-medium text-slate-400">{sets.length} tracked</span>
        </div>

        <div className="grid grid-cols-[56px_minmax(0,1fr)_88px_32px] items-center gap-2.5 px-1 pb-2">
          <p className={headerCellClassName}>Set</p>
          <p className={headerCellClassName}>Weight</p>
          <p className={headerCellClassName}>Reps</p>
          <span />
        </div>

        <div className="space-y-2.5">
          {sets.map((set, index) => (
            <div
              key={`set-${index}`}
              className="grid grid-cols-[56px_minmax(0,1fr)_88px_32px] items-center gap-2.5 rounded-[10px] border border-white/10 bg-white/[0.03] p-2.5"
            >
              <div className="flex h-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.02] text-sm font-semibold text-slate-100">
                {index + 1}
              </div>

              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={set.weight}
                  onChange={(event) => onSetChange(index, "weight", Number(event.target.value || 0))}
                  className={`${inputClassName} pr-9`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  kg
                </span>
              </div>

              <input
                type="number"
                min={0}
                step={1}
                value={set.reps}
                onChange={(event) => onSetChange(index, "reps", Number(event.target.value || 0))}
                className={`${inputClassName} text-center`}
              />

              <button
                type="button"
                onClick={() => onRemoveSet(index)}
                disabled={sets.length === 1}
                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[8px] text-slate-300 transition-all hover:bg-rose-500/15 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label={`Remove set ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAddSet}
          className="mt-4 flex w-fit items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-100 transition-all hover:bg-white/[0.08] mx-auto"
        >
          <Plus className="h-4 w-4" />
          Add set
        </button>
      </div>
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
  const [workoutTracking, setWorkoutTracking] = useState<WorkoutTrackingState>(() =>
    createInitialWorkoutTrackingState(),
  );

  const activeDay = useMemo<DayPlan | undefined>(
    () => days.find((day) => day.id === activeDayId),
    [days, activeDayId],
  );
  const activeDayExercises = activeDay?.exercises ?? [];
  const selectedExerciseId = selectedExerciseByDay[activeDayId] ?? null;
  const selectedExercise =
    activeDayExercises.find((exercise) => exercise.id === selectedExerciseId) ?? null;

  useEffect(() => {
    setWorkoutTracking(createInitialWorkoutTrackingState());
  }, [activeDayId, selectedExercise?.id]);

  const getIconForMuscleGroup = (muscleGroup: MuscleGroup): LucideIcon =>
    EXERCISE_ICON_BY_GROUP[muscleGroup];

  const handleSidebarAction = (item: SidebarItem): void => {
    setActiveSidebarItem(item.id);
    setStatusMessage(`${item.label} section activated.`);
  };

  const handleCreateWorkout = (): void => {
    setWorkoutTracking(createInitialWorkoutTrackingState());
    setStatusMessage(
      selectedExercise
        ? `${selectedExercise.name} is ready for a fresh set log.`
        : "New workout draft ready. Select an exercise to begin tracking sets.",
    );
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

  const handlePauseTimeChange = (value: PauseTime): void => {
    setWorkoutTracking((prev) => ({
      ...prev,
      pauseTime: normalizePauseTime(value.minutes, value.seconds),
    }));
  };

  const handleSetChange = (index: number, field: keyof WorkoutSet, value: number): void => {
    setWorkoutTracking((prev) => ({
      ...prev,
      sets: prev.sets.map((set, setIndex) => {
        if (setIndex !== index) {
          return set;
        }

        return {
          ...set,
          [field]:
            field === "weight"
              ? Math.max(0, Number.isFinite(value) ? value : 0)
              : clampToNonNegativeInteger(value),
        };
      }),
    }));
  };

  const handleAddSet = (): void => {
    setWorkoutTracking((prev) => {
      const lastSet = prev.sets[prev.sets.length - 1] ?? DEFAULT_SET;

      return {
        ...prev,
        sets: [...prev.sets, { weight: lastSet.weight, reps: lastSet.reps }],
      };
    });
  };

  const handleRemoveSet = (index: number): void => {
    setWorkoutTracking((prev) => {
      if (prev.sets.length === 1) {
        return prev;
      }

      return {
        ...prev,
        sets: prev.sets.filter((_, setIndex) => setIndex !== index),
      };
    });
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
                selectedExerciseName={selectedExercise?.name ?? null}
                pauseTime={workoutTracking.pauseTime}
                sets={workoutTracking.sets}
                onPauseTimeChange={handlePauseTimeChange}
                onSetChange={handleSetChange}
                onAddSet={handleAddSet}
                onRemoveSet={handleRemoveSet}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
