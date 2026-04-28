import { CalendarDays, Check, Clock, Dumbbell, Flame, Heart, MoreHorizontal, Palette, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteWorkoutPlan, getActivePlanId, getWorkoutPlans, setActivePlanId } from "../utils/planStorage";
import type { StoredWorkoutPlan } from "../utils/planStorage";

type PlanCategory = "workout" | "alimentation";

interface MockMealPlan {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  meals: number;
  kcal: number;
  carbs: number;
  proteins: number;
  fats: number;
  imageUrl: string;
}

interface DisplayPlan {
  id: string;
  sourceType: "workout" | "alimentation";
  label: "Workout" | "Alimentation";
  name: string;
  updatedAt: string;
  statLabel: "Days" | "Meals";
  statValue: number;
  exerciseCount: number;
  detailsEnabled: boolean;
  favoriteEnabled: boolean;
  deleteEnabled: boolean;
}

const FAVORITES_KEY = "fitlife_favorite_workout_plans";

const ALIMENTATION_PLANS: MockMealPlan[] = [
  {
    id: "meal-plan-cut",
    name: "Lean Cut Menu",
    description: "A low-calorie balanced plan designed to help you lose weight while maintaining muscle mass.",
    updatedAt: "2026-03-21T09:00:00.000Z",
    meals: 5,
    kcal: 1583,
    carbs: 50,
    proteins: 18,
    fats: 32,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&h=120&fit=crop&auto=format",
  },
  {
    id: "meal-plan-balance",
    name: "Balanced Energy Week",
    description: "A well-rounded meal plan to sustain energy levels throughout the week for active individuals.",
    updatedAt: "2026-03-20T09:00:00.000Z",
    meals: 4,
    kcal: 1950,
    carbs: 48,
    proteins: 22,
    fats: 30,
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=120&h=120&fit=crop&auto=format",
  },
  {
    id: "meal-plan-mass",
    name: "Clean Bulk Plan",
    description: "A high-protein high-calorie plan to support muscle growth during a clean bulking phase.",
    updatedAt: "2026-03-19T09:00:00.000Z",
    meals: 6,
    kcal: 2474,
    carbs: 49,
    proteins: 24,
    fats: 27,
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=120&h=120&fit=crop&auto=format",
  },
  {
    id: "meal-plan-keto",
    name: "Keto Performance",
    description: "Minimal carbs, high healthy fats to keep your body in ketosis and fuel intense training sessions.",
    updatedAt: "2026-03-18T09:00:00.000Z",
    meals: 4,
    kcal: 1780,
    carbs: 8,
    proteins: 28,
    fats: 64,
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=120&h=120&fit=crop&auto=format",
  },
  {
    id: "meal-plan-veg",
    name: "Plant Power Diet",
    description: "100% plant-based macros to support your workouts while keeping your diet clean and sustainable.",
    updatedAt: "2026-03-17T09:00:00.000Z",
    meals: 5,
    kcal: 1690,
    carbs: 55,
    proteins: 20,
    fats: 25,
    imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=120&h=120&fit=crop&auto=format",
  },
];

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
  const [searchParams] = useSearchParams();
  const activeCategory: PlanCategory = (searchParams.get("tab") as PlanCategory) ?? "workout";
  const menuAreaRef = useRef<HTMLDivElement | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<StoredWorkoutPlan[]>(() => getWorkoutPlans());
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readFavoriteIds());
  const [activePlanId, setActivePlanIdState] = useState<string | null>(() => getActivePlanId());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openMenuId]);

  const handleSetActive = (planId: string) => {
    const nextId = activePlanId === planId ? null : planId;
    setActivePlanId(nextId);
    setActivePlanIdState(nextId);
    setOpenMenuId(null);
  };

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
        exerciseCount: plan.days.reduce((sum, d) => sum + d.exerciseIds.length, 0),
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

  const handleDeletePlan = (planId: string, deleteEnabled: boolean): void => {
    if (!deleteEnabled) return;
    deleteWorkoutPlan(planId);
    setWorkoutPlans(getWorkoutPlans());
    setFavoriteIds((prev) => prev.filter((id) => id !== planId));
    if (activePlanId === planId) setActivePlanIdState(null);
    setOpenMenuId(null);
  };

  const handleToggleFavorite = (planId: string, favoriteEnabled: boolean): void => {
    if (!favoriteEnabled) return;
    setFavoriteIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId],
    );
    setOpenMenuId(null);
  };

  const getAccentClasses = (index: number) => {
    if (index % 4 === 0)
      return {
        card: "border-emerald-500/40 bg-gradient-to-br from-emerald-600/25 to-emerald-900/40 hover:border-emerald-400/60 hover:shadow-emerald-500/20",
        icon: "bg-emerald-500/20 border-emerald-400/30 text-emerald-300",
        btn: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30",
        heart: "hover:text-rose-400",
        badge: "bg-emerald-600/90",
        imgBg: "from-emerald-800/50 to-emerald-950/80",
      };
    if (index % 4 === 1)
      return {
        card: "border-blue-500/40 bg-gradient-to-br from-blue-600/25 to-blue-900/40 hover:border-blue-400/60 hover:shadow-blue-500/20",
        icon: "bg-blue-500/20 border-blue-400/30 text-blue-300",
        btn: "bg-blue-500 hover:bg-blue-400 shadow-blue-500/30",
        heart: "hover:text-rose-400",
        badge: "bg-blue-600/90",
        imgBg: "from-blue-800/50 to-blue-950/80",
      };
    if (index % 4 === 2)
      return {
        card: "border-purple-500/40 bg-gradient-to-br from-purple-600/25 to-purple-900/40 hover:border-purple-400/60 hover:shadow-purple-500/20",
        icon: "bg-purple-500/20 border-purple-400/30 text-purple-300",
        btn: "bg-purple-500 hover:bg-purple-400 shadow-purple-500/30",
        heart: "hover:text-rose-400",
        badge: "bg-purple-600/90",
        imgBg: "from-purple-800/50 to-purple-950/80",
      };
    return {
      card: "border-orange-500/40 bg-gradient-to-br from-orange-600/20 to-amber-900/40 hover:border-orange-400/60 hover:shadow-orange-500/20",
      icon: "bg-orange-500/20 border-orange-400/30 text-orange-300",
      btn: "bg-orange-500 hover:bg-orange-400 shadow-orange-500/30",
      heart: "hover:text-rose-400",
      badge: "bg-orange-600/90",
      imgBg: "from-orange-800/50 to-amber-950/80",
    };
  };

  const renderPlanCard = (plan: DisplayPlan, index: number, sectionKey: string) => {
    const isFavorite = favoriteIds.includes(plan.id);
    const isActive = activePlanId === plan.id;
    const isMenuOpen = openMenuId === plan.id;
    const accent = getAccentClasses(index);
    const estMinutes = plan.statValue > 0 ? plan.statValue * 45 : 45;

    return (
      <article
        key={`${sectionKey}-${plan.id}`}
        className={`reveal-up flex flex-col overflow-hidden rounded-2xl border shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
          accent.card
        } ${isActive ? "ring-2 ring-emerald-400/60" : ""}`}
      >
        {/* Image area */}
        <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${accent.imgBg}`}>
          <Dumbbell className="h-16 w-16 text-white/20" />
          {/* Days badge */}
          <span className={`absolute bottom-3 left-3 rounded-lg ${accent.badge} px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm`}>
            {plan.statValue} {plan.statLabel === "Days" ? "days" : "meals"}
          </span>
          {/* Active badge */}
          {isActive && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-emerald-500/90 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
              <Check className="h-3 w-3" />
              Active
            </span>
          )}
          {/* ⋯ Menu button */}
          <div className="absolute right-2 top-2" ref={isMenuOpen ? menuRef : null}>
            <button
              type="button"
              aria-label="Plan options"
              onClick={() => setOpenMenuId(isMenuOpen ? null : plan.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-white/70 transition-all hover:bg-black/60 hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {/* Dropdown */}
            {isMenuOpen && (
              <div className="dropdown-menu absolute right-0 top-10 z-50 min-w-[180px] overflow-hidden rounded-2xl border border-white/12 bg-slate-900/95 shadow-[0_20px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                {/* Add to Favorites */}
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(plan.id, plan.favoriteEnabled)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.07]"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-400 text-rose-400" : "text-slate-400"}`} />
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </button>

                {/* Set as Active */}
                <button
                  type="button"
                  onClick={() => handleSetActive(plan.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.07]"
                >
                  <Check className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  {isActive ? "Unset Active" : "Set as Active"}
                </button>

                {/* Edit Color — placeholder */}
                <button
                  type="button"
                  onClick={() => setOpenMenuId(null)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.07]"
                >
                  <Palette className="h-4 w-4 text-slate-500" />
                  Edit Color
                  <span className="ml-auto rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] text-slate-500">soon</span>
                </button>

                {/* Divider */}
                <div className="mx-3 border-t border-white/8" />

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeletePlan(plan.id, plan.deleteEnabled)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          {/* Stats row */}
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {plan.statValue} {plan.statLabel === "Days" ? "training days" : "meals"}
            </span>
            {plan.sourceType === "workout" && (
              <>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  {plan.exerciseCount} exercises
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  ~{estMinutes} min
                </span>
              </>
            )}
          </div>

          {/* Name */}
          <h3 className="mb-4 break-words text-base font-bold leading-snug text-slate-50">
            {plan.name}
          </h3>

          {/* Open button */}
          <button
            type="button"
            onClick={() => {
              if (!plan.detailsEnabled) return;
              navigate(`/gym-plan?planId=${plan.id}`);
            }}
            disabled={!plan.detailsEnabled}
            className={`mt-auto w-full rounded-[10px] py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
              accent.btn
            }`}
          >
            Open Plan
          </button>
        </div>
      </article>
    );
  };

  const renderMealCard = (plan: MockMealPlan, index: number) => {
    const accent = getAccentClasses(index);
    return (
      <article
        key={plan.id}
        className={`reveal-up flex flex-col overflow-hidden rounded-2xl border shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
          accent.card
        }`}
      >
        {/* Image area */}
        <div className="relative h-44">
          <img
            src={plan.imageUrl}
            alt={plan.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {/* Kcal badge */}
          <span className={`absolute bottom-3 left-3 rounded-lg ${accent.badge} px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm`}>
            {plan.kcal.toLocaleString()} kcal
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          {/* Stats row */}
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              {plan.kcal.toLocaleString()} kcal / day
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {plan.meals} meals
            </span>
          </div>

          {/* Macro bar */}
          <div className="mb-1 flex h-1.5 overflow-hidden rounded-full">
            <div className="bg-emerald-500" style={{ width: `${plan.proteins}%` }} />
            <div className="bg-orange-400" style={{ width: `${plan.fats}%` }} />
            <div className="bg-blue-400" style={{ width: `${plan.carbs}%` }} />
          </div>
          <div className="mb-3 flex gap-3 text-[10px]">
            <span className="text-emerald-400">{plan.proteins}% protein</span>
            <span className="text-orange-400">{plan.fats}% fats</span>
            <span className="text-blue-400">{plan.carbs}% carbs</span>
          </div>

          {/* Name */}
          <h3 className="mb-4 break-words text-base font-bold leading-snug text-slate-50">
            {plan.name}
          </h3>

          {/* Open button */}
          <button
            type="button"
            onClick={() => navigate("/meal-plan")}
            className={`mt-auto w-full rounded-[10px] py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 ${
              accent.btn
            }`}
          >
            Open Plan
          </button>
        </div>
      </article>
    );
  };

  const renderAddMealCard = (key: string) => (
    <button
      key={key}
      type="button"
      onClick={() => navigate("/meal-plan")}
      className="reveal-up reveal-delay-2 flex min-h-[304px] items-center justify-center rounded-[16px] border border-dashed border-white/25 bg-gradient-to-br from-white/[0.08] to-slate-900/50 p-4 text-slate-100 transition-all hover:border-emerald-300/40 hover:bg-gradient-to-br hover:from-emerald-400/18 hover:to-slate-900/55 hover:text-emerald-100"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.06]">
          <Plus className="h-8 w-8" />
        </span>
        <span className="text-lg font-semibold">Add meal plan</span>
      </div>
    </button>
  );

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

        <div ref={menuAreaRef} className="space-y-4">
          {activeCategory === "workout" ? (
            <>
              {favoritePlans.length > 0 && renderSection("Favorites", favoritePlans, "favorites")}
              {renderSection("Saved workouts", savedWorkoutPlans, "saved-workouts", true)}
            </>
          ) : (
            /* ── Alimentation grid (matches workout card style) ── */
            <section className="reveal-up reveal-delay-1 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-50">Meal Plans</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">{ALIMENTATION_PLANS.length} plans</span>
                  <button
                    type="button"
                    onClick={() => navigate("/meal-plan")}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400"
                  >
                    <Plus className="h-4 w-4" />
                    Create meal plan
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {ALIMENTATION_PLANS.map((plan, index) => renderMealCard(plan, index))}
                {renderAddMealCard("meal-add")}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
