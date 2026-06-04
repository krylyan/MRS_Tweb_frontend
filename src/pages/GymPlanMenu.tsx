import {
  CalendarCheck2,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Grid3X3,
  Heart,
  Loader2,
  Moon,
  Plus,
  Save,
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
import { workoutPlanApi } from "../services/workoutPlanApi";
import type { WorkoutPlanApi } from "../services/workoutPlanApi";
import { planActivationApi } from "../services/planActivationApi";
import type { PlanActivationApi } from "../services/planActivationApi";
import { planCompletionApi } from "../services/planCompletionApi";
import type { PlanCompletionResponseDto } from "../services/planCompletionApi";
import type { Exercise, MuscleGroup } from "../types/exercise";
import { getDateKey } from "../utils/planCompletion";

interface WorkoutSet {
  weight: number;
  reps: number;
}

interface PauseTime {
  minutes: number;
  seconds: number;
}

interface DayPlan {
  id: string;
  label: string;
  exercises: Exercise[];
  isRestDay?: boolean;
}

interface WorkoutPlanValidationResult {
  isValid: boolean;
  message?: string;
  dayId?: string;
  exerciseId?: string | number;
}

interface DaysSelectorProps {
  days: DayPlan[];
  activeDayId: string;       // currently selected/viewed day (tab)
  todayPlanDayId: string;    // the day that maps to TODAY in the cycle
  completedDayIds: string[];
  restDayIds: string[];
  onSelectDay: (day: DayPlan) => void;
}

interface ActivityDetailsProps {
  selectedExerciseName: string | null;
  pauseTime: PauseTime;
  sets: WorkoutSet[];
  isRestDay: boolean;
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
  reps: 1,
};

const WORKOUT_DAY_COUNT = 7;

const createEmptyDays = (): DayPlan[] =>
  Array.from({ length: WORKOUT_DAY_COUNT }, (_, index) => ({
    id: `day-${index + 1}`,
    label: `Day ${index + 1}`,
    exercises: [],
    isRestDay: false,
  }));

const createEmptySelectedExerciseMap = (): Record<string, string | null> =>
  Object.fromEntries(createEmptyDays().map((day) => [day.id, null]));

const clampToNonNegativeInteger = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

const clampToPositiveInteger = (value: number): number =>
  Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;

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

const getPlanExerciseKey = (dayId: string, exerciseId: string | number): string =>
  `${dayId}:${exerciseId}`;

const getPlanDayToken = (planIdentifier: string, activationId: number, dayId: string): string =>
  `${planIdentifier}:${activationId}:${dayId}`;

const normalizeWorkoutSetForApi = (set: WorkoutSet, order: number) => ({
  order,
  weight: Math.min(1000, clampToNonNegativeInteger(set.weight)),
  reps: Math.min(500, clampToPositiveInteger(set.reps)),
});

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDaysToDateKey = (dateKey: string, days: number): string => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return getDateKey(date);
};

const daysBetween = (startKey: string, endKey: string): number =>
  Math.round((parseDateKey(endKey).getTime() - parseDateKey(startKey).getTime()) / 86_400_000);

const getActivationStartKey = (activation: PlanActivationApi): string =>
  activation.lastCycleResetAt ?? activation.activatedAt;

const getScheduledDayForDate = (activation: PlanActivationApi, dateKey: string) => {
  const startKey = getActivationStartKey(activation);
  const diff = Math.max(0, daysBetween(startKey, dateKey));
  const totalDays = Math.max(1, activation.totalDays || WORKOUT_DAY_COUNT);
  const cycleOffset = Math.floor(diff / totalDays) * totalDays;
  const dayNumber = (diff % totalDays) + 1;

  return {
    dayId: `day-${dayNumber}`,
    dayNumber,
    cycleNumber: Math.floor(diff / totalDays) + 1,
    cycleStartKey: addDaysToDateKey(startKey, cycleOffset),
  };
};

