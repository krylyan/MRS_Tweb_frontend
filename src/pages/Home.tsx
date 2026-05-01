import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Plus,
  Target,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ALIMENTATION_PLANS,
  DEFAULT_THEME_IDS,
  getThemeById,
  readCustomizations,
  readMealCustomizations,
} from "./MyPlans";
import { getDateKey, hasCompletedPlanDay, isPlanDayCompleted, cleanupOldCompletions } from "../utils/planCompletion";
import { getActivePlan, getWorkoutPlans } from "../utils/planStorage";
import {
  getPlanActivation,
  getActiveDayForDate,
  checkAndResetCycle,
  isDateInRange,
  type ActiveDayInfo,
} from "../utils/planCycleTracker";

const ACTIVE_MEAL_KEY = "fitlife_active_meal_plan";

/* ── Date helpers ──────────────────────────────────────────────────────────── */

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (dateKey: string, days: number): string => {
  const d = parseDateKey(dateKey);
  d.setDate(d.getDate() + days);
  return getDateKey(d);
};

const getOrdinal = (day: number): string => {
  if (day > 10 && day < 20) return `${day}th`;
  const suffix = day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th";
  return `${day}${suffix}`;
};

const formatDateLabel = (dateKey: string): string => {
  const date = parseDateKey(dateKey);
  const todayKey = getDateKey();
  const yesterdayKey = addDays(todayKey, -1);
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  const year = date.getFullYear();
  const formatted = `${getOrdinal(date.getDate())} ${month}, ${year}`;
  if (dateKey === todayKey) return `Today, ${formatted}`;
  if (dateKey === yesterdayKey) return `Yesterday, ${formatted}`;
  return formatted;
};

/* ── Sub-components ────────────────────────────────────────────────────────── */

interface StatusBadgeProps {
  completed: boolean;
}

