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
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ALIMENTATION_PLANS,
  DEFAULT_THEME_IDS,
  getThemeById,
  readCustomizations,
  readMealCustomizations,
} from "./MyPlans";
import { getDateKey, isPlanCompleted } from "../utils/planCompletion";
import { getActivePlan, getWorkoutPlans } from "../utils/planStorage";

const ACTIVE_MEAL_KEY = "fitlife_active_meal_plan";

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (dateKey: string, days: number): string => {
  const nextDate = parseDateKey(dateKey);
  nextDate.setDate(nextDate.getDate() + days);
  return getDateKey(nextDate);
};

const getOrdinal = (day: number): string => {
  if (day > 10 && day < 20) return `${day}th`;
  const suffix = day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th";
  return `${day}${suffix}`;
};

const formatDateLabel = (dateKey: string): string => {
  const date = parseDateKey(dateKey);
  const todayKey = getDateKey();
  const tomorrowKey = addDays(todayKey, 1);
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  const year = date.getFullYear();
  const formatted = `${getOrdinal(date.getDate())} ${month}, ${year}`;

  if (dateKey === todayKey) return `Today, ${formatted}`;
  if (dateKey === tomorrowKey) return `Tomorrow, ${formatted}`;
  return formatted;
};

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

interface ActivePlanCardProps {
  type: "workout" | "meal";
  title: string;
  name: string;
  href: string;
  completed: boolean;
  imageUrl?: string;
  accent: ReturnType<typeof getThemeById>;
  stats: Array<{ icon: "calendar" | "clock" | "dumbbell" | "flame" | "target"; label: string }>;
}

const statIcons = {
  calendar: CalendarDays,
  clock: Clock,
  dumbbell: Dumbbell,
  flame: Flame,
  target: Target,
};

function ActivePlanCard({ type, title, name, href, completed, imageUrl, accent, stats }: ActivePlanCardProps) {
  const Icon = type === "workout" ? Dumbbell : UtensilsCrossed;

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${accent.card}`}
    >
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${accent.imgBg}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover opacity-90" />
        ) : (
          <Icon className="h-20 w-20 text-white/14" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent.badge} text-white shadow-lg`}>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">{title}</p>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <StatusBadge completed={completed} />
        </div>
      </div>

      <div className="flex min-h-[230px] flex-col p-5">
        <h2 className="break-words text-2xl font-bold leading-tight text-slate-50">{name}</h2>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
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

        <Link
          to={href}
          className={`mt-auto inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] ${accent.btn}`}
        >
          Open Plan
        </Link>
      </div>
    </article>
  );
}