const getScheduledDateForDayInCycle = (
  activation: PlanActivationApi,
  dayId: string,
  referenceDateKey: string,
): string => {
  const todaySchedule = getScheduledDayForDate(activation, referenceDateKey);
  const dayNumber = Number.parseInt(dayId.replace("day-", ""), 10) || 1;
  return addDaysToDateKey(todaySchedule.cycleStartKey, dayNumber - 1);
};

const createDaysFromApiPlan = (plan: WorkoutPlanApi): DayPlan[] => {
  const hydrated = plan.days.slice(0, WORKOUT_DAY_COUNT).map((day, index) => ({
    id: `day-${day.dayNumber || index + 1}`,
    label: day.label || `Day ${index + 1}`,
    isRestDay: Boolean(day.isRestDay),
    exercises: (day.dayExercises?.length ? day.dayExercises.map((item) => item.exercise) : day.exercises).map(
      (exercise) => ({
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup as MuscleGroup,
        gifUrl: exercise.gifUrl ?? "",
        instructions: exercise.instructions ?? "",
      }),
    ),
  }));

  const byId = new Map(hydrated.map((day) => [day.id, day]));

  return createEmptyDays().map((emptyDay) => byId.get(emptyDay.id) ?? emptyDay);
};

const createSelectedExerciseMapFromDays = (days: DayPlan[]): Record<string, string | null> =>
  Object.fromEntries(days.map((day) => [day.id, day.exercises[0] ? String(day.exercises[0].id) : null]));

const createSetsByExerciseFromApiPlan = (plan: WorkoutPlanApi): Record<string, WorkoutSet[]> => {
  const entries = plan.days.flatMap((day, index) => {
    const dayId = `day-${day.dayNumber || index + 1}`;
    return (day.dayExercises ?? []).map((item) => [
      getPlanExerciseKey(dayId, item.exerciseId),
      item.sets.length
        ? item.sets.map((set) => ({ weight: set.weight, reps: set.reps }))
        : [{ ...DEFAULT_SET }],
    ] as const);
  });

  return Object.fromEntries(entries);
};

const createPauseByExerciseFromApiPlan = (plan: WorkoutPlanApi): Record<string, PauseTime> => {
  const fallbackPause = plan.workoutTracking?.pauseTime ?? DEFAULT_PAUSE_TIME;
  const entries = plan.days.flatMap((day, index) => {
    const dayId = `day-${day.dayNumber || index + 1}`;
    return (day.dayExercises ?? []).map((item) => [
      getPlanExerciseKey(dayId, item.exerciseId),
      item.pauseTime ?? fallbackPause,
    ] as const);
  });

  return Object.fromEntries(entries);
};

const validateWorkoutPlanForSave = (
  days: DayPlan[],
  setsByExercise: Record<string, WorkoutSet[]>,
): WorkoutPlanValidationResult => {
  for (const day of days) {
    if (day.isRestDay) {
      continue;
    }

    for (const exercise of day.exercises) {
      const sets = setsByExercise[getPlanExerciseKey(day.id, exercise.id)] ?? [];

      if (!sets.length) {
        return {
          isValid: false,
          message: `${exercise.name} from ${day.label} needs at least one set before saving.`,
          dayId: day.id,
          exerciseId: exercise.id,
        };
      }

      const invalidSetIndex = sets.findIndex((set) => !Number.isFinite(set.reps) || set.reps < 1);

      if (invalidSetIndex >= 0) {
        return {
          isValid: false,
          message: `${exercise.name} from ${day.label} has an invalid set. Reps must be at least 1.`,
          dayId: day.id,
          exerciseId: exercise.id,
        };
      }
    }
  }

  return { isValid: true };
};