function StatusBadge({ completed }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
        completed
          ? "border-emerald-300/30 bg-emerald-500/15 text-emerald-200"
          : "border-amber-300/25 bg-amber-400/10 text-amber-100"
      }`}
    >
      {completed ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
      {completed ? "Completed" : "Not completed"}
    </span>
  );
}

interface ActiveDayBadgeProps {
  dayInfo: ActiveDayInfo;
  totalDays: number;
}

function ActiveDayBadge({ dayInfo, totalDays }: ActiveDayBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
      <CalendarDays className="h-3.5 w-3.5" />
      {dayInfo.dayLabel} of {totalDays}
    </span>
  );
}

interface ActivePlanCardProps {
  type: "workout" | "meal";
  name: string;
  href: string;
  completed: boolean;
  imageUrl?: string;
  accent: ReturnType<typeof getThemeById>;
  stats: Array<{ icon: "calendar" | "clock" | "dumbbell" | "flame" | "target"; label: string }>;
  dayInfo: ActiveDayInfo | null;
  totalDays: number;
}

const statIcons = {
  calendar: CalendarDays,
  clock: Clock,
  dumbbell: Dumbbell,
  flame: Flame,
  target: Target,
};

function ActivePlanCard({
  type,
  name,
  href,
  completed,
  imageUrl,
  accent,
  stats,
  dayInfo,
  totalDays,
}: ActivePlanCardProps) {
  const Icon = type === "workout" ? Dumbbell : UtensilsCrossed;

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${accent.card}`}
    >
      {/* Image / header area */}
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${accent.imgBg}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover opacity-90" />
        ) : (
          <Icon className="h-20 w-20 text-white/14" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />
        {/* Badges over image */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
          {dayInfo && <ActiveDayBadge dayInfo={dayInfo} totalDays={totalDays} />}
          <StatusBadge completed={completed} />
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col p-5 gap-4">
        {/* Plan name */}
        <h2 className="break-words text-2xl font-bold leading-tight text-slate-50">{name}</h2>

        {/* Active day — prominent display */}
        {dayInfo && (
          <div className="flex items-center gap-3 rounded-xl border border-blue-400/25 bg-blue-500/10 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-300/30 bg-blue-500/20">
              <CalendarDays className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <p className="text-xl font-extrabold leading-none text-blue-100">{dayInfo.dayLabel}</p>
              <p className="mt-0.5 text-xs text-blue-300/80">
                {`of ${totalDays} ${type === "workout" ? "training" : "meal plan"} days`}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-2 sm:grid-cols-3">
          {stats.map((stat) => {
            const StatIcon = statIcons[stat.icon];
            return (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <StatIcon className="mb-1 h-4 w-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-300">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Open Plan button */}
        <Link
          to={href}
          className={`inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] ${accent.btn}`}
        >
          Open Plan
        </Link>
      </div>
    </article>
  );
}

function ActivePlanHeading({ type }: { type: "workout" | "meal" }) {
  const isWorkout = type === "workout";
  const Icon = isWorkout ? Dumbbell : UtensilsCrossed;
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className={`h-5 w-5 ${isWorkout ? "text-emerald-400" : "text-orange-400"}`} />
      <h2 className="text-2xl font-bold text-white">
        {isWorkout ? "Active Workout Plan" : "Active Alimentation Plan"}
      </h2>
    </div>
  );
}

function EmptyPlanCard({ type, reason }: { type: "workout" | "meal"; reason?: "not-started" | "no-plan" }) {
  const isWorkout = type === "workout";
  const Icon = isWorkout ? Dumbbell : UtensilsCrossed;

  const title =
    reason === "not-started"
      ? isWorkout
        ? "Plan not started yet"
        : "Plan not started yet"
      : isWorkout
      ? "No active workout plan"
      : "No active alimentation plan";

  const desc =
    reason === "not-started"
      ? "This plan was not active on the selected date."
      : isWorkout
      ? "Choose a workout plan as active to see it in your daily dashboard."
      : "Choose an alimentation plan as active to track it by date.";

  return (
    <div className="flex min-h-[470px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/18 bg-white/[0.025] p-8 text-center">
      <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300">
        <Icon className="h-8 w-8" />
      </span>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">{desc}</p>
      {reason !== "not-started" && (
        <Link
          to={isWorkout ? "/plans?tab=workout" : "/plans?tab=alimentation"}
          className={`mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white ${
            isWorkout ? "bg-emerald-500 hover:bg-emerald-400" : "bg-orange-500 hover:bg-orange-400"
          }`}
        >
          <Plus className="h-4 w-4" />
          Go to My Plans
        </Link>
      )}
    </div>
  );
}

function CalorieProgressCard({
  consumedCalories,
  totalCalories,
}: {
  consumedCalories: number;
  totalCalories: number;
}) {
  const progress = totalCalories > 0 ? Math.min(1, consumedCalories / totalCalories) : 0;
  const caloriesLeft = Math.max(0, totalCalories - consumedCalories);

  return (
    <div className="flex min-h-[168px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.22)]">
      <div>
        <p className="text-base font-semibold text-slate-300">Calories</p>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <p className="min-w-0 text-3xl font-bold leading-none text-white">
            {consumedCalories.toLocaleString()} cal
            <span className="text-xl font-bold leading-none text-slate-400">
              {" / "}{totalCalories > 0 ? totalCalories.toLocaleString() : "-"}
            </span>
          </p>
          <p className="shrink-0 text-xl font-bold leading-none text-slate-400">
            {totalCalories > 0 ? caloriesLeft.toLocaleString() : "-"} left
          </p>
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-950/60 shadow-inner shadow-black/25">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300 transition-[width] duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */

export default function Home() {
  const [selectedDateKey, setSelectedDateKey] = useState(() => getDateKey());

  const activeWorkoutPlan = getActivePlan();
  const activeMealPlanId = localStorage.getItem(ACTIVE_MEAL_KEY);
  const activeMealPlan = ALIMENTATION_PLANS.find((p) => p.id === activeMealPlanId) ?? null;
  const workoutPlans = getWorkoutPlans();
  const customizations = readCustomizations();
  const mealCustomizations = readMealCustomizations();

  // ── Cycle activations ──────────────────────────────────────────────────
  const workoutActivation = getPlanActivation("workout");
  const mealActivation = getPlanActivation("meal");

  // Auto-reset cycles + cleanup old completions on mount
  useEffect(() => {
    cleanupOldCompletions(8);
    if (workoutActivation && activeWorkoutPlan) {
      checkAndResetCycle("workout", (dayId, dateKey) =>
        isPlanDayCompleted("workout", activeWorkoutPlan.id, dayId, dateKey),
      );
    }
    if (mealActivation && activeMealPlan) {
      checkAndResetCycle("meal", (dayId, dateKey) =>
        isPlanDayCompleted("meal", activeMealPlan.id, dayId, dateKey),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Guards: plan started on selected date? ─────────────────────────────
  // If selected date is BEFORE the plan was activated → show "not started"
  const workoutStartedOnDate =
    activeWorkoutPlan && workoutActivation
      ? selectedDateKey >= workoutActivation.activatedAt
      : Boolean(activeWorkoutPlan && !workoutActivation); // plan active but no activation record → show it

  const mealStartedOnDate =
    activeMealPlan && mealActivation
      ? selectedDateKey >= mealActivation.activatedAt
      : Boolean(activeMealPlan && !mealActivation);

  // ── Day mapping for selected date ──────────────────────────────────────
  const workoutDayInfo: ActiveDayInfo | null =
    workoutActivation && activeWorkoutPlan && workoutStartedOnDate
      ? getActiveDayForDate(workoutActivation, selectedDateKey)
      : null;

  const mealDayInfo: ActiveDayInfo | null =
    mealActivation && activeMealPlan && mealStartedOnDate
      ? getActiveDayForDate(mealActivation, selectedDateKey)
      : null;

  // ── Completion status ──────────────────────────────────────────────────
  const workoutCompleted = workoutDayInfo
    ? isPlanDayCompleted("workout", activeWorkoutPlan!.id, workoutDayInfo.dayId, selectedDateKey)
    : hasCompletedPlanDay("workout", activeWorkoutPlan?.id, selectedDateKey);

  const mealCompleted = mealDayInfo
    ? isPlanDayCompleted("meal", activeMealPlan!.id, mealDayInfo.dayId, selectedDateKey)
    : hasCompletedPlanDay("meal", activeMealPlan?.id, selectedDateKey);

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalWorkoutExercises =
    activeWorkoutPlan?.days.reduce((sum, day) => sum + day.exerciseIds.length, 0) ?? 0;
  const totalCalories = activeMealPlan?.kcal ?? 0;
  const consumedCalories = mealCompleted ? totalCalories : 0;

  // ── Navigation limits: max Today, min 6 days back ─────────────────────
  const { canGoPrev, canGoNext } = isDateInRange(selectedDateKey);

  // ── Theming ────────────────────────────────────────────────────────────
  const activeWorkoutIndex = activeWorkoutPlan
    ? Math.max(0, workoutPlans.findIndex((p) => p.id === activeWorkoutPlan.id))
    : 0;
  const workoutCustomization = activeWorkoutPlan ? customizations[activeWorkoutPlan.id] : undefined;
  const workoutAccent = getThemeById(
    workoutCustomization?.colorId ?? DEFAULT_THEME_IDS[activeWorkoutIndex % DEFAULT_THEME_IDS.length],
  );
  const workoutImageUrl = workoutCustomization?.imageUrl;

  const activeMealIndex = activeMealPlan
    ? Math.max(0, ALIMENTATION_PLANS.findIndex((p) => p.id === activeMealPlan.id))
    : 0;
  const mealCustomization = activeMealPlan ? mealCustomizations[activeMealPlan.id] : undefined;
  const mealAccent = getThemeById(
    mealCustomization?.colorId ?? DEFAULT_THEME_IDS[activeMealIndex % DEFAULT_THEME_IDS.length],
  );
  const mealImageUrl = mealCustomization?.imageUrl || activeMealPlan?.imageUrl;

  // ── "Open Plan" hrefs with dayId ───────────────────────────────────────
  const workoutHref = activeWorkoutPlan
    ? `/gym-plan?planId=${activeWorkoutPlan.id}&date=${selectedDateKey}${workoutDayInfo ? `&dayId=${workoutDayInfo.dayId}` : ""}`
    : "#";

  const mealHref = activeMealPlan
    ? `/meal-plan?planId=${activeMealPlan.id}&date=${selectedDateKey}${mealDayInfo ? `&dayId=${mealDayInfo.dayId}` : ""}`
    : "#";

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-8">

        {/* ── Date navigator ── */}
        <section className="reveal-up mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.28)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-slate-200">
                <CalendarDays className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {formatDateLabel(selectedDateKey)}
                </h1>
                <p className="mt-1 text-sm text-slate-400">Active plans for the selected date</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDateKey((cur) => addDays(cur, -1))}
                disabled={!canGoPrev}
                aria-label="Previous day"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-slate-200 transition-all hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedDateKey(getDateKey())}
                className="h-11 rounded-xl border border-white/12 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition-all hover:bg-white/[0.09] hover:text-white"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelectedDateKey((cur) => {
                    const todayKey = getDateKey();
                    const next = addDays(cur, 1);
                    return next > todayKey ? todayKey : next;
                  })
                }
                disabled={!canGoNext}
                aria-label="Next day"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-slate-200 transition-all hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ── Quick stats ── */}
        <section className="reveal-up reveal-delay-1 mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="min-h-[168px] rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.22)]">
            <Dumbbell className="mb-3 h-5 w-5 text-cyan-300" />
            <p className="text-3xl font-bold text-white">{totalWorkoutExercises}</p>
            <p className="mt-1 text-sm text-slate-400">exercises in active workout plan</p>
          </div>
          <CalorieProgressCard consumedCalories={consumedCalories} totalCalories={totalCalories} />
        </section>

        {/* ── Active plan cards ── */}
        <section className="grid gap-5 xl:grid-cols-2">

          {/* Workout plan */}
          {!activeWorkoutPlan ? (
            <EmptyPlanCard type="workout" reason="no-plan" />
          ) : !workoutStartedOnDate ? (
            <div>
              <ActivePlanHeading type="workout" />
              <EmptyPlanCard type="workout" reason="not-started" />
            </div>
          ) : (
            <div>
              <ActivePlanHeading type="workout" />
              <ActivePlanCard
                type="workout"
                name={activeWorkoutPlan.name}
                href={workoutHref}
                completed={workoutCompleted}
                imageUrl={workoutImageUrl}
                accent={workoutAccent}
                dayInfo={workoutDayInfo}
                totalDays={activeWorkoutPlan.days.length}
                stats={[
                  { icon: "calendar", label: `${activeWorkoutPlan.days.length} training days` },
                  { icon: "dumbbell", label: `${totalWorkoutExercises} exercises` },
                  { icon: "clock", label: `~${Math.max(1, activeWorkoutPlan.days.length) * 45} min` },
                ]}
              />
            </div>
          )}

          {/* Meal plan */}
          {!activeMealPlan ? (
            <EmptyPlanCard type="meal" reason="no-plan" />
          ) : !mealStartedOnDate ? (
            <div>
              <ActivePlanHeading type="meal" />
              <EmptyPlanCard type="meal" reason="not-started" />
            </div>
          ) : (
            <div>
              <ActivePlanHeading type="meal" />
              <ActivePlanCard
                type="meal"
                name={activeMealPlan.name}
                href={mealHref}
                completed={mealCompleted}
                imageUrl={mealImageUrl}
                accent={mealAccent}
                dayInfo={mealDayInfo}
                totalDays={7}
                stats={[
                  { icon: "flame", label: `${activeMealPlan.kcal.toLocaleString()} kcal / day` },
                  { icon: "calendar", label: `${activeMealPlan.meals} meals` },
                  { icon: "target", label: `${activeMealPlan.proteins}% protein` },
                ]}
              />
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
