import {
  CalendarDays,
  Check,
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
  DEFAULT_THEME_IDS,
  getThemeById,
} from "./MyPlans";
import { getDateKey } from "../utils/planCompletion";
import { planCompletionApi } from "../services/planCompletionApi";
import type { PlanCompletionResponseDto } from "../services/planCompletionApi";
import { planActivationApi, type PlanActivationApi } from "../services/planActivationApi";
import { workoutPlanApi, type WorkoutPlanApi } from "../services/workoutPlanApi";
import { mealPlanApi, type MealPlanApi } from "../services/mealPlanApi";
import {
  planPreferencesApi,
  toCustomizationMap,
  type PlanCustomizations,
} from "../services/planPreferencesApi";
import DashboardStatistics, {
  type EnergyChartPoint,
  type MacroChartData,
  type WeightChartPoint,
} from "../components/DashboardStatistics";
import {
  profileApi,
  type UserProfileDto,
  type UserWeightHistoryDto,
} from "../services/profileApi";



const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (dateKey: string, days: number): string => {
  const d = parseDateKey(dateKey);
  d.setDate(d.getDate() + days);
  return getDateKey(d);
};

interface ActiveDayInfo {
  dayIndex: number;
  dayNumber: number;
  dayId: string;
  dayLabel: string;
}

const daysBetween = (a: string, b: string): number =>
  Math.round((parseDateKey(b).getTime() - parseDateKey(a).getTime()) / 86_400_000);

const getActivationStartKey = (activation: PlanActivationApi): string =>
  activation.lastCycleResetAt ?? activation.activatedAt;

const getPlanDayToken = (planIdentifier: string | number, activationId: number, dayId: string): string =>
  `${planIdentifier}:${activationId}:${dayId}`;

const getMealSlotToken = (
  planIdentifier: string | number,
  activationId: number,
  dayId: string,
  slot: string,
): string => `${getPlanDayToken(planIdentifier, activationId, dayId)}:${slot}`;

const getActivationTokenPrefix = (planIdentifier: string | number, activationId?: number): string =>
  activationId ? `${planIdentifier}:${activationId}:` : `${planIdentifier}:`;

const getActiveDayForDate = (activation: PlanActivationApi, dateKey: string): ActiveDayInfo => {
  const diff = Math.max(0, daysBetween(getActivationStartKey(activation), dateKey));
  const totalDays = Math.max(1, activation.totalDays);
  const dayIndex = diff % totalDays;
  const dayNumber = dayIndex + 1;

  return {
    dayIndex,
    dayNumber,
    dayId: `day-${dayNumber}`,
    dayLabel: `Day ${dayNumber}`,
  };
};

const getHistoryDays = (count = 7): string[] =>
  Array.from({ length: count }, (_, index) => addDays(getDateKey(), -index));


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
}

