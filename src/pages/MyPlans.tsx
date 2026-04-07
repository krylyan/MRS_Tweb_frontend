import { CalendarDays, Clock, Dumbbell, Heart, Plus, Search, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteWorkoutPlan, getWorkoutPlans } from "../utils/planStorage";
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
  const [mealSearch, setMealSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const filteredMealPlans = useMemo(
    () =>
      ALIMENTATION_PLANS.filter((p) =>
        p.name.toLowerCase().includes(mealSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(mealSearch.toLowerCase()),
      ),
    [mealSearch],
  );

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
    if (!deleteEnabled) {
      return;
    }

    deleteWorkoutPlan(planId);
    setWorkoutPlans(getWorkoutPlans());
    setFavoriteIds((prev) => prev.filter((id) => id !== planId));
  };

  const handleToggleFavorite = (planId: string, favoriteEnabled: boolean): void => {
    if (!favoriteEnabled) {
      return;
    }

    setFavoriteIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId],
    );
  };

  const getDaysAgo = (dateStr: string): string => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
    if (diff === 0) return "today";
    if (diff === 1) return "1 day ago";
    return `${diff} days ago`;
  };

  const getAccentClasses = (index: number) => {
    if (index % 4 === 0)
      return {
        card: "border-emerald-500/40 bg-gradient-to-br from-emerald-600/25 to-emerald-900/40 hover:border-emerald-400/60 hover:shadow-emerald-500/20",
        icon: "bg-emerald-500/20 border-emerald-400/30 text-emerald-300",
        btn: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30",
        heart: "hover:text-rose-400",
      };
    if (index % 4 === 1)
      return {
        card: "border-blue-500/40 bg-gradient-to-br from-blue-600/25 to-blue-900/40 hover:border-blue-400/60 hover:shadow-blue-500/20",
        icon: "bg-blue-500/20 border-blue-400/30 text-blue-300",
        btn: "bg-blue-500 hover:bg-blue-400 shadow-blue-500/30",
        heart: "hover:text-rose-400",
      };
    if (index % 4 === 2)
      return {
        card: "border-purple-500/40 bg-gradient-to-br from-purple-600/25 to-purple-900/40 hover:border-purple-400/60 hover:shadow-purple-500/20",
        icon: "bg-purple-500/20 border-purple-400/30 text-purple-300",
        btn: "bg-purple-500 hover:bg-purple-400 shadow-purple-500/30",
        heart: "hover:text-rose-400",
      };
    return {
      card: "border-orange-500/40 bg-gradient-to-br from-orange-600/20 to-amber-900/40 hover:border-orange-400/60 hover:shadow-orange-500/20",
      icon: "bg-orange-500/20 border-orange-400/30 text-orange-300",
      btn: "bg-orange-500 hover:bg-orange-400 shadow-orange-500/30",
      heart: "hover:text-rose-400",
    };
  };

  const renderPlanCard = (plan: DisplayPlan, index: number, sectionKey: string) => {
    const isFavorite = favoriteIds.includes(plan.id);
    const accent = getAccentClasses(index);
    const estMinutes = plan.statValue > 0 ? plan.statValue * 45 : 45;

    return (
      <article
        key={`${sectionKey}-${plan.id}`}
        className={`reveal-up flex flex-col rounded-2xl border p-4 shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
          accent.card
        }`}
      >
        {/* Top row: icon + actions */}
        <div className="mb-4 flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-[12px] border ${
            accent.icon
          }`}>
            <Dumbbell className="h-6 w-6" />
          </div>

          <div className="flex items-center gap-2">
            {plan.favoriteEnabled && (
              <button
                type="button"
                onClick={() => handleToggleFavorite(plan.id, plan.favoriteEnabled)}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/12 bg-white/[0.06] transition-all hover:bg-white/[0.12] ${
                  isFavorite ? "text-rose-400" : "text-slate-400 hover:text-rose-400"
                }`}
              >
                <Heart className={`h-4 w-4 ${ isFavorite ? "fill-rose-400" : ""}`} />
              </button>
            )}
            {plan.deleteEnabled && (
              <button
                type="button"
                onClick={() => handleDeletePlan(plan.id, plan.deleteEnabled)}
                aria-label={`Delete ${plan.name}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/12 bg-white/[0.06] text-slate-400 transition-all hover:bg-rose-500/15 hover:text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-1 break-words text-xl font-bold leading-snug text-slate-50">
          {plan.name}
        </h3>

        {/* Subtitle */}
        <p className="mb-4 text-xs text-slate-400">
          Updated: {getDaysAgo(plan.updatedAt)}
        </p>

        {/* Stats */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{plan.statValue} {plan.statLabel === "Days" ? "training days" : "meals"}</span>
          </div>
          {plan.sourceType === "workout" && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Star className="h-4 w-4 shrink-0 text-slate-400" />
              <span>{plan.exerciseCount} exercises</span>
            </div>
          )}
          {plan.sourceType === "workout" && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Clock className="h-4 w-4 shrink-0 text-slate-400" />
              <span>~{estMinutes} min</span>
            </div>
          )}
        </div>

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

        <div ref={menuAreaRef} className="space-y-4">
          {activeCategory === "workout" ? (
            <>
              {favoritePlans.length > 0 && renderSection("Favorites", favoritePlans, "favorites")}
              {renderSection("Saved workouts", savedWorkoutPlans, "saved-workouts", true)}
            </>
          ) : (
            /* ── Alimentation list ─────────────────────────────── */
            <section className="reveal-up reveal-delay-1">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-50">Meal Plans</h2>
                  <p className="text-sm text-slate-400">{filteredMealPlans.length} plans saved</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/meal-plan")}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400"
                >
                  <Plus className="h-4 w-4" />
                  Create meal plan
                </button>
              </div>

              {/* Search */}
              <div className="mb-5 relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={mealSearch}
                  onChange={(e) => setMealSearch(e.target.value)}
                  placeholder="Search meal plans..."
                  className="h-11 w-full max-w-sm rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-white/8"
                />
              </div>

              {/* List */}
              <div className="flex flex-col gap-3">
                {filteredMealPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-emerald-400/30 hover:bg-white/8"
                  >
                    {/* Food image */}
                    <img
                      src={plan.imageUrl}
                      alt={plan.name}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />

                    {/* Name + description */}
                    <div className="flex-1 min-w-0">
                      <h3 className="mb-1 text-base font-bold text-slate-50">{plan.name}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{plan.description}</p>
                    </div>

                    {/* Macros */}
                    <div className="hidden shrink-0 items-center gap-8 sm:flex">
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-400">{plan.kcal.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">Kcal</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-400">{plan.carbs}%</p>
                        <p className="text-xs text-slate-400">Carbs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-400">{plan.proteins}%</p>
                        <p className="text-xs text-slate-400">Proteins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-400">{plan.fats}%</p>
                        <p className="text-xs text-slate-400">Fats</p>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredMealPlans.length === 0 && (
                  <div className="py-16 text-center text-slate-400">
                    No meal plans match your search.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
