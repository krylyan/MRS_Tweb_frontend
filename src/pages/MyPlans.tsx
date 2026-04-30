import { AlertTriangle, CalendarDays, Check, Clock, Dumbbell, Flame, Image, MoreHorizontal, Palette, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteWorkoutPlan, getActivePlanId, getWorkoutPlans, setActivePlanId } from "../utils/planStorage";
import type { StoredWorkoutPlan } from "../utils/planStorage";

type PlanCategory = "workout" | "alimentation";

export interface MockMealPlan {
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

interface PendingDelete {
  type: "workout" | "meal";
  id: string;
  name: string;
}

const FAVORITES_KEY = "fitlife_favorite_workout_plans";
const CUSTOMIZATIONS_KEY = "fitlife_plan_customizations";

export interface PlanCustomization {
  colorId: string;
  imageUrl: string;
}

export type PlanCustomizations = Record<string, PlanCustomization>;

export const PLAN_THEMES = [
  { id: "emerald",  dot: "#10b981", card: "border-emerald-500/40 bg-gradient-to-br from-emerald-600/25 to-emerald-900/40 hover:border-emerald-400/60 hover:shadow-emerald-500/20",  btn: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30",  badge: "bg-emerald-600/90",  imgBg: "from-emerald-800/50 to-emerald-950/80" },
  { id: "blue",     dot: "#3b82f6", card: "border-blue-500/40 bg-gradient-to-br from-blue-600/25 to-blue-900/40 hover:border-blue-400/60 hover:shadow-blue-500/20",           btn: "bg-blue-500 hover:bg-blue-400 shadow-blue-500/30",           badge: "bg-blue-600/90",     imgBg: "from-blue-800/50 to-blue-950/80" },
  { id: "purple",   dot: "#a855f7", card: "border-purple-500/40 bg-gradient-to-br from-purple-600/25 to-purple-900/40 hover:border-purple-400/60 hover:shadow-purple-500/20",   btn: "bg-purple-500 hover:bg-purple-400 shadow-purple-500/30",   badge: "bg-purple-600/90",   imgBg: "from-purple-800/50 to-purple-950/80" },
  { id: "orange",   dot: "#f97316", card: "border-orange-500/40 bg-gradient-to-br from-orange-600/20 to-amber-900/40 hover:border-orange-400/60 hover:shadow-orange-500/20",   btn: "bg-orange-500 hover:bg-orange-400 shadow-orange-500/30",   badge: "bg-orange-600/90",   imgBg: "from-orange-800/50 to-amber-950/80" },
  { id: "rose",     dot: "#e11d48", card: "border-rose-500/40 bg-gradient-to-br from-rose-600/25 to-rose-950/40 hover:border-rose-400/60 hover:shadow-rose-500/20",           btn: "bg-rose-500 hover:bg-rose-400 shadow-rose-500/30",           badge: "bg-rose-700/90",     imgBg: "from-rose-800/50 to-rose-950/80" },
  { id: "teal",     dot: "#14b8a6", card: "border-teal-500/40 bg-gradient-to-br from-teal-600/25 to-teal-900/40 hover:border-teal-400/60 hover:shadow-teal-500/20",           btn: "bg-teal-500 hover:bg-teal-400 shadow-teal-500/30",           badge: "bg-teal-600/90",     imgBg: "from-teal-800/50 to-teal-950/80" },
  { id: "cyan",     dot: "#06b6d4", card: "border-cyan-500/40 bg-gradient-to-br from-cyan-600/25 to-cyan-900/40 hover:border-cyan-400/60 hover:shadow-cyan-500/20",           btn: "bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/30",           badge: "bg-cyan-600/90",     imgBg: "from-cyan-800/50 to-cyan-950/80" },
  { id: "indigo",   dot: "#6366f1", card: "border-indigo-500/40 bg-gradient-to-br from-indigo-600/25 to-indigo-900/40 hover:border-indigo-400/60 hover:shadow-indigo-500/20",   btn: "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/30",   badge: "bg-indigo-600/90",   imgBg: "from-indigo-800/50 to-indigo-950/80" },
  { id: "amber",    dot: "#f59e0b", card: "border-amber-500/40 bg-gradient-to-br from-amber-600/25 to-amber-900/40 hover:border-amber-400/60 hover:shadow-amber-500/20",       btn: "bg-amber-500 hover:bg-amber-400 shadow-amber-500/30",       badge: "bg-amber-600/90",    imgBg: "from-amber-800/50 to-amber-950/80" },
  { id: "slate",    dot: "#64748b", card: "border-slate-500/40 bg-gradient-to-br from-slate-600/25 to-slate-900/40 hover:border-slate-400/60 hover:shadow-slate-500/20",       btn: "bg-slate-500 hover:bg-slate-400 shadow-slate-500/30",       badge: "bg-slate-600/90",    imgBg: "from-slate-700/50 to-slate-950/80" },
] as const;

export const DEFAULT_THEME_IDS = ["emerald", "blue", "purple", "orange"] as const;

export const readCustomizations = (): PlanCustomizations => {
  try {
    const raw = localStorage.getItem(CUSTOMIZATIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PlanCustomizations;
  } catch { return {}; }
};

const writeCustomizations = (data: PlanCustomizations) =>
  localStorage.setItem(CUSTOMIZATIONS_KEY, JSON.stringify(data));

export const getThemeById = (id: string) =>
  PLAN_THEMES.find((t) => t.id === id) ?? PLAN_THEMES[0];


export const ALIMENTATION_PLANS: MockMealPlan[] = [
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

const MEAL_FAVORITES_KEY = "fitlife_favorite_meal_plans";
const ACTIVE_MEAL_KEY = "fitlife_active_meal_plan";
const MEAL_CUSTOMIZATIONS_KEY = "fitlife_meal_customizations";
const HIDDEN_MEAL_KEY = "fitlife_hidden_meal_plans";

const readMealFavoriteIds = (): string[] => {
  try {
    const raw = localStorage.getItem(MEAL_FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch { return []; }
};

const readHiddenMealIds = (): string[] => {
  try {
    const raw = localStorage.getItem(HIDDEN_MEAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch { return []; }
};

export const readMealCustomizations = (): PlanCustomizations => {
  try {
    const raw = localStorage.getItem(MEAL_CUSTOMIZATIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PlanCustomizations;
  } catch { return {}; }
};

const readFavoriteIds = (): string[] => {
  const raw = localStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch { return []; }
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
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [customizations, setCustomizations] = useState<PlanCustomizations>(() => readCustomizations());
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Meal plan state
  const [favoriteMealIds, setFavoriteMealIds] = useState<string[]>(() => readMealFavoriteIds());
  const [hiddenMealIds, setHiddenMealIds] = useState<string[]>(() => readHiddenMealIds());
  const [activeMealPlanId, setActiveMealPlanId] = useState<string | null>(() => localStorage.getItem(ACTIVE_MEAL_KEY));
  const [openMealMenuId, setOpenMealMenuId] = useState<string | null>(null);
  const [editingMealPlanId, setEditingMealPlanId] = useState<string | null>(null);
  const [mealCustomizations, setMealCustomizations] = useState<PlanCustomizations>(() => readMealCustomizations());
  const mealMenuRef = useRef<HTMLDivElement | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    if (openMenuId) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openMenuId]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (mealMenuRef.current && !mealMenuRef.current.contains(e.target as Node)) setOpenMealMenuId(null);
    };
    if (openMealMenuId) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openMealMenuId]);

  const handleSetActive = (planId: string) => {
    const nextId = activePlanId === planId ? null : planId;
    setActivePlanId(nextId);
    setActivePlanIdState(nextId);
    setOpenMenuId(null);
  };

  const handleSetMealActive = (planId: string) => {
    const nextId = activeMealPlanId === planId ? null : planId;
    if (nextId) localStorage.setItem(ACTIVE_MEAL_KEY, nextId);
    else localStorage.removeItem(ACTIVE_MEAL_KEY);
    setActiveMealPlanId(nextId);
    setOpenMealMenuId(null);
  };

  const handleToggleMealFavorite = (planId: string) => {
    setFavoriteMealIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId],
    );
    setOpenMealMenuId(null);
  };

  const requestDeleteMealPlan = (plan: MockMealPlan) => {
    setPendingDelete({ type: "meal", id: plan.id, name: plan.name });
    setOpenMealMenuId(null);
  };

  const handleSaveMealCustomization = (planId: string, colorId: string, imageUrl: string) => {
    const next = { ...mealCustomizations, [planId]: { colorId, imageUrl } };
    setMealCustomizations(next);
    localStorage.setItem(MEAL_CUSTOMIZATIONS_KEY, JSON.stringify(next));
    setEditingMealPlanId(null);
  };

  useEffect(() => {
    localStorage.setItem(MEAL_FAVORITES_KEY, JSON.stringify(favoriteMealIds));
  }, [favoriteMealIds]);


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

  const sortedWorkoutPlans = useMemo<DisplayPlan[]>(() => {
    const active = allWorkoutPlans.filter((p) => p.id === activePlanId);
    const favOrder = [...favoriteIds].reverse(); // newest favorite first
    const favorites = favOrder
      .map((id) => allWorkoutPlans.find((p) => p.id === id && p.id !== activePlanId))
      .filter((p): p is DisplayPlan => p !== undefined);
    const rest = allWorkoutPlans.filter(
      (p) => p.id !== activePlanId && !favoriteIds.includes(p.id),
    );
    return [...active, ...favorites, ...rest];
  }, [allWorkoutPlans, activePlanId, favoriteIds]);

  const requestDeletePlan = (plan: DisplayPlan, deleteEnabled: boolean): void => {
    if (!deleteEnabled) return;
    setPendingDelete({ type: "workout", id: plan.id, name: plan.name });
    setOpenMenuId(null);
  };

  const handleConfirmDelete = (): void => {
    if (!pendingDelete) return;

    if (pendingDelete.type === "workout") {
      deleteWorkoutPlan(pendingDelete.id);
      setWorkoutPlans(getWorkoutPlans());
      setFavoriteIds((prev) => prev.filter((id) => id !== pendingDelete.id));
      if (activePlanId === pendingDelete.id) setActivePlanIdState(null);
    } else {
      setHiddenMealIds((prev) => {
        const next = prev.includes(pendingDelete.id) ? prev : [...prev, pendingDelete.id];
        localStorage.setItem(HIDDEN_MEAL_KEY, JSON.stringify(next));
        return next;
      });
      setFavoriteMealIds((prev) => prev.filter((id) => id !== pendingDelete.id));
      if (activeMealPlanId === pendingDelete.id) {
        localStorage.removeItem(ACTIVE_MEAL_KEY);
        setActiveMealPlanId(null);
      }
    }

    setPendingDelete(null);
  };

  const handleToggleFavorite = (planId: string, favoriteEnabled: boolean): void => {
    if (!favoriteEnabled) return;
    setFavoriteIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId],
    );
    setOpenMenuId(null);
  };

  const handleSaveCustomization = (planId: string, colorId: string, imageUrl: string) => {
    const next = { ...customizations, [planId]: { colorId, imageUrl } };
    setCustomizations(next);
    writeCustomizations(next);
    setEditingPlanId(null);
  };

  const getAccentClasses = (planId: string, index: number) => {
    const custom = customizations[planId];
    if (custom?.colorId) return getThemeById(custom.colorId);
    const defaultId = DEFAULT_THEME_IDS[index % 4];
    return getThemeById(defaultId);
  };


  const renderPlanCard = (plan: DisplayPlan, index: number, sectionKey: string) => {
    const isFavorite = favoriteIds.includes(plan.id);
    const isActive = activePlanId === plan.id;
    const isMenuOpen = openMenuId === plan.id;
    const accent = getAccentClasses(plan.id, index);
    const customImg = customizations[plan.id]?.imageUrl;
    const estMinutes = plan.statValue > 0 ? plan.statValue * 45 : 45;

    return (
      <article
        key={`${sectionKey}-${plan.id}`}
        className={`reveal-up relative flex flex-col rounded-2xl border shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
          accent.card
        } ${isActive ? "ring-2 ring-emerald-400/60" : ""}`}
      >
        {/* Image area */}
        <div className={`relative flex h-44 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br ${accent.imgBg}`}>
          {customImg ? (
            <img src={customImg} alt={plan.name} className="h-full w-full object-cover" />
          ) : (
            <Dumbbell className="h-16 w-16 text-white/20" />
          )}
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
        </div>

        {/* Star badge — only when favorite, non-clickable */}
        {isFavorite && (
          <div className="absolute right-12 top-2 z-10">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-black/40 backdrop-blur-sm text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
            </span>
          </div>
        )}

        {/* ⋯ Menu — sibling to image div, positioned on article (no overflow-hidden parent) */}
        <div className="absolute right-2 top-2 z-10" ref={isMenuOpen ? menuRef : null}>
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
                  <Star className={`h-4 w-4 ${isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
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

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => { setOpenMenuId(null); setEditingPlanId(plan.id); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.07]"
                >
                  <Palette className="h-4 w-4 text-slate-400" />
                  Edit
                </button>

                {/* Divider */}
                <div className="mx-3 border-t border-white/8" />

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => requestDeletePlan(plan, plan.deleteEnabled)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col rounded-b-2xl p-4">
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
    const isMealFavorite = favoriteMealIds.includes(plan.id);
    const isMealActive = activeMealPlanId === plan.id;
    const isMealMenuOpen = openMealMenuId === plan.id;
    const mealCustom = mealCustomizations[plan.id];
    const accent = mealCustom?.colorId ? getThemeById(mealCustom.colorId) : getThemeById(DEFAULT_THEME_IDS[index % 4]);
    const customImg = mealCustom?.imageUrl;
    const displayImg = customImg || plan.imageUrl;

    return (
      <article
        key={plan.id}
        className={`reveal-up relative flex flex-col rounded-2xl border shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
          accent.card
        } ${isMealActive ? "ring-2 ring-emerald-400/60" : ""}`}
      >
        {/* Image area */}
        <div className="relative h-44 overflow-hidden rounded-t-2xl">
          <img src={displayImg} alt={plan.name} className="h-full w-full object-cover" loading="lazy" />
          {/* Kcal badge */}
          <span className={`absolute bottom-3 left-3 rounded-lg ${accent.badge} px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm`}>
            {plan.kcal.toLocaleString()} kcal
          </span>
          {/* Active badge */}
          {isMealActive && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-emerald-500/90 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
              <Check className="h-3 w-3" />
              Active
            </span>
          )}
        </div>

        {/* Star badge — only when favorite */}
        {isMealFavorite && (
          <div className="absolute right-12 top-2 z-10">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-black/40 backdrop-blur-sm text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
            </span>
          </div>
        )}

        {/* ⋯ Menu — on article, no overflow-hidden parent */}
        <div className="absolute right-2 top-2 z-10" ref={isMealMenuOpen ? mealMenuRef : null}>
          <button
            type="button"
            aria-label="Plan options"
            onClick={() => setOpenMealMenuId(isMealMenuOpen ? null : plan.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-white/70 transition-all hover:bg-black/60 hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {isMealMenuOpen && (
            <div className="dropdown-menu absolute right-0 top-10 z-50 min-w-[180px] overflow-hidden rounded-2xl border border-white/12 bg-slate-900/95 shadow-[0_20px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => handleToggleMealFavorite(plan.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.07]"
              >
                <Star className={`h-4 w-4 ${isMealFavorite ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
                {isMealFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </button>
              <button
                type="button"
                onClick={() => handleSetMealActive(plan.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.07]"
              >
                <Check className={`h-4 w-4 ${isMealActive ? "text-emerald-400" : "text-slate-400"}`} />
                {isMealActive ? "Unset Active" : "Set as Active"}
              </button>
              <button
                type="button"
                onClick={() => { setOpenMealMenuId(null); setEditingMealPlanId(plan.id); }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.07]"
              >
                <Palette className="h-4 w-4 text-slate-400" />
                Edit
              </button>
              <div className="mx-3 border-t border-white/8" />
              <button
                type="button"
                onClick={() => requestDeleteMealPlan(plan)}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col rounded-b-2xl p-4">
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
          <h3 className="mb-4 break-words text-base font-bold leading-snug text-slate-50">{plan.name}</h3>
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
            renderSection("Saved Workouts", sortedWorkoutPlans, "all-workouts", true)
          ) : (() => {
            const visibleMeals = ALIMENTATION_PLANS.filter((p) => !hiddenMealIds.includes(p.id));
            const sortedMeals = [
              ...visibleMeals.filter((p) => p.id === activeMealPlanId),
              ...[...favoriteMealIds].reverse()
                .map((id) => visibleMeals.find((p) => p.id === id && p.id !== activeMealPlanId))
                .filter((p): p is typeof ALIMENTATION_PLANS[number] => p !== undefined),
              ...visibleMeals.filter((p) => p.id !== activeMealPlanId && !favoriteMealIds.includes(p.id)),
            ];
            return (
              <section className="reveal-up reveal-delay-1 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-50">Meal Plans</h2>
                  <span className="text-sm text-slate-400">{sortedMeals.length} plans</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {sortedMeals.map((plan, index) => renderMealCard(plan, index))}
                  {renderAddMealCard("meal-add")}
                </div>
              </section>
            );
          })()}
        </div>
      </div>

      {/* Edit Workout Plan Modal */}
      {editingPlanId && (() => {
        const editPlan = workoutPlans.find((p) => p.id === editingPlanId);
        if (!editPlan) return null;
        const planIndex = workoutPlans.findIndex((p) => p.id === editingPlanId);
        const currentCustom = customizations[editingPlanId];
        const currentColorId = currentCustom?.colorId ?? DEFAULT_THEME_IDS[planIndex % 4];
        const currentImageUrl = currentCustom?.imageUrl ?? "";
        return (
          <EditPlanModal
            planName={editPlan.name}
            currentColorId={currentColorId}
            currentImageUrl={currentImageUrl}
            onSave={(colorId, imageUrl) => handleSaveCustomization(editingPlanId, colorId, imageUrl)}
            onClose={() => setEditingPlanId(null)}
          />
        );
      })()}

      {/* Edit Meal Plan Modal */}
      {editingMealPlanId && (() => {
        const editPlan = ALIMENTATION_PLANS.find((p) => p.id === editingMealPlanId);
        if (!editPlan) return null;
        const planIndex = ALIMENTATION_PLANS.findIndex((p) => p.id === editingMealPlanId);
        const currentCustom = mealCustomizations[editingMealPlanId];
        const currentColorId = currentCustom?.colorId ?? DEFAULT_THEME_IDS[planIndex % 4];
        const currentImageUrl = currentCustom?.imageUrl ?? "";
        return (
          <EditPlanModal
            planName={editPlan.name}
            currentColorId={currentColorId}
            currentImageUrl={currentImageUrl}
            onSave={(colorId, imageUrl) => handleSaveMealCustomization(editingMealPlanId, colorId, imageUrl)}
            onClose={() => setEditingMealPlanId(null)}
          />
        );
      })()}

      {pendingDelete ? (
        <ConfirmDeleteModal
          planName={pendingDelete.name}
          planType={pendingDelete.type}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </main>
  );
}

interface ConfirmDeleteModalProps {
  planName: string;
  planType: "workout" | "meal";
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteModal({ planName, planType, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/12 bg-slate-900/98 shadow-[0_32px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        <div className="border-b border-white/8 px-6 py-5">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-300/25 bg-rose-500/12 text-rose-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Delete plan?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Are you sure you want to delete the {planType === "workout" ? "workout" : "alimentation"} plan
            <span className="font-semibold text-slate-200"> {planName}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 px-6 py-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.08]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-400"
          >
            Delete plan
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditPlanModalProps {
  planName: string;
  currentColorId: string;
  currentImageUrl: string;
  onSave: (colorId: string, imageUrl: string) => void;
  onClose: () => void;
}

function EditPlanModal({ planName, currentColorId, currentImageUrl, onSave, onClose }: EditPlanModalProps) {
  const [selectedColor, setSelectedColor] = useState(currentColorId);
  const [imageData, setImageData] = useState(currentImageUrl); // base64 or empty
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const preview = PLAN_THEMES.find((t) => t.id === selectedColor) ?? PLAN_THEMES[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageData(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="dropdown-menu relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/12 bg-slate-900/98 shadow-[0_32px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-white">Edit Plan</h2>
            <p className="text-sm text-slate-400">{planName}</p>
          </div>
        </div>

        {/* Preview — click to pick image */}
        <div
          className={`relative mx-6 mt-5 flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${preview.imgBg} group`}
          onClick={() => fileInputRef.current?.click()}
          title="Click to change image"
        >
          {imageData ? (
            <img src={imageData} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <Dumbbell className="h-12 w-12 text-white/20" />
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 transition-all group-hover:bg-black/50">
            <Image className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">Click to change</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />


        {/* Color Picker */}
        <div className="px-6 pt-5">
          <p className="mb-3 text-sm font-medium text-slate-300">Color Theme</p>
          <div className="flex flex-wrap gap-3">
            {PLAN_THEMES.map((theme) => {
              const isSelected = selectedColor === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  aria-label={theme.id}
                  onClick={() => setSelectedColor(theme.id)}
                  className={`relative h-9 w-9 rounded-full transition-all duration-150 ${
                    isSelected ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: theme.dot }}
                >
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white drop-shadow" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.08]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(selectedColor, imageData)}
            className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-400"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