function ActiveDayBadge({ dayInfo }: ActiveDayBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
      <CalendarDays className="h-3.5 w-3.5" />
      {dayInfo.dayLabel}
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
}: ActivePlanCardProps) {
  const Icon = type === "workout" ? Dumbbell : UtensilsCrossed;

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${accent.card}`}
    >
      {/* Image / header area */}
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${accent.imgBg}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-contain p-2 opacity-90" />
        ) : (
          <Icon className="h-20 w-20 text-white/14" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />
        {/* Badges over image */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
          {dayInfo && <ActiveDayBadge dayInfo={dayInfo} />}
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
                {type === "workout" ? "Today’s scheduled workout" : "Today’s nutrition plan"}
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


const C_W = 760;
const C_H = 200;
const C_PAD = { t: 20, r: 28, b: 38, l: 24 };
const C_IW = C_W - C_PAD.l - C_PAD.r;
const C_IH = C_H - C_PAD.t - C_PAD.b;

function spline(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const k = 0.38;
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) * k;
    const c1y = p1.y + (p2.y - p0.y) * k;
    const c2x = p2.x - (p3.x - p1.x) * k;
    const c2y = p2.y - (p3.y - p1.y) * k;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

function splineArea(pts: { x: number; y: number }[], baseY: number): string {
  if (pts.length < 2) return "";
  return `${spline(pts)} L${pts[pts.length - 1].x.toFixed(1)},${baseY} L${pts[0].x.toFixed(1)},${baseY} Z`;
}

function toY(value: number): number {
  // value 0→1: map to pixel Y with padding so line never hits edges
  return C_PAD.t + C_IH * (0.88 - value * 0.76);
}

interface WeeklyActivityChartProps {
  workoutPlanId?: string;
  mealPlanId?: string;
  workoutActivationId?: number;
  mealActivationId?: number;
  workoutActivatedAt?: string;
  mealActivatedAt?: string;
  completions: PlanCompletionResponseDto[];
}

export function WeeklyActivityChart({
  workoutPlanId,
  mealPlanId,
  workoutActivationId,
  mealActivationId,
  workoutActivatedAt,
  mealActivatedAt,
  completions,
}: WeeklyActivityChartProps) {
  const days = getHistoryDays(7).reverse();

  const data = days.map((dk) => {
    const date = parseDateKey(dk);
    const label = date.toLocaleDateString("en-GB", { weekday: "short" });
    const wActive = workoutPlanId && (!workoutActivatedAt || dk >= workoutActivatedAt);
    const mActive = mealPlanId && (!mealActivatedAt || dk >= mealActivatedAt);
    const wDone = wActive
      ? completions.some((item) => item.planType === "Workout" && item.dateKey === dk && item.dayToken.startsWith(getActivationTokenPrefix(workoutPlanId, workoutActivationId)))
      : false;
    const mDone = mActive
      ? completions.some((item) => item.planType === "Meal" && item.dateKey === dk && item.dayToken.startsWith(getActivationTokenPrefix(mealPlanId, mealActivationId)))
      : false;
    return { dk, label, w: wDone ? 1 : wActive ? 0.08 : 0.04, m: mDone ? 1 : mActive ? 0.08 : 0.04, wDone, mDone };
  });

  const stepX = C_IW / (data.length - 1);
  const wPts = data.map((d, i) => ({ x: C_PAD.l + i * stepX, y: toY(d.w) }));
  const mPts = data.map((d, i) => ({ x: C_PAD.l + i * stepX, y: toY(d.m) }));
  const baseY = C_PAD.t + C_IH * 0.88 + 4;

  const totalW = data.filter((d) => d.wDone).length;
  const totalM = data.filter((d) => d.mDone).length;

  return (
    <section className="reveal-up mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-sm">
      <style>{`
        @keyframes chartSlide { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes lineIn { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0% 0 0); } }
        .chart-wrap { animation: chartSlide .6s ease both; }
        .chart-line { animation: lineIn 1.4s cubic-bezier(0.4,0,0.2,1) both; }
        .chart-dot  { animation: chartSlide .4s ease both; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Statistics</p>
          <h2 className="mt-0.5 text-lg font-bold text-white">Weekly Activity</h2>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
            <span className="text-xs font-semibold text-slate-300">Workout</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.7)]" />
            <span className="text-xs font-semibold text-slate-300">Meals</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="chart-wrap px-2 pt-2">
        <svg viewBox={`0 0 ${C_W} ${C_H}`} className="w-full" style={{ height: 200 }} aria-hidden="true">
          <defs>
            <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0.04, 0.25, 0.5, 0.75, 1].map((v) => (
            <line
              key={v}
              x1={C_PAD.l}
              x2={C_W - C_PAD.r}
              y1={toY(v)}
              y2={toY(v)}
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="1"
            />
          ))}

          {/* Vertical day grid lines */}
          {data.map((_, i) => (
            <line
              key={i}
              x1={C_PAD.l + i * stepX}
              x2={C_PAD.l + i * stepX}
              y1={C_PAD.t}
              y2={baseY}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ))}

          {/* Workout area + line */}
          <path d={splineArea(wPts, baseY)} fill="url(#wg)" className="chart-line" />
          <path d={spline(wPts)} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" className="chart-line" />

          {/* Meal area + line */}
          <path d={splineArea(mPts, baseY)} fill="url(#mg)" className="chart-line" />
          <path d={spline(mPts)} fill="none" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" className="chart-line" />

          {/* Workout dots */}
          {wPts.map((pt, i) => (
            <g key={`wd${i}`} className="chart-dot" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
              <circle cx={pt.x} cy={pt.y} r="5" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
              {data[i].wDone && <circle cx={pt.x} cy={pt.y} r="2.5" fill="#22d3ee" />}
            </g>
          ))}

          {/* Meal dots */}
          {mPts.map((pt, i) => (
            <g key={`md${i}`} className="chart-dot" style={{ animationDelay: `${0.65 + i * 0.1}s` }}>
              <circle cx={pt.x} cy={pt.y} r="5" fill="#0f172a" stroke="#fb923c" strokeWidth="2" />
              {data[i].mDone && <circle cx={pt.x} cy={pt.y} r="2.5" fill="#fb923c" />}
            </g>
          ))}

          {/* X-axis day labels */}
          {data.map((d, i) => (
            <text
              key={d.dk}
              x={C_PAD.l + i * stepX}
              y={C_H - 6}
              textAnchor="middle"
              fontSize="11"
              fill="rgba(148,163,184,0.75)"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight="600"
            >
              {d.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Bottom summary stats */}
      <div className="grid grid-cols-2 gap-px border-t border-white/[0.07]">
        <div className="flex items-center gap-3 px-6 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-500/10">
            <Dumbbell className="h-4 w-4 text-cyan-400" />
          </span>
          <div>
            <p className="text-xl font-bold leading-none text-white">
              {totalW}
              <span className="ml-0.5 text-sm font-medium text-slate-500">/7</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Workout days done</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l border-white/[0.07] px-6 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-400/25 bg-orange-500/10">
            <Flame className="h-4 w-4 text-orange-400" />
          </span>
          <div>
            <p className="text-xl font-bold leading-none text-white">
              {totalM}
              <span className="ml-0.5 text-sm font-medium text-slate-500">/7</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Meal days done</p>
          </div>
        </div>
      </div>
    </section>
  );
}


export default function Home() {
  const selectedDateKey = getDateKey();

  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlanApi[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlanApi[]>([]);
  const [workoutActivation, setWorkoutActivation] = useState<PlanActivationApi | null>(null);
  const [mealActivation, setMealActivation] = useState<PlanActivationApi | null>(null);
  const [completions, setCompletions] = useState<PlanCompletionResponseDto[]>([]);
  const [workoutCustomizations, setWorkoutCustomizations] = useState<PlanCustomizations>({});
  const [mealCustomizations, setMealCustomizations] = useState<PlanCustomizations>({});
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [weightHistory, setWeightHistory] = useState<UserWeightHistoryDto[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      const [
        wPlans,
        mPlans,
        wActivation,
        mActivation,
        allCompletions,
        preferences,
        userProfile,
        userWeightHistory,
      ] = await Promise.all([
        workoutPlanApi.getMyPlans(),
        mealPlanApi.getMyPlans(),
        planActivationApi.getActive("Workout"),
        planActivationApi.getActive("Meal"),
        planCompletionApi.getByUser(),
        planPreferencesApi.getCustomizations(),
        profileApi.getProfile(),
        profileApi.getWeightHistory(),
      ]);

      if (cancelled) return;
      setWorkoutPlans(wPlans);
      setMealPlans(mPlans);
      setWorkoutActivation(wActivation);
      setMealActivation(mActivation);
      setCompletions(allCompletions);
      setWorkoutCustomizations(toCustomizationMap(preferences, "Workout"));
      setMealCustomizations(toCustomizationMap(preferences, "Meal"));
      setProfile(userProfile);
      setWeightHistory(userWeightHistory);
    }

    loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeWorkoutPlan = workoutActivation
    ? workoutPlans.find((plan) => plan.id.toString() === workoutActivation.planIdentifier) ?? null
    : null;
  const activeMealPlan = mealActivation
    ? mealPlans.find((plan) => plan.id.toString() === mealActivation.planIdentifier) ?? null
    : null;

  const workoutStartedOnDate =
    activeWorkoutPlan && workoutActivation
      ? selectedDateKey >= workoutActivation.activatedAt
      : Boolean(activeWorkoutPlan && !workoutActivation);

  const workoutDayInfo: ActiveDayInfo | null =
    workoutActivation && activeWorkoutPlan && workoutStartedOnDate
      ? getActiveDayForDate(workoutActivation, selectedDateKey)
      : null;

  const workoutCompleted = workoutDayInfo
    ? completions.some(
      (item) =>
        item.planType === "Workout" &&
        item.dayToken === getPlanDayToken(activeWorkoutPlan!.id, workoutActivation!.id, workoutDayInfo.dayId) &&
        item.dateKey === selectedDateKey,
    )
    : completions.some(
      (item) =>
        item.planType === "Workout" &&
        item.dateKey === selectedDateKey &&
        item.dayToken.startsWith(getActivationTokenPrefix(activeWorkoutPlan?.id ?? "", workoutActivation?.id)),
    );

  const totalWorkoutExercises =
    activeWorkoutPlan?.days.reduce((sum, day) => sum + (day.dayExercises?.length ?? day.exercises.length), 0) ?? 0;

  const activeWorkoutIndex = activeWorkoutPlan
    ? Math.max(0, workoutPlans.findIndex((p) => p.id === activeWorkoutPlan.id))
    : 0;
  const workoutCustomization = activeWorkoutPlan ? workoutCustomizations[activeWorkoutPlan.id] : undefined;
  const workoutAccent = getThemeById(
    workoutCustomization?.colorId ?? DEFAULT_THEME_IDS[activeWorkoutIndex % DEFAULT_THEME_IDS.length],
  );
  const workoutImageUrl = workoutCustomization?.imageUrl;

  const workoutHref = activeWorkoutPlan
    ? `/gym-plan?planId=${activeWorkoutPlan.id}&date=${selectedDateKey}${workoutDayInfo ? `&dayId=${workoutDayInfo.dayId}` : ""}`
    : "#";

  const mealStartedOnDate =
    activeMealPlan && mealActivation
      ? selectedDateKey >= getActivationStartKey(mealActivation)
      : Boolean(activeMealPlan && !mealActivation);
  const mealDayInfo: ActiveDayInfo | null =
    mealActivation && activeMealPlan && mealStartedOnDate
      ? getActiveDayForDate(mealActivation, selectedDateKey)
      : null;
  const mealCompleted = (() => {
    if (!mealDayInfo || !activeMealPlan || !mealActivation) return false;

    const dayToken = getPlanDayToken(activeMealPlan.id, mealActivation.id, mealDayInfo.dayId);
    const completedTokens = new Set(
      completions
        .filter((item) => item.planType === "Meal" && item.dateKey === selectedDateKey)
        .map((item) => item.dayToken),
    );
    if (completedTokens.has(dayToken)) return true;

    const slotsWithFood = activeMealPlan.days[mealDayInfo.dayIndex]?.categories
      .filter((category) => category.items.length > 0)
      .map((category) => category.slot) ?? [];
    return slotsWithFood.length > 0 && slotsWithFood.every((slot) =>
      completedTokens.has(getMealSlotToken(activeMealPlan.id, mealActivation.id, mealDayInfo.dayId, slot)),
    );
  })();
  const mealCustomization = activeMealPlan ? mealCustomizations[activeMealPlan.id] : undefined;
  const mealAccent = getThemeById(mealCustomization?.colorId ?? "orange");
  const mealImageUrl = mealCustomization?.imageUrl;
  const mealHref = activeMealPlan
    ? `/meal-plan?planId=${activeMealPlan.id}&date=${selectedDateKey}${mealDayInfo ? `&dayId=${mealDayInfo.dayId}` : ""}`
    : "#";

  const getMealDayTotals = (dayIndex: number): MacroChartData & { calories: number } => {
    const day = activeMealPlan?.days[dayIndex];
    if (!day) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

    return day.categories
      .flatMap((category) => category.items)
      .reduce(
        (totals, item) => ({
          calories: totals.calories + item.kcal,
          protein: totals.protein + item.protein,
          carbs: totals.carbs + item.carbs,
          fats: totals.fats + item.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
      );
  };

  const getConsumedMealTotals = (
    dayIndex: number,
    dateKey: string,
  ): MacroChartData & { calories: number } => {
    const empty = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const day = activeMealPlan?.days[dayIndex];
    if (!day || !mealActivation || !activeMealPlan) return empty;

    const dayId = `day-${dayIndex + 1}`;
    const dayToken = getPlanDayToken(activeMealPlan.id, mealActivation.id, dayId);
    const completedTokens = new Set(
      completions
        .filter((item) => item.planType === "Meal" && item.dateKey === dateKey)
        .map((item) => item.dayToken),
    );

    if (completedTokens.has(dayToken)) return getMealDayTotals(dayIndex);

    return day.categories
      .filter((category) =>
        completedTokens.has(getMealSlotToken(activeMealPlan.id, mealActivation.id, dayId, category.slot)),
      )
      .flatMap((category) => category.items)
      .reduce(
        (totals, item) => ({
          calories: totals.calories + item.kcal,
          protein: totals.protein + item.protein,
          carbs: totals.carbs + item.carbs,
          fats: totals.fats + item.fats,
        }),
        empty,
      );
  };

  const todayMealTotals = mealDayInfo
    ? getMealDayTotals(mealDayInfo.dayIndex)
    : { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const consumedMealTotalsToday = mealDayInfo
    ? getConsumedMealTotals(mealDayInfo.dayIndex, selectedDateKey)
    : { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const mealCaloriesConsumedToday = Math.round(consumedMealTotalsToday.calories);

  const weightForDate = (dateKey: string): number => {
    const historicalWeight = [...weightHistory]
      .filter((entry) => entry.recordedAt.slice(0, 10) <= dateKey)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0]?.weight;
    return historicalWeight ?? profile?.weight ?? 70;
  };

  const estimateWorkoutCalories = (dayIndex: number, dateKey: string): number => {
    const day = activeWorkoutPlan?.days[dayIndex];
    if (!day) return 0;

    const weight = weightForDate(dateKey);
    const dayExercises = day.dayExercises ?? [];

    const total = dayExercises.length
      ? dayExercises.reduce((sum, item) => {
          const setCount = Math.max(1, item.sets.length);
          const pauseMinutes = (item.pauseTime?.minutes ?? 0) + (item.pauseTime?.seconds ?? 0) / 60;
          const estimatedMinutes = setCount * 0.75 + Math.max(0, setCount - 1) * pauseMinutes;
          const metValue = item.exercise.metValue || 5;
          return sum + (metValue * 3.5 * weight * Math.max(estimatedMinutes, 3)) / 200;
        }, 0)
      : day.exercises.reduce(
          (sum, exercise) => sum + ((exercise.metValue || 5) * 3.5 * weight * 5) / 200,
          0,
        );

    return Math.round(total);
  };

  const energyChartData: EnergyChartPoint[] = getHistoryDays(7).reverse().map((dateKey) => {
    const label = parseDateKey(dateKey).toLocaleDateString("en-GB", { weekday: "short" });
    let consumed = 0;
    let burned = 0;

    if (activeMealPlan && mealActivation && dateKey >= getActivationStartKey(mealActivation)) {
      const dayInfo = getActiveDayForDate(mealActivation, dateKey);
      consumed = Math.round(getConsumedMealTotals(dayInfo.dayIndex, dateKey).calories);
    }

    if (activeWorkoutPlan && workoutActivation && dateKey >= getActivationStartKey(workoutActivation)) {
      const dayInfo = getActiveDayForDate(workoutActivation, dateKey);
      const completed = completions.some(
        (item) =>
          item.planType === "Workout" &&
          item.dateKey === dateKey &&
          item.dayToken === getPlanDayToken(activeWorkoutPlan.id, workoutActivation.id, dayInfo.dayId),
      );
      if (completed) burned = estimateWorkoutCalories(dayInfo.dayIndex, dateKey);
    }

    return { date: dateKey, label, consumed, burned };
  });

  const weightChartData: WeightChartPoint[] = weightHistory
    .slice(-12)
    .map((entry) => ({
      date: entry.recordedAt,
      label: new Date(entry.recordedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      weight: entry.weight,
    }));

  const macroGoal = (() => {
    const weight = profile?.weight && profile.weight > 0 ? profile.weight : 70;
    const calories = profile?.tdee && profile.tdee > 0
      ? profile.tdee + 300
      : Math.max(todayMealTotals.calories + 250, 2_200);
    const protein = weight * 1.8;
    const fats = weight * 0.8;
    const carbs = Math.max(0, (calories - protein * 4 - fats * 9) / 4);
    return { protein, carbs, fats };
  })();

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-8">

        <section className="reveal-up reveal-delay-1 mb-6">
          <CalorieProgressCard
            consumedCalories={mealCaloriesConsumedToday}
            totalCalories={Math.round(todayMealTotals.calories)}
          />
        </section>

        <DashboardStatistics
          energy={energyChartData}
          macros={consumedMealTotalsToday}
          macroGoal={macroGoal}
          weight={weightChartData}
        />

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
                stats={[
                  { icon: "dumbbell", label: `${totalWorkoutExercises} exercises` },
                ]}
              />
            </div>
          )}

          {/* Meal plan — loads from API in future */}
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
                stats={[
                  { icon: "flame", label: `${Math.round(todayMealTotals.calories).toLocaleString()} kcal / day` },
                ]}
              />
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
