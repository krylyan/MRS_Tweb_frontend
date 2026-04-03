import { ChevronRight, MoreHorizontal, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteWorkoutPlan, getWorkoutPlans } from "../utils/planStorage";
import type { StoredWorkoutPlan } from "../utils/planStorage";

type PlanCategory = "workout" | "alimentation";

interface MockMealPlan {
  id: string;
  name: string;
  updatedAt: string;
  meals: number;
}

interface DisplayPlan {
  id: string;
  sourceType: "workout" | "alimentation";
  label: "Workout" | "Alimentation";
  name: string;
  updatedAt: string;
  statLabel: "Days" | "Meals";
  statValue: number;
  detailsEnabled: boolean;
  favoriteEnabled: boolean;
  deleteEnabled: boolean;
}

const FAVORITES_KEY = "fitlife_favorite_workout_plans";

const ALIMENTATION_PLANS: MockMealPlan[] = [
  {
    id: "meal-plan-cut",
    name: "Lean Cut Menu",
    updatedAt: "2026-03-21T09:00:00.000Z",
    meals: 5,
  },
  {
    id: "meal-plan-balance",
    name: "Balanced Energy Week",
    updatedAt: "2026-03-20T09:00:00.000Z",
    meals: 4,
  },
  {
    id: "meal-plan-mass",
    name: "Clean Bulk Plan",
    updatedAt: "2026-03-19T09:00:00.000Z",
    meals: 6,
  },
];

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const readFavoriteIds = (): string[] => {
  const raw = localStorage.getItem(FAVORITES_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
};

export default function MyPlans() {
  const navigate = useNavigate();
  const menuAreaRef = useRef<HTMLDivElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<PlanCategory>("workout");
  const [workoutPlans, setWorkoutPlans] = useState<StoredWorkoutPlan[]>(() => getWorkoutPlans());
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readFavoriteIds());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (menuAreaRef.current && !menuAreaRef.current.contains(target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const allWorkoutPlans = useMemo<DisplayPlan[]>(
    () =>
      workoutPlans.map((plan) => ({
        id: plan.id,
        sourceType: "workout",
        label: "Workout",
        name: plan.name,
        updatedAt: plan.updatedAt,
        statLabel: "Days",
        statValue: plan.days.length,
        detailsEnabled: true,
        favoriteEnabled: true,
        deleteEnabled: true,
      })),
    [workoutPlans],
  );

  const favoritePlans = useMemo(
    () => allWorkoutPlans.filter((plan) => favoriteIds.includes(plan.id)),
    [allWorkoutPlans, favoriteIds],
  );

  const savedWorkoutPlans = useMemo(
    () => allWorkoutPlans.filter((plan) => !favoriteIds.includes(plan.id)),
    [allWorkoutPlans, favoriteIds],
  );

  const alimentationPlans = useMemo<DisplayPlan[]>(
    () =>
      ALIMENTATION_PLANS.map((plan) => ({
        id: plan.id,
        sourceType: "alimentation",
        label: "Alimentation",
        name: plan.name,
        updatedAt: plan.updatedAt,
        statLabel: "Meals",
        statValue: plan.meals,
        detailsEnabled: false,
        favoriteEnabled: false,
        deleteEnabled: false,
      })),
    [],
  );

  const handleDeletePlan = (planId: string, deleteEnabled: boolean): void => {
    if (!deleteEnabled) {
      setOpenMenuId(null);
      return;
    }

    deleteWorkoutPlan(planId);
    setWorkoutPlans(getWorkoutPlans());
    setFavoriteIds((prev) => prev.filter((id) => id !== planId));
    setOpenMenuId(null);
  };

  const handleToggleFavorite = (planId: string, favoriteEnabled: boolean): void => {
    if (!favoriteEnabled) {
      setOpenMenuId(null);
      return;
    }

    setFavoriteIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId],
    );
    setOpenMenuId(null);
  };

  const renderPlanCard = (plan: DisplayPlan, index: number, sectionKey: string) => {
    const isFavorite = favoriteIds.includes(plan.id);
    const menuId = `${sectionKey}-${plan.id}`;

    return (
      <article
        key={`${sectionKey}-${plan.id}`}
        className={`reveal-up rounded-[16px] border p-4 shadow-[0_18px_36px_rgba(0,0,0,0.2)] backdrop-blur-[6px] ${
          index % 3 === 0
            ? "border-emerald-400/50 bg-gradient-to-br from-emerald-500/30 via-teal-500/18 to-slate-900/55"
            : index % 3 === 1
              ? "border-blue-400/50 bg-gradient-to-br from-blue-500/30 via-sky-500/18 to-slate-900/55"
              : "border-purple-400/40 bg-gradient-to-br from-purple-500/28 via-fuchsia-400/14 to-slate-900/55"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="relative mb-6 flex h-40 items-start justify-between rounded-[12px] border border-white/12 bg-slate-950/28 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">{plan.label}</p>
              <h3 className="mt-2 max-w-full whitespace-normal break-words hyphens-none text-[30px] font-semibold leading-tight text-slate-50">
                {plan.name}
              </h3>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenuId((prev) => (prev === menuId ? null : menuId))}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-white/12 bg-white/[0.06] transition-all ${
                  openMenuId === menuId
                    ? "text-slate-50 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-slate-100 hover:bg-white/[0.12]"
                }`}
                aria-label={`Open actions for ${plan.name}`}
              >
                <MoreHorizontal className="h-4.5 w-4.5" />
              </button>

              {openMenuId === menuId ? (
                <div className="absolute right-0 top-[calc(100%+12px)] z-20 w-56 rounded-[14px] border border-white/12 bg-slate-950/95 p-2 shadow-[0_14px_28px_rgba(0,0,0,0.35)] backdrop-blur-[8px]">
                  <div className="pointer-events-none absolute -top-2 right-4 h-4 w-4 rotate-45 border-l border-t border-white/12 bg-slate-950/95" />
                  <button
                    type="button"
                    onClick={() => handleDeletePlan(plan.id, plan.deleteEnabled)}
                    disabled={!plan.deleteEnabled}
                    className="relative flex w-full items-center gap-3 rounded-[10px] border border-transparent px-4 py-3 text-left text-sm font-medium text-slate-100 transition-all hover:border-rose-400/20 hover:bg-rose-500/15 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.04] text-slate-200">
                      <Trash2 className="h-4 w-4" />
                    </span>
                    Delete plan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(plan.id, plan.favoriteEnabled)}
                    disabled={!plan.favoriteEnabled}
                    className="relative mt-1 flex w-full items-center gap-3 rounded-[10px] border border-transparent px-4 py-3 text-left text-sm font-medium text-slate-100 transition-all hover:border-amber-300/20 hover:bg-amber-400/12 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.04] text-slate-200">
                      <Star className="h-4 w-4" />
                    </span>
                    {isFavorite ? "Remove from favorites" : "Add to favorites"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mb-5 space-y-2 text-sm text-slate-200">
            <div className="flex items-center justify-between">
              <span>{plan.statLabel}</span>
              <span className="font-semibold text-slate-50">{plan.statValue}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Updated</span>
              <span className="font-semibold text-slate-50">{formatDate(plan.updatedAt)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!plan.detailsEnabled) {
                return;
              }
              navigate(`/gym-plan?planId=${plan.id}`);
            }}
            disabled={!plan.detailsEnabled}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/25 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-50 transition-all hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-55"
          >
            Details
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </article>
    );
  };

  const renderAddWorkoutCard = (key: string) => (
    <button
      key={key}
      type="button"
      onClick={() => navigate("/gym-plan?new=1")}
      className="reveal-up reveal-delay-2 flex min-h-[304px] items-center justify-center rounded-[16px] border border-dashed border-white/25 bg-gradient-to-br from-white/[0.08] to-slate-900/50 p-4 text-slate-100 transition-all hover:border-emerald-300/40 hover:bg-gradient-to-br hover:from-emerald-400/18 hover:to-slate-900/55 hover:text-emerald-100"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.06]">
          <Plus className="h-8 w-8" />
        </span>
        <span className="text-lg font-semibold">Add workout</span>
      </div>
    </button>
  );

  const renderSection = (title: string, plans: DisplayPlan[], sectionKey: string, showAddCard = false) => (
    <section className="reveal-up reveal-delay-1 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
        <span className="text-sm text-slate-400">{plans.length} plans</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan, index) => renderPlanCard(plan, index, sectionKey))}
        {showAddCard ? renderAddWorkoutCard(`${sectionKey}-add`) : null}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-8">
        <h1 className="reveal-up mb-4 text-3xl font-bold leading-tight text-slate-50 md:text-4xl">My Plans</h1>

        <section className="reveal-up mb-4 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px] md:p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveCategory("workout")}
              className={`rounded-[14px] p-[1px] transition-all ${
                activeCategory === "workout"
                  ? "border border-emerald-400/50 bg-gradient-to-r from-emerald-500/40 via-emerald-400/22 to-cyan-400/24 shadow-[0_0_0_1px_rgba(52,211,153,0.2),0_16px_34px_rgba(16,185,129,0.25)]"
                  : "border border-blue-400/22 bg-gradient-to-r from-blue-500/12 via-sky-400/8 to-emerald-400/10 hover:border-blue-300/30 hover:from-blue-500/16 hover:to-emerald-400/14"
              }`}
              aria-pressed={activeCategory === "workout"}
            >
              <div className="rounded-[13px] bg-slate-900/82 px-6 py-5 text-center">
                <p
                  className={`text-2xl font-semibold ${
                    activeCategory === "workout" ? "text-emerald-50" : "text-slate-100"
                  }`}
                >
                  Workout
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory("alimentation")}
              className={`rounded-[14px] p-[1px] transition-all ${
                activeCategory === "alimentation"
                  ? "border border-blue-400/50 bg-gradient-to-r from-blue-500/38 via-sky-400/22 to-emerald-400/22 shadow-[0_0_0_1px_rgba(96,165,250,0.2),0_16px_34px_rgba(59,130,246,0.25)]"
                  : "border border-blue-400/22 bg-gradient-to-r from-blue-500/12 via-sky-400/8 to-emerald-400/10 hover:border-blue-300/30 hover:from-blue-500/16 hover:to-emerald-400/14"
              }`}
              aria-pressed={activeCategory === "alimentation"}
            >
              <div className="rounded-[13px] bg-slate-900/82 px-6 py-5 text-center">
                <p
                  className={`text-2xl font-semibold ${
                    activeCategory === "alimentation" ? "text-blue-50" : "text-slate-100"
                  }`}
                >
                  Alimentation
                </p>
              </div>
            </button>
          </div>
        </section>

        <div ref={menuAreaRef} className="space-y-4">
          {activeCategory === "workout" ? (
            <>
              {renderSection("Favorites", favoritePlans, "favorites")}
              {renderSection("Saved workouts", savedWorkoutPlans, "saved-workouts", true)}
            </>
          ) : (
            renderSection("Saved alimentation plans", alimentationPlans, "alimentation")
          )}
        </div>
      </div>
    </main>
  );
}