function EmptyPlanCard({ type }: { type: "workout" | "meal" }) {
  const isWorkout = type === "workout";
  const Icon = isWorkout ? Dumbbell : UtensilsCrossed;

  return (
    <div className="flex min-h-[470px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/18 bg-white/[0.025] p-8 text-center">
      <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300">
        <Icon className="h-8 w-8" />
      </span>
      <h2 className="text-xl font-bold text-white">
        {isWorkout ? "No active workout plan" : "No active alimentation plan"}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
        {isWorkout
          ? "Choose a workout plan as active to see it in your daily dashboard."
          : "Choose an alimentation plan as active to track it by date."}
      </p>
      <Link
        to={isWorkout ? "/plans?tab=workout" : "/plans?tab=alimentation"}
        className={`mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white ${
          isWorkout ? "bg-emerald-500 hover:bg-emerald-400" : "bg-orange-500 hover:bg-orange-400"
        }`}
      >
        <Plus className="h-4 w-4" />
        Go to My Plans
      </Link>
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
  const totalLabel = totalCalories > 0 ? totalCalories.toLocaleString() : "-";

  return (
    <div className="flex min-h-[168px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.22)]">
      <div>
        <p className="text-base font-semibold text-slate-300">Calories</p>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <p className="min-w-0 text-3xl font-bold leading-none text-white">
            {consumedCalories.toLocaleString()} cal
            <span className="text-xl font-bold text-slate-500"> / {totalLabel}</span>
          </p>
          <p className="shrink-0 text-sm font-semibold text-slate-400">
            {totalCalories > 0 ? caloriesLeft.toLocaleString() : "-"} left
          </p>
        </div>
      </div>

      <div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-950/60 shadow-inner shadow-black/25">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300 transition-[width] duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-400">calories consumed from daily plan</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedDateKey, setSelectedDateKey] = useState(() => getDateKey());
  const activeWorkoutPlan = getActivePlan();
  const activeMealPlanId = localStorage.getItem(ACTIVE_MEAL_KEY);
  const activeMealPlan = ALIMENTATION_PLANS.find((plan) => plan.id === activeMealPlanId) ?? null;
  const workoutPlans = getWorkoutPlans();
  const customizations = readCustomizations();
  const mealCustomizations = readMealCustomizations();
  const workoutCompleted = isPlanCompleted("workout", activeWorkoutPlan?.id, selectedDateKey);
  const mealCompleted = isPlanCompleted("meal", activeMealPlan?.id, selectedDateKey);
  const totalWorkoutExercises =
    activeWorkoutPlan?.days.reduce((sum, day) => sum + day.exerciseIds.length, 0) ?? 0;
  const totalCalories = activeMealPlan?.kcal ?? 0;
  const consumedCalories = mealCompleted ? totalCalories : 0;
  const tomorrowKey = addDays(getDateKey(), 1);
  const isNextDisabled = selectedDateKey >= tomorrowKey;
  const activeWorkoutIndex = activeWorkoutPlan
    ? Math.max(0, workoutPlans.findIndex((plan) => plan.id === activeWorkoutPlan.id))
    : 0;
  const workoutCustomization = activeWorkoutPlan ? customizations[activeWorkoutPlan.id] : undefined;
  const workoutAccent = getThemeById(
    workoutCustomization?.colorId ?? DEFAULT_THEME_IDS[activeWorkoutIndex % DEFAULT_THEME_IDS.length],
  );
  const workoutImageUrl = workoutCustomization?.imageUrl;
  const activeMealIndex = activeMealPlan
    ? Math.max(0, ALIMENTATION_PLANS.findIndex((plan) => plan.id === activeMealPlan.id))
    : 0;
  const mealCustomization = activeMealPlan ? mealCustomizations[activeMealPlan.id] : undefined;
  const mealAccent = getThemeById(
    mealCustomization?.colorId ?? DEFAULT_THEME_IDS[activeMealIndex % DEFAULT_THEME_IDS.length],
  );
  const mealImageUrl = mealCustomization?.imageUrl || activeMealPlan?.imageUrl;

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-8">
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
                onClick={() => setSelectedDateKey((current) => addDays(current, -1))}
                aria-label="Previous day"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-slate-200 transition-all hover:bg-white/[0.09] hover:text-white"
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
                onClick={() => {
                  setSelectedDateKey((current) => {
                    const next = addDays(current, 1);
                    return next > tomorrowKey ? tomorrowKey : next;
                  });
                }}
                disabled={isNextDisabled}
                aria-label="Next day"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-slate-200 transition-all hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/[0.04] disabled:hover:text-slate-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="reveal-up reveal-delay-1 mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="min-h-[168px] rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.22)]">
            <Dumbbell className="mb-3 h-5 w-5 text-cyan-300" />
            <p className="text-3xl font-bold text-white">{totalWorkoutExercises}</p>
            <p className="mt-1 text-sm text-slate-400">exercises in active workout plan</p>
          </div>
          <CalorieProgressCard consumedCalories={consumedCalories} totalCalories={totalCalories} />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          {activeWorkoutPlan ? (
            <ActivePlanCard
              type="workout"
              title="Active Workout Plan"
              name={activeWorkoutPlan.name}
              href={`/gym-plan?planId=${activeWorkoutPlan.id}&date=${selectedDateKey}`}
              completed={workoutCompleted}
              imageUrl={workoutImageUrl}
              accent={workoutAccent}
              stats={[
                { icon: "calendar", label: `${activeWorkoutPlan.days.length} training days` },
                { icon: "dumbbell", label: `${totalWorkoutExercises} exercises` },
                { icon: "clock", label: `~${Math.max(1, activeWorkoutPlan.days.length) * 45} min` },
              ]}
            />
          ) : (
            <EmptyPlanCard type="workout" />
          )}

          {activeMealPlan ? (
            <ActivePlanCard
              type="meal"
              title="Active Alimentation Plan"
              name={activeMealPlan.name}
              href={`/meal-plan?planId=${activeMealPlan.id}&date=${selectedDateKey}`}
              completed={mealCompleted}
              imageUrl={mealImageUrl}
              accent={mealAccent}
              stats={[
                { icon: "flame", label: `${activeMealPlan.kcal.toLocaleString()} kcal / day` },
                { icon: "calendar", label: `${activeMealPlan.meals} meals` },
                { icon: "target", label: `${activeMealPlan.proteins}% protein` },
              ]}
            />
          ) : (
            <EmptyPlanCard type="meal" />
          )}
        </section>
      </div>
    </main>
  );
}