const createPlanPayload = (
  planName: string,
  days: DayPlan[],
  setsByExercise: Record<string, WorkoutSet[]>,
  pauseByExercise: Record<string, PauseTime>,
) => ({
  name: planName.trim(),
  days: days.map((day, dayIndex) => {
    const exercises = day.isRestDay
      ? []
      : day.exercises.flatMap((exercise, exerciseIndex) => {
          const exerciseId = Number(exercise.id);

          if (!Number.isInteger(exerciseId) || exerciseId <= 0) {
            return [];
          }

          return [{
            exerciseId,
            order: exerciseIndex,
            pauseTime: pauseByExercise[getPlanExerciseKey(day.id, exercise.id)] ?? { ...DEFAULT_PAUSE_TIME },
            sets: (setsByExercise[getPlanExerciseKey(day.id, exercise.id)] ?? [{ ...DEFAULT_SET }]).map(
              normalizeWorkoutSetForApi,
            ),
          }];
        });

    return {
      label: day.label,
      dayNumber: dayIndex + 1,
      isRestDay: Boolean(day.isRestDay),
      exerciseIds: exercises.map((exercise) => exercise.exerciseId),
      exercises,
    };
  }),
});

function DaysSelector({ days, activeDayId, todayPlanDayId, completedDayIds, restDayIds, onSelectDay }: DaysSelectorProps) {
  return (
    <section className="reveal-up reveal-delay-2 mb-4 rounded-[14px] border border-white/12 bg-white/4 px-4 py-3 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <div className="flex w-full items-center gap-1.5">
        {days.map((day) => {
          const isSelected = day.id === activeDayId;
          const isToday = day.id === todayPlanDayId;
          const isCompleted = completedDayIds.includes(day.id);
          const isRest = restDayIds.includes(day.id);

          let className = "flex-1 min-w-0 rounded-[10px] border px-2 py-2 text-sm font-semibold transition-colors text-center ";
          if (isToday) {
            className += "border-blue-400/50 bg-blue-500/25 text-blue-100 shadow-[0_0_16px_rgba(59,130,246,0.22)] hover:bg-blue-500/30";
          } else if (isRest && isSelected) {
            className += "border-violet-400/60 bg-violet-500/20 text-violet-200 hover:bg-violet-500/25";
          } else if (isRest) {
            className += "border-violet-400/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/15";
          } else if (isCompleted) {
            className += "border-rose-400/60 bg-rose-500/10 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.15)] hover:bg-rose-500/15";
          } else if (isSelected) {
            className += "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/25";
          } else {
            className += "border-white/10 bg-white/[0.02] text-slate-200 hover:bg-white/[0.08]";
          }

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day)}
              className={className}
              title={isRest ? `${day.label} — Rest Day` : day.label}
            >
              <span className="block truncate">{isRest ? "Rest" : day.label}</span>
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
  isRestDay,
  onPauseTimeChange,
  onSetChange,
  onAddSet,
  onRemoveSet,
}: ActivityDetailsProps) {
  const title = selectedExerciseName ?? "No exercise selected";
  const [pauseInput, setPauseInput] = useState<string>(formatPauseTime(pauseTime));
  const [weightInputs, setWeightInputs] = useState<string[]>(() => sets.map((s) => String(s.weight)));
  const [repsInputs, setRepsInputs] = useState<string[]>(() => sets.map((s) => String(s.reps)));
  const inputClassName =
    "h-10 w-full rounded-[10px] border border-white/20 bg-white/[0.03] px-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.2)]";
  const spinnerInputClassName =
    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
  const headerCellClassName = "text-[11px] font-semibold uppercase tracking-wide text-slate-400";

  useEffect(() => {
    setPauseInput(formatPauseTime(pauseTime));
  }, [pauseTime]);

  useEffect(() => {
    setWeightInputs(sets.map((s) => String(s.weight)));
    setRepsInputs(sets.map((s) => String(s.reps)));
  }, [sets.length]);

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
    const next = Math.max(0, currentValue + delta);
    onSetChange(index, field, next);
    if (field === "weight") {
      setWeightInputs((prev) => prev.map((v, i) => (i === index ? String(next) : v)));
    } else {
      setRepsInputs((prev) => prev.map((v, i) => (i === index ? String(next) : v)));
    }
  };

  return (
    <section className="reveal-up reveal-delay-5 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      {/* Content faded when Rest Day */}
      <div className={isRestDay ? "pointer-events-none select-none opacity-40" : ""}>
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
                    type="text"
                    inputMode="decimal"
                    value={weightInputs[index] ?? String(set.weight)}
                    onChange={(event) => {
                      const raw = event.target.value.replace(/[^\d.]/g, "");
                      setWeightInputs((prev) => prev.map((v, i) => (i === index ? raw : v)));
                    }}
                    onBlur={() => {
                      const parsed = Math.max(0, Number(weightInputs[index] ?? "") || 0);
                      onSetChange(index, "weight", parsed);
                      setWeightInputs((prev) => prev.map((v, i) => (i === index ? String(parsed) : v)));
                    }}
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
                    type="text"
                    inputMode="numeric"
                    value={repsInputs[index] ?? String(set.reps)}
                    onChange={(event) => {
                      const raw = event.target.value.replace(/[^\d]/g, "");
                      setRepsInputs((prev) => prev.map((v, i) => (i === index ? raw : v)));
                    }}
                    onBlur={() => {
                      const parsed = Math.max(0, Math.floor(Number(repsInputs[index] ?? "") || 0));
                      onSetChange(index, "reps", parsed);
                      setRepsInputs((prev) => prev.map((v, i) => (i === index ? String(parsed) : v)));
                    }}
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

          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={onAddSet}
              className="flex items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-100 transition-all hover:bg-white/[0.08]"
            >
              <Plus className="h-4 w-4" />
              Add set
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function GymPlanMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  const urlDayId = searchParams.get("dayId");
  const completionDateKey = getDateKey(searchParams.get("date"));
  const isNewDraft = searchParams.get("new") === "1";
  const [activeWorkoutPlanId, setActiveWorkoutPlanId] = useState<string | null>(null);
  const [activeWorkoutActivation, setActiveWorkoutActivation] = useState<PlanActivationApi | null>(null);
  const [planName, setPlanName] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [days, setDays] = useState<DayPlan[]>(() => createEmptyDays());
  const [activeDayId, setActiveDayId] = useState<string>("day-1");
  const [selectedExerciseByDay, setSelectedExerciseByDay] = useState<Record<string, string | null>>(
    createEmptySelectedExerciseMap,
  );
  const [setsByExercise, setSetsByExercise] = useState<Record<string, WorkoutSet[]>>({});
  const [pauseByExercise, setPauseByExercise] = useState<Record<string, PauseTime>>({});
  const [restDayIds, setRestDayIds] = useState<string[]>([]);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [hasLoadedPlan, setHasLoadedPlan] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [completionVersion, setCompletionVersion] = useState(0);
  const [workoutCompletions, setWorkoutCompletions] = useState<PlanCompletionResponseDto[]>([]);
  const loadSettledRef = useRef<boolean>(false);
  const suppressNextDirtyRef = useRef<boolean>(false);
  // Map name_lowercase → apiId numeric, construit din GET /api/exercise
  useEffect(() => {
    planActivationApi.getActive("Workout").then((activation) => {
      setActiveWorkoutActivation(activation);
      setActiveWorkoutPlanId(activation?.planIdentifier ?? null);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    planCompletionApi.getByUser("Workout").then((completions) => {
      if (!cancelled) {
        setWorkoutCompletions(completions);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [completionVersion]);

  useEffect(() => {
    let cancelled = false;

    const loadPlan = async (): Promise<void> => {
      if (!planId && !isNewDraft) {
        const availablePlans = await workoutPlanApi.getMyPlanSummaries();
        if (cancelled) return;
        const fallbackPlan = availablePlans[0];

        navigate(fallbackPlan ? `/gym-plan?planId=${fallbackPlan.id}` : "/gym-plan?new=1", {
          replace: true,
        });
        return;
      }

      loadSettledRef.current = false;
      setIsDirty(false);

      if (planId) {
        const apiPlan = Number.isFinite(Number(planId))
          ? await workoutPlanApi.getById(Number(planId))
          : null;
        if (cancelled) return;

        if (!apiPlan) {
          navigate("/plans", { replace: true });
          return;
        }

        const hydratedDays = createDaysFromApiPlan(apiPlan);
        const targetDayId = urlDayId && hydratedDays.some((d) => d.id === urlDayId)
          ? urlDayId
          : hydratedDays[0]?.id ?? "day-1";

        setPlanName(apiPlan.name);
        setDays(hydratedDays);
        setRestDayIds(hydratedDays.filter((day) => day.isRestDay).map((day) => day.id));
        setActiveDayId(targetDayId);
        setSelectedExerciseByDay(createSelectedExerciseMapFromDays(hydratedDays));
        setSetsByExercise(createSetsByExerciseFromApiPlan(apiPlan));
        setPauseByExercise(createPauseByExerciseFromApiPlan(apiPlan));
        setIsEditorReady(true);
        setHasLoadedPlan(true);
        return;
      }

      if (isNewDraft) {
        setPlanName("");
        setDays(createEmptyDays());
        setRestDayIds([]);
        setActiveDayId("day-1");
        setSelectedExerciseByDay(createEmptySelectedExerciseMap());
        setSetsByExercise({});
        setPauseByExercise({});
        setIsEditorReady(false);
        setHasLoadedPlan(true);
      }
    };

    loadPlan();

    return () => {
      cancelled = true;
    };
  }, [isNewDraft, navigate, planId, urlDayId]);

  const activeDay = useMemo<DayPlan | undefined>(
    () => days.find((day) => day.id === activeDayId),
    [days, activeDayId],
  );
  const activeDayExercises = activeDay?.exercises ?? [];
  const selectedExerciseId = selectedExerciseByDay[activeDayId] ?? null;
  const selectedExercise =
    activeDayExercises.find((exercise) => String(exercise.id) === String(selectedExerciseId)) ?? null;
  const selectedExerciseSets = selectedExercise
    ? setsByExercise[getPlanExerciseKey(activeDayId, selectedExercise.id)] ?? [{ ...DEFAULT_SET }]
    : [{ ...DEFAULT_SET }];
  const selectedExercisePause = selectedExercise
    ? pauseByExercise[getPlanExerciseKey(activeDayId, selectedExercise.id)] ?? { ...DEFAULT_PAUSE_TIME }
    : { ...DEFAULT_PAUSE_TIME };
  const todayKey = getDateKey();

  const todayPlanDayId = useMemo(() => {
    if (!planId || planId !== activeWorkoutPlanId || !activeWorkoutActivation) return "";
    return getScheduledDayForDate(activeWorkoutActivation, todayKey).dayId;
  }, [activeWorkoutActivation, activeWorkoutPlanId, planId, todayKey]);

  const completedDayIds = useMemo(() => {
    if (!planId || !activeWorkoutActivation || planId !== activeWorkoutPlanId) return [];

    return days
      .filter((day) => {
        const scheduledDate = getScheduledDateForDayInCycle(activeWorkoutActivation, day.id, todayKey);
        return workoutCompletions.some(
          (completion) =>
            completion.dayToken === getPlanDayToken(planId, activeWorkoutActivation.id, day.id) &&
            completion.dateKey === scheduledDate,
        );
      })
      .map((day) => day.id);
  }, [activeWorkoutActivation, activeWorkoutPlanId, days, planId, todayKey, workoutCompletions]);

  const canMarkCompleted = Boolean(
    planId &&
    activeWorkoutActivation &&
    planId === activeWorkoutPlanId &&
    activeDayId === todayPlanDayId &&
    completionDateKey === todayKey,
  );

  const isCompletedForDate = useMemo(
    () => {
      if (!canMarkCompleted || !planId || !activeWorkoutActivation) return false;
      return workoutCompletions.some(
        (completion) =>
          completion.dayToken === getPlanDayToken(planId, activeWorkoutActivation.id, activeDayId) &&
          completion.dateKey === todayKey,
      );
    },
    [activeDayId, activeWorkoutActivation, canMarkCompleted, planId, todayKey, workoutCompletions],
  );

  // Track unsaved changes — skip the first run after the plan loads
  useEffect(() => {
    if (!hasLoadedPlan) return;
    if (!loadSettledRef.current) {
      loadSettledRef.current = true;
      return;
    }
    if (suppressNextDirtyRef.current) {
      suppressNextDirtyRef.current = false;
      return;
    }
    setSaveState("idle");
    setIsDirty(true);
  }, [planName, days, setsByExercise, pauseByExercise, restDayIds, hasLoadedPlan]);

  const getIconForMuscleGroup = (muscleGroup: MuscleGroup): LucideIcon =>
    EXERCISE_ICON_BY_GROUP[muscleGroup] ?? Dumbbell;

  const showSaveValidationError = (validation: WorkoutPlanValidationResult): void => {
    setSaveState("error");
    setStatusMessage(validation.message ?? "The workout plan is not ready to save.");

    if (validation.dayId) {
      setActiveDayId(validation.dayId);
    }

    if (validation.dayId && validation.exerciseId !== undefined) {
      setSelectedExerciseByDay((prev) => ({
        ...prev,
        [validation.dayId as string]: String(validation.exerciseId),
      }));
    }
  };

  const handlePlanNameChange = (value: string): void => {
    setPlanName(value);
  };

  const saveCurrentPlan = async (): Promise<boolean> => {
    if (!planId || !isEditorReady || saveState === "saving") return false;

    const validation = validateWorkoutPlanForSave(days, setsByExercise);
    if (!validation.isValid) {
      showSaveValidationError(validation);
      return false;
    }

    setSaveState("saving");
    const payload = createPlanPayload(planName, days, setsByExercise, pauseByExercise);
    const savedPlan = await workoutPlanApi.update(Number(planId), payload.name, payload.days);

    if (savedPlan) {
      const hydratedDays = createDaysFromApiPlan(savedPlan);
      suppressNextDirtyRef.current = true;
      setPlanName(savedPlan.name);
      setDays(hydratedDays);
      setRestDayIds(hydratedDays.filter((day) => day.isRestDay).map((day) => day.id));
      setSetsByExercise(createSetsByExerciseFromApiPlan(savedPlan));
      setPauseByExercise(createPauseByExerciseFromApiPlan(savedPlan));
      setSelectedExerciseByDay(createSelectedExerciseMapFromDays(hydratedDays));
      setIsDirty(false);
      setSaveState("saved");
      window.setTimeout(() => setSaveState((current) => (current === "saved" ? "idle" : current)), 1800);
      return true;
    }

    setSaveState("error");
    setStatusMessage("The workout plan could not be saved in the database.");
    return false;
  };

  const handleSavePlan = async (): Promise<void> => {
    await saveCurrentPlan();
  };

  const handleCompleteWorkout = async (): Promise<void> => {
    if (!planId || !canMarkCompleted || !activeWorkoutActivation) return;

    if (isDirty) {
      const saved = await saveCurrentPlan();
      if (!saved) return;
    }

    const completed = await planCompletionApi.markComplete({
      planType: "Workout",
      dayToken: getPlanDayToken(planId, activeWorkoutActivation.id, activeDayId),
      dateKey: todayKey,
    });

    if (completed) {
      setCompletionVersion((current) => current + 1);
    }
  };

  const handleActivatePlan = async (): Promise<void> => {
    const trimmedName = planName.trim();

    if (!trimmedName) {
      setSaveState("error");
      setStatusMessage("Add the workout name before continuing.");
      return;
    }

    const validation = validateWorkoutPlanForSave(days, setsByExercise);
    if (!validation.isValid) {
      showSaveValidationError(validation);
      return;
    }

    const payload = createPlanPayload(trimmedName, days, setsByExercise, pauseByExercise);
    const apiPlan = await workoutPlanApi.create(trimmedName, payload.days);

    if (!apiPlan) {
      setSaveState("error");
      setStatusMessage("The workout plan could not be saved in the database.");
      return;
    }

    const hydratedDays = createDaysFromApiPlan(apiPlan);
    setPlanName(apiPlan.name);
    setDays(hydratedDays);
    setRestDayIds(hydratedDays.filter((day) => day.isRestDay).map((day) => day.id));
    setSelectedExerciseByDay(createSelectedExerciseMapFromDays(hydratedDays));
    setSetsByExercise(createSetsByExerciseFromApiPlan(apiPlan));
    setPauseByExercise(createPauseByExerciseFromApiPlan(apiPlan));
    setIsEditorReady(true);
    setIsDirty(false);
    setStatusMessage(`${trimmedName} created. You can now build the full workout plan.`);
    navigate(`/gym-plan?planId=${apiPlan.id}`, { replace: true });
  };

  const handleSelectDay = (day: DayPlan): void => {
    setActiveDayId(day.id);
    setStatusMessage(`${day.label} selected.`);
  };

  const handleSelectExercise = (exercise: Exercise): void => {
    const existsInActiveDay = activeDayExercises.some((item) => item.id === exercise.id);
    if (!existsInActiveDay) {
      return;
    }

    setSelectedExerciseByDay((prev) => ({ ...prev, [activeDayId]: String(exercise.id) }));
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
      setSetsByExercise((prev) => ({
        ...prev,
        [getPlanExerciseKey(activeDayId, exercise.id)]: [{ ...DEFAULT_SET }],
      }));
      setPauseByExercise((prev) => ({
        ...prev,
        [getPlanExerciseKey(activeDayId, exercise.id)]: { ...DEFAULT_PAUSE_TIME },
      }));
      setStatusMessage(`${exercise.name} added to ${activeDay?.label ?? "current day"}.`);
    } else {
      setStatusMessage(`${exercise.name} is already in ${activeDay?.label ?? "current day"}.`);
    }

    setSelectedExerciseByDay((prev) => ({ ...prev, [activeDayId]: String(exercise.id) }));
  };

  const handleDeleteExerciseFromActiveDay = (exerciseId: string | number): void => {
    const deletedExercise = activeDayExercises.find((exercise) => String(exercise.id) === String(exerciseId));
    if (!deletedExercise) {
      return;
    }

    const remainingExercises = activeDayExercises.filter((exercise) => String(exercise.id) !== String(exerciseId));

    setDays((prev) =>
      prev.map((day) =>
        day.id === activeDayId ? { ...day, exercises: remainingExercises } : day,
      ),
    );

    setSelectedExerciseByDay((prev) => {
      if (prev[activeDayId] !== String(exerciseId)) {
        return prev;
      }
      return { ...prev, [activeDayId]: remainingExercises[0] ? String(remainingExercises[0].id) : null };
    });
    setSetsByExercise((prev) => {
      const next = { ...prev };
      delete next[getPlanExerciseKey(activeDayId, exerciseId)];
      return next;
    });
    setPauseByExercise((prev) => {
      const next = { ...prev };
      delete next[getPlanExerciseKey(activeDayId, exerciseId)];
      return next;
    });

    setStatusMessage(`${deletedExercise.name} removed from ${activeDay?.label ?? "current day"}.`);
  };

  const handlePauseTimeChange = (value: PauseTime): void => {
    if (!selectedExercise) return;
    setPauseByExercise((prev) => ({
      ...prev,
      [getPlanExerciseKey(activeDayId, selectedExercise.id)]: normalizePauseTime(value.minutes, value.seconds),
    }));
  };

  const handleSetChange = (index: number, field: keyof WorkoutSet, value: number): void => {
    if (!selectedExercise) return;
    const key = getPlanExerciseKey(activeDayId, selectedExercise.id);
    setSetsByExercise((prev) => ({
      ...prev,
      [key]: (prev[key] ?? [{ ...DEFAULT_SET }]).map((set, setIndex) => {
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
    if (!selectedExercise) return;
    const key = getPlanExerciseKey(activeDayId, selectedExercise.id);
    setSetsByExercise((prev) => {
      const currentSets = prev[key] ?? [{ ...DEFAULT_SET }];
      const lastSet = currentSets[currentSets.length - 1] ?? DEFAULT_SET;

      return {
        ...prev,
        [key]: [...currentSets, { weight: lastSet.weight, reps: lastSet.reps }],
      };
    });
  };

  const handleRemoveSet = (index: number): void => {
    if (!selectedExercise) return;
    const key = getPlanExerciseKey(activeDayId, selectedExercise.id);
    setSetsByExercise((prev) => {
      const currentSets = prev[key] ?? [{ ...DEFAULT_SET }];
      if (currentSets.length === 1) {
        return prev;
      }

      return {
        ...prev,
        [key]: currentSets.filter((_, setIndex) => setIndex !== index),
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
                          onClick={handleCompleteWorkout}
                          disabled={isCompletedForDate}
                          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${isCompletedForDate
                              ? "cursor-default border-emerald-300/30 bg-emerald-500/15 text-emerald-200"
                              : "border-cyan-300/25 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"
                            }`}
                        >
                          {isCompletedForDate ? <Check className="h-4 w-4" /> : null}
                          {isCompletedForDate ? "Completed" : "Complete"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleSavePlan}
                        disabled={!isDirty || saveState === "saving"}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-300 ${saveState === "saved"
                            ? "scale-100 border-emerald-300/60 bg-emerald-400/25 text-emerald-50 shadow-[0_0_26px_rgba(16,185,129,0.35)]"
                            : saveState === "error"
                              ? "scale-100 border-rose-300/50 bg-rose-500/15 text-rose-100"
                              : isDirty
                                ? "scale-100 border-emerald-400/50 bg-emerald-500/20 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.25)] hover:bg-emerald-500/30 hover:shadow-[0_0_24px_rgba(16,185,129,0.35)]"
                                : "scale-95 cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
                          }`}
                      >
                        {saveState === "saving" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : saveState === "saved" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved!" : saveState === "error" ? "Save failed" : "Save Changes"}
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

              {saveState === "error" && statusMessage ? (
                <p
                  className="mt-3 rounded-xl border border-rose-300/30 bg-rose-500/12 px-3 py-2 text-sm text-rose-100"
                  role="alert"
                >
                  {statusMessage}
                </p>
              ) : null}
            </header>

            <div className={isEditorReady ? "" : "pointer-events-none opacity-40 select-none"}>
              <DaysSelector
                days={days}
                activeDayId={activeDayId}
                todayPlanDayId={todayPlanDayId}
                completedDayIds={completedDayIds}
                restDayIds={restDayIds}
                onSelectDay={handleSelectDay}
              />

              {/* Rest Day button — OUTSIDE the faded grid, always active */}
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setDays((prev) =>
                      prev.map((day) =>
                        day.id === activeDayId ? { ...day, isRestDay: !day.isRestDay } : day,
                      ),
                    );
                    setRestDayIds((prev) =>
                      prev.includes(activeDayId) ? prev.filter((id) => id !== activeDayId) : [...prev, activeDayId],
                    );
                  }}
                  className={`flex items-center gap-2 rounded-[10px] border px-4 py-2 text-sm font-semibold transition-all ${
                    restDayIds.includes(activeDayId)
                      ? "border-violet-400/60 bg-violet-500/20 text-violet-200 shadow-[0_0_14px_rgba(139,92,246,0.25)] hover:bg-violet-500/25"
                      : "border-white/20 bg-white/[0.03] text-slate-300 hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-violet-200"
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  {restDayIds.includes(activeDayId) ? "Rest Day ✓" : "Rest Day"}
                </button>
              </div>

              {/* Grid — fully faded when Rest Day */}
              <div className={`grid w-full gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] ${restDayIds.includes(activeDayId) ? "pointer-events-none opacity-40 select-none" : ""}`}>
                <div className="reveal-up reveal-delay-3">
                  <WorkoutPreview selectedExercise={selectedExercise} />
                </div>

                <div className="reveal-up reveal-delay-4">
                  <ActivitiesList
                    dayExercises={activeDayExercises}
                    selectedExerciseId={selectedExerciseId}
                    getIconForMuscleGroup={getIconForMuscleGroup}
                    searchExercises={(query) => exerciseService.searchExercises(query)}
                    onAddExercise={handleAddExerciseToActiveDay}
                    onSelectExercise={handleSelectExercise}
                    onDeleteExercise={handleDeleteExerciseFromActiveDay}
                  />
                </div>

                <ActivityDetails
                  selectedExerciseName={selectedExercise?.name ?? null}
                  pauseTime={selectedExercisePause}
                  sets={selectedExerciseSets}
                  isRestDay={restDayIds.includes(activeDayId)}
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


