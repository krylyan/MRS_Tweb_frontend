import { ArrowDownWideNarrow, Pencil, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { mealService } from "../services/mealService";
import type { FoodItem, MealCategory } from "../types/meal";
import type { MealSortMode } from "../utils/mealLibrary";
import AuthUtils from "../utils/authUtils";

const toCategoryLabel = (category: string): string =>
  category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function Meals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MealCategory | "all">("all");
  const [selectedMeal, setSelectedMeal] = useState<FoodItem | null>(null);
  const [sortMode, setSortMode] = useState<MealSortMode>("priority");
  const currentUser = AuthUtils.getCurrentUser();
  const isAdminMode = AuthUtils.isAdminModeEnabled();
  const canEditLibrary = isAdminMode && currentUser?.role === "admin";

  const mealCategories = useMemo<Array<MealCategory | "all">>(
    () => ["all", ...mealService.getFilterCategories()],
    [],
  );

  const allResults = useMemo(() => {
    const sortedMeals = mealService.getMealsForSort(sortMode);

    if (!searchQuery.trim()) {
      return sortedMeals;
    }

    const normalized = searchQuery.trim().toLowerCase();
    return sortedMeals.filter(
      (meal) =>
        meal.name.toLowerCase().includes(normalized) ||
        meal.description.toLowerCase().includes(normalized),
    );
  }, [searchQuery, sortMode]);

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? allResults
        : allResults.filter((meal) => meal.category === activeFilter),
    [activeFilter, allResults],
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedMeal(null);
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-8">
        <div className="reveal-up mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-50">Meal Library</h1>
            <p className="mt-1 text-slate-400">
              Discover meals and food products with macros, preparation guidance, and serving details
            </p>
          </div>
          {canEditLibrary ? (
            <Link
              to="/admin/meals"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/25 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-100 transition-all hover:bg-amber-400/20 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          ) : null}
        </div>

        <div className="reveal-up reveal-delay-1 mb-4 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search meals..."
              className="h-12 w-full rounded-[14px] border border-white/12 bg-white/4 pl-12 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.18)]"
            />
          </div>

          <label className="relative">
            <ArrowDownWideNarrow className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as MealSortMode)}
              className="h-12 w-full appearance-none rounded-[14px] border border-white/12 bg-white/4 pl-11 pr-4 text-sm font-semibold text-slate-100 outline-none transition-all focus:border-emerald-500/60"
            >
              <option value="priority">Sort: Priority</option>
              <option value="popularity">Sort: Popularity</option>
              <option value="category">Sort: Category</option>
            </select>
          </label>
        </div>

        <div className="reveal-up reveal-delay-2 mb-4 flex flex-wrap items-center gap-2">
          {mealCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveFilter(category)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold capitalize transition-all ${
                activeFilter === category
                  ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
                  : "border-white/12 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-slate-100"
              }`}
            >
              {category === "all" ? "All" : toCategoryLabel(category)}
            </button>
          ))}
        </div>

        <p className="reveal-up reveal-delay-2 mb-4 text-sm text-slate-400">
          {filtered.length} meals found
        </p>

        <div className="reveal-up reveal-delay-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((meal) => (
            <button
              key={meal.id}
              type="button"
              onClick={() => setSelectedMeal(meal)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/4 text-left shadow-[0_14px_28px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-3 text-sm font-bold text-slate-50">{meal.name}</h3>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                    {meal.kcal} kcal
                  </span>
                  <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-rose-200">
                    {meal.protein}g protein
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200">
                    {meal.fats}g fats
                  </span>
                  <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-200">
                    {meal.carbs}g carbs
                  </span>
                </div>

                <div className="mt-auto flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                    {toCategoryLabel(meal.category)}
                  </span>
                  {meal.recommended ? (
                    <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[11px] font-semibold text-amber-100">
                      Recommended
                    </span>
                  ) : null}
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                    {meal.itemType === "prepared" ? "Meal" : "Product"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-slate-400">No meals match your search.</p>
          </div>
        )}
      </div>

      {selectedMeal
        ? ReactDOM.createPortal(
            <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />,
            document.body,
          )
        : null}
    </main>
  );
}

interface MealDetailModalProps {
  meal: FoodItem;
  onClose: () => void;
}

function MealDetailModal({ meal, onClose }: MealDetailModalProps) {
  const shouldShowPreparation =
    meal.itemType === "prepared" && Boolean(meal.preparationSteps?.length);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-backdrop absolute inset-0 bg-black/75" onClick={onClose} />

      <div className="modal-panel relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/12 bg-slate-900 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-slate-300 transition-all hover:bg-black/70 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative h-56 w-full overflow-hidden bg-slate-800">
          <img src={meal.imageUrl} alt={meal.name} className="h-full w-full object-cover" />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          <h2 className="mb-3 text-xl font-bold text-slate-50">{meal.name}</h2>

          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              {meal.kcal} kcal
            </span>
            <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200">
              {meal.protein}g protein
            </span>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
              {meal.fats}g fats
            </span>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
              {meal.carbs}g carbs
            </span>
            <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-semibold text-slate-300">
              {meal.grams}g serving
            </span>
          </div>

          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-200">Overview</h3>
            <p className="text-sm leading-relaxed text-slate-300">{meal.description}</p>
          </div>

          {shouldShowPreparation ? (
            <>
              <h3 className="mb-3 text-sm font-semibold text-slate-200">Preparation Steps</h3>
              <div className="space-y-3">
                {meal.preparationSteps?.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-300">{step}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="mb-3 text-sm font-semibold text-slate-200">About This Product</h3>
              <p className="text-sm leading-relaxed text-slate-300">{meal.description}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
