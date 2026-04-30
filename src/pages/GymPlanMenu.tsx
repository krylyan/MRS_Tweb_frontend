import {
  CalendarCheck2,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Grid3X3,
  Heart,
  Plus,
  Trash2,
  Trophy,
  UserRoundPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ActivitiesList from "../components/ActivitiesList";
import WorkoutPreview from "../components/WorkoutPreview";
import { exerciseService } from "../services/exerciseService";
import type { Exercise, MuscleGroup } from "../types/exercise";
import {
  createEmptyWorkoutPlan,
  getActivePlanId,
  getWorkoutPlanById,
  getWorkoutPlans,
  saveWorkoutPlan,
} from "../utils/planStorage";
import { getDateKey, isPlanDayCompleted, markPlanDayCompleted } from "../utils/planCompletion";
import type {
  PauseTime,
  StoredWorkoutPlan,
  WorkoutSet,
  WorkoutTrackingState,
} from "../utils/planStorage";

interface DayPlan {
  id: string;
  label: string;
  exercises: Exercise[];
}

interface DaysSelectorProps {
  days: DayPlan[];
  activeDayId: string;
  completedDayIds: string[];
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

const EXERCISE_ICON_BY_GROUP: Record<string, LucideIcon> = {
  chest: Trophy,
  back: CalendarCheck2,
  legs: Users,
  arms: UserRoundPlus,
  core: Grid3X3,
  cardio: Heart,
};

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

const createEmptyDays = (): DayPlan[] => [
  {
    id: "day-1",
    label: "Day 1",
    exercises: [],
  },
];

const createEmptySelectedExerciseMap = (): Record<string, string | null> => ({
  "day-1": null,
});

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

const hydrateDaysFromPlan = (plan: StoredWorkoutPlan, allExercises: Exercise[]): DayPlan[] => {
  const hydrated = plan.days.map((day) => ({
    id: day.id,
    label: day.label,
    exercises: getExercisesByIds(allExercises, day.exerciseIds),
  }));

  return hydrated.length ? hydrated : createEmptyDays();
};

const createStoredPlanPayload = (
  planId: string,
  planName: string,
  days: DayPlan[],
  selectedExerciseByDay: Record<string, string | null>,
  workoutTracking: WorkoutTrackingState,
  existingPlan?: StoredWorkoutPlan | null,
): StoredWorkoutPlan => {
  const timestamp = new Date().toISOString();

  return {
    id: planId,
    name: planName,
    createdAt: existingPlan?.createdAt ?? timestamp,
    updatedAt: timestamp,
    days: days.map((day) => ({
      id: day.id,
      label: day.label,
      exerciseIds: day.exercises.map((exercise) => exercise.id),
    })),
    selectedExerciseByDay: { ...selectedExerciseByDay },
    workoutTracking: {
      pauseTime: { ...workoutTracking.pauseTime },
      sets: workoutTracking.sets.map((set) => ({ ...set })),
    },
  };
};

function DaysSelector({ days, activeDayId, completedDayIds, onSelectDay, onAddDay }: DaysSelectorProps) {
  return (
    <section className="reveal-up reveal-delay-2 mb-4 rounded-[14px] border border-white/12 bg-white/4 px-4 py-3 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <div className="flex flex-wrap items-center gap-2.5">
        {days.map((day) => {
          const isActive = day.id === activeDayId;
          const isCompleted = completedDayIds.includes(day.id);
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`rounded-[10px] border px-4 py-2 text-sm font-semibold transition-colors ${
                isCompleted
                  ? "border-blue-300/45 bg-blue-500/25 text-blue-100 shadow-[0_0_16px_rgba(59,130,246,0.18)]"
                  : isActive
                  ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
                  : "border-white/10 bg-white/[0.02] text-slate-200 hover:bg-white/[0.08]"
              }`}
            >
              {day.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onAddDay}
          className="flex items-center gap-1.5 rounded-[10px] border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:border-emerald-400/30 hover:bg-emerald-500/10 hover:text-emerald-200"
        >
          <Plus className="h-4 w-4" />
          Add Day
        </button>
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
  const spinnerInputClassName =
    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
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

  const handleSetStep = (index: number, field: keyof WorkoutSet, delta: number): void => {
    const currentValue = sets[index]?.[field] ?? 0;
    onSetChange(index, field, Math.max(0, currentValue + delta));
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
                  className={`${inputClassName} ${spinnerInputClassName} pr-16`}
                />
                <span className="pointer-events-none absolute right-11 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  kg
                </span>
                <div className="absolute inset-y-0 right-0 flex w-9 flex-col overflow-hidden rounded-r-[10px] border-l border-white/12">
                  <button
                    type="button"
                    onClick={() => handleSetStep(index, "weight", 0.5)}
                    className="flex flex-1 items-center justify-center bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
                    aria-label={`Increase weight for set ${index + 1}`}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetStep(index, "weight", -0.5)}
                    className="flex flex-1 items-center justify-center border-t border-white/12 bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
                    aria-label={`Decrease weight for set ${index + 1}`}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={set.reps}
                  onChange={(event) => onSetChange(index, "reps", Number(event.target.value || 0))}
                  className={`${inputClassName} ${spinnerInputClassName} pr-10 text-center`}
                />
                <div className="absolute inset-y-0 right-0 flex w-9 flex-col overflow-hidden rounded-r-[10px] border-l border-white/12">
                  <button
                    type="button"
                    onClick={() => handleSetStep(index, "reps", 1)}
                    className="flex flex-1 items-center justify-center bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
                    aria-label={`Increase reps for set ${index + 1}`}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetStep(index, "reps", -1)}
                    className="flex flex-1 items-center justify-center border-t border-white/12 bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
                    aria-label={`Decrease reps for set ${index + 1}`}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const allExercises = useMemo(() => exerciseService.getAllExercises(), []);
  const planId = searchParams.get("planId");
  const activeWorkoutPlanId = getActivePlanId();
  const completionDateKey = getDateKey(searchParams.get("date"));
  const isNewDraft = searchParams.get("new") === "1";
  const [planName, setPlanName] = useState<string>("");
  const [, setStatusMessage] = useState<string>("");
  const [days, setDays] = useState<DayPlan[]>(() => createEmptyDays());
  const [activeDayId, setActiveDayId] = useState<string>("day-1");
  const [selectedExerciseByDay, setSelectedExerciseByDay] = useState<Record<string, string | null>>(
    createEmptySelectedExerciseMap,
  );
  const [workoutTracking, setWorkoutTracking] = useState<WorkoutTrackingState>(() =>
    createInitialWorkoutTrackingState(),
  );
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [hasLoadedPlan, setHasLoadedPlan] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [completionVersion, setCompletionVersion] = useState(0);
  const loadSettledRef = useRef<boolean>(false);

  useEffect(() => {
    if (!planId && !isNewDraft) {
      const availablePlans = getWorkoutPlans();
      const fallbackPlan = availablePlans[0];

      navigate(fallbackPlan ? `/gym-plan?planId=${fallbackPlan.id}` : "/gym-plan?new=1", {
        replace: true,
      });
      return;
    }

    loadSettledRef.current = false;
    setIsDirty(false);

    if (planId) {
      const storedPlan = getWorkoutPlanById(planId);

      if (!storedPlan) {
        navigate("/plans", { replace: true });
        return;
      }

      const hydratedDays = hydrateDaysFromPlan(storedPlan, allExercises);
      setPlanName(storedPlan.name);
      setDays(hydratedDays);
      setActiveDayId(hydratedDays[0]?.id ?? "day-1");
      setSelectedExerciseByDay({
        ...createEmptySelectedExerciseMap(),
        ...storedPlan.selectedExerciseByDay,
      });
      setWorkoutTracking({
        pauseTime: { ...storedPlan.workoutTracking.pauseTime },
        sets: storedPlan.workoutTracking.sets.map((set) => ({ ...set })),
      });
      setIsEditorReady(true);
      setHasLoadedPlan(true);
      return;
    }

    if (isNewDraft) {
      setPlanName("");
      setDays(createEmptyDays());
      setActiveDayId("day-1");
      setSelectedExerciseByDay(createEmptySelectedExerciseMap());
      setWorkoutTracking(createInitialWorkoutTrackingState());
      setIsEditorReady(false);
      setHasLoadedPlan(true);
    }
  }, [allExercises, isNewDraft, navigate, planId]);

  const activeDay = useMemo<DayPlan | undefined>(
    () => days.find((day) => day.id === activeDayId),
    [days, activeDayId],
  );
  const activeDayExercises = activeDay?.exercises ?? [];
  const selectedExerciseId = selectedExerciseByDay[activeDayId] ?? null;
  const selectedExercise =
    activeDayExercises.find((exercise) => exercise.id === selectedExerciseId) ?? null;
  const canMarkCompleted = Boolean(planId && planId === activeWorkoutPlanId);
  const completedDayIds = useMemo(
    () =>
      planId
        ? days
            .filter((day) => isPlanDayCompleted("workout", planId, day.id, completionDateKey))
            .map((day) => day.id)
        : [],
    [completionDateKey, completionVersion, days, planId],
  );
  const isCompletedForDate = useMemo(
    () =>
      canMarkCompleted && planId
        ? isPlanDayCompleted("workout", planId, activeDayId, completionDateKey)
        : false,
    [activeDayId, canMarkCompleted, completionDateKey, completionVersion, planId],
  );

  // Track unsaved changes — skip the first run after the plan loads
  useEffect(() => {
    if (!hasLoadedPlan) return;
    if (!loadSettledRef.current) {
      loadSettledRef.current = true;
      return;
    }
    setIsDirty(true);
  }, [planName, days, workoutTracking, hasLoadedPlan]);

  const getIconForMuscleGroup = (muscleGroup: MuscleGroup): LucideIcon =>
    EXERCISE_ICON_BY_GROUP[muscleGroup] ?? Dumbbell;

  const handlePlanNameChange = (value: string): void => {
    setPlanName(value);
  };

  const handleSavePlan = (): void => {
    if (!planId || !isEditorReady) return;
    const existingPlan = getWorkoutPlanById(planId);
    if (!existingPlan) return;
    saveWorkoutPlan(
      createStoredPlanPayload(planId, planName, days, selectedExerciseByDay, workoutTracking, existingPlan),
    );
    setIsDirty(false);
  };

  const handleMarkCompleted = (): void => {
    if (!planId || !canMarkCompleted) return;
    markPlanDayCompleted("workout", planId, activeDayId, completionDateKey);
    setCompletionVersion((current) => current + 1);
  };

  const handleActivatePlan = (): void => {
    const trimmedName = planName.trim();

    if (!trimmedName) {
      setStatusMessage("Add the workout name before continuing.");
      return;
    }

    const createdPlan = saveWorkoutPlan(
      createStoredPlanPayload(
        createEmptyWorkoutPlan(trimmedName).id,
        trimmedName,
        days,
        selectedExerciseByDay,
        workoutTracking,
      ),
    );

    setIsEditorReady(true);
    setStatusMessage(`${trimmedName} created. You can now build the full workout plan.`);
    navigate(`/gym-plan?planId=${createdPlan.id}`, { replace: true });
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
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-8">
        <div>
          <div className="w-full">
            <header className="reveal-up reveal-delay-1 mb-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={planName}
                    onChange={(event) => handlePlanNameChange(event.target.value)}
                    placeholder="Untitled Workout"
                    className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-3xl font-bold text-slate-50 outline-none transition-all placeholder:text-slate-500 focus:border-emerald-400/80 focus:shadow-[0_0_16px_rgba(16,185,129,0.15)] sm:px-4 sm:text-4xl"
                  />
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {!isEditorReady ? (
                    <button
                      type="button"
                      onClick={handleActivatePlan}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 transition-all hover:bg-emerald-500/25"
                    >
                      Unlock editor
                    </button>
                  ) : (
                    <>
                      {canMarkCompleted ? (
                        <button
                          type="button"
                          onClick={handleMarkCompleted}
                          disabled={isCompletedForDate}
                          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                            isCompletedForDate
                              ? "cursor-default border-emerald-300/30 bg-emerald-500/15 text-emerald-200"
                              : "border-cyan-300/25 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"
                          }`}
                      >
                        {isCompletedForDate ? <Check className="h-4 w-4" /> : null}
                          {isCompletedForDate ? "Day completed" : "Mark day completed"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleSavePlan}
                        disabled={!isDirty}
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                          isDirty
                            ? "scale-100 border-emerald-400/50 bg-emerald-500/20 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.25)] hover:bg-emerald-500/30 hover:shadow-[0_0_24px_rgba(16,185,129,0.35)]"
                            : "scale-95 cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
                        }`}
                      >
                        Save Changes
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!isEditorReady ? (
                <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  Start by adding the workout name. After that, the full Gym Workout Plan editor unlocks.
                </p>
              ) : null}
            </header>

            <div className={isEditorReady ? "" : "pointer-events-none opacity-40 select-none"}>
              <DaysSelector
                days={days}
                activeDayId={activeDayId}
                completedDayIds={completedDayIds}
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
      </div>
    </main>
  );
}
