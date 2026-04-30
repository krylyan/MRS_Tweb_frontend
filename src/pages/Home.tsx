import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  ListChecks,
  Plus,
  Target,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ALIMENTATION_PLANS } from "./MyPlans";
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

const getWeekNumber = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const dayOffset = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return Math.floor((dayOffset + start.getDay()) / 7) + 1;
};

const getTrainingDayNumber = (date: Date): number => {
  const day = date.getDay();
  return day === 0 ? 7 : day;
};

const getOrdinal = (day: number): string => {
  if (day > 10 && day < 20) return `${day}th`;
  const suffix = day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th";
  return `${day}${suffix}`;
};

const formatDateLabel = (dateKey: string): string => {
  const date = parseDateKey(dateKey);
  const todayKey = getDateKey();
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  const year = date.getFullYear();
  const formatted = `${getOrdinal(date.getDate())} ${month}, ${year}`;

  return dateKey === todayKey ? `Today, ${formatted}` : formatted;
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
  stats: Array<{ icon: "calendar" | "clock" | "dumbbell" | "flame" | "target"; label: string }>;
}

const statIcons = {
  calendar: CalendarDays,
  clock: Clock,
  dumbbell: Dumbbell,
  flame: Flame,
  target: Target,
};

function ActivePlanCard({ type, title, name, href, completed, imageUrl, stats }: ActivePlanCardProps) {
  const Icon = type === "workout" ? Dumbbell : UtensilsCrossed;
  const accent =
    type === "workout"
      ? {
          border: "border-emerald-400/25",
          glow: "shadow-emerald-500/10",
          iconBg: "bg-emerald-500/18 text-emerald-200",
          button: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25",
          image: "from-emerald-500/25 via-slate-900 to-slate-950",
        }
      : {
          border: "border-orange-300/25",
          glow: "shadow-orange-500/10",
          iconBg: "bg-orange-500/18 text-orange-100",
          button: "bg-orange-500 hover:bg-orange-400 shadow-orange-500/25",
          image: "from-orange-500/25 via-slate-900 to-slate-950",
        };

  return (
    <article
      className={`group overflow-hidden rounded-2xl border ${accent.border} bg-white/[0.045] shadow-[0_18px_42px_rgba(0,0,0,0.32)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${accent.glow}`}
    >
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${accent.image}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <Icon className="h-20 w-20 text-white/14" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent.iconBg}`}>
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
          className={`mt-auto inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] ${accent.button}`}
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

export default function Home() {
  const [selectedDateKey, setSelectedDateKey] = useState(() => getDateKey());
  const selectedDate = parseDateKey(selectedDateKey);
  const activeWorkoutPlan = getActivePlan();
  const activeMealPlanId = localStorage.getItem(ACTIVE_MEAL_KEY);
  const activeMealPlan = ALIMENTATION_PLANS.find((plan) => plan.id === activeMealPlanId) ?? null;
  const workoutPlans = getWorkoutPlans();
  const workoutCompleted = isPlanCompleted("workout", activeWorkoutPlan?.id, selectedDateKey);
  const mealCompleted = isPlanCompleted("meal", activeMealPlan?.id, selectedDateKey);
  const completedCount = Number(workoutCompleted) + Number(mealCompleted);
  const totalWorkoutExercises =
    activeWorkoutPlan?.days.reduce((sum, day) => sum + day.exerciseIds.length, 0) ?? 0;

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
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Day {getTrainingDayNumber(selectedDate)}, Week {getWeekNumber(selectedDate)}
                </p>
                <h1 className="mt-1 break-words text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {formatDateLabel(selectedDateKey)}
                </h1>
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
                onClick={() => setSelectedDateKey((current) => addDays(current, 1))}
                aria-label="Next day"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-slate-200 transition-all hover:bg-white/[0.09] hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="reveal-up reveal-delay-1 mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <ListChecks className="mb-3 h-5 w-5 text-emerald-300" />
            <p className="text-3xl font-bold text-white">{completedCount}/2</p>
            <p className="mt-1 text-sm text-slate-400">Plans completed this day</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <Dumbbell className="mb-3 h-5 w-5 text-cyan-300" />
            <p className="text-3xl font-bold text-white">{workoutPlans.length}</p>
            <p className="mt-1 text-sm text-slate-400">Saved workout plans</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <Flame className="mb-3 h-5 w-5 text-orange-300" />
            <p className="text-3xl font-bold text-white">{activeMealPlan?.kcal.toLocaleString() ?? "-"}</p>
            <p className="mt-1 text-sm text-slate-400">Active daily calories</p>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          {activeWorkoutPlan ? (
            <ActivePlanCard
              type="workout"
              title="Active Workout Plan"
              name={activeWorkoutPlan.name}
              href={`/gym-plan?planId=${activeWorkoutPlan.id}&date=${selectedDateKey}`}
              completed={workoutCompleted}
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
              imageUrl={activeMealPlan.imageUrl}
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
