import { ArrowDownWideNarrow, ImageIcon, Pencil, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { DarkMenuDropdown } from "../components/DarkMenuDropdown";
import { FoodTypeDropdown, type FoodTypeFilter } from "../components/FoodTypeDropdown";
import { mealService } from "../services/mealService";
import type { FoodItem } from "../types/meal";
import AuthUtils from "../utils/authUtils";
import { hasMediaUrl } from "../utils/media";

const toCategoryLabel = (category: string): string =>
  category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

type SortMode = "name" | "category" | "kcal";
const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "name", label: "Sort: Name" },
  { value: "category", label: "Sort: Category" },
  { value: "kcal", label: "Sort: Calories" },
];
export default function Meals() {
  const [meals, setMeals] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLibrary, setActiveLibrary] = useState<FoodTypeFilter>("all");
  const [selectedMeal, setSelectedMeal] = useState<FoodItem | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const currentUser = AuthUtils.getCurrentUser();
  const isAdminMode = AuthUtils.isAdminModeEnabled();
  const canEditLibrary = isAdminMode && currentUser?.role === "Admin";

  useEffect(() => {
    mealService.getAllMeals()
      .then((data) => {
        setMeals(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load meals. Is the backend running?");
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let result = [...meals];

    if (activeLibrary !== "all") {
      result = result.filter((m) => m.itemType === activeLibrary);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q),
      );
    }

    // Sort
    if (sortMode === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortMode === "category") result.sort((a, b) => a.category.localeCompare(b.category));
    else if (sortMode === "kcal") result.sort((a, b) => a.kcal - b.kcal);

    return result;
  }, [meals, activeLibrary, searchQuery, sortMode]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedMeal(null);
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
              Browse prepared meals and simple food products with macros and serving details
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

        <div className="reveal-up reveal-delay-1 relative z-40 mb-4 grid gap-3 lg:grid-cols-[1fr_180px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search foods..."
              className="h-12 w-full rounded-[14px] border border-white/12 bg-white/4 pl-12 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.18)]"
            />
          </div>

          <FoodTypeDropdown value={activeLibrary} onChange={setActiveLibrary} />

          <DarkMenuDropdown
            value={sortMode}
            options={SORT_OPTIONS}
            onChange={setSortMode}
            icon={ArrowDownWideNarrow}
          />
        </div>

        {loading && (
          <div className="py-16 text-center text-slate-400 animate-pulse">
            Loading meals...
          </div>
        )}

        {error && (
          <div className="py-16 text-center text-rose-400">{error}</div>
        )}

        {!loading && !error && (
          <p className="reveal-up reveal-delay-2 mb-4 text-sm text-slate-400">
            {filtered.length} food items found
          </p>
        )}

        {!loading && !error && (
          <div className="reveal-up reveal-delay-3 relative z-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((meal) => (
              <button
                key={meal.id}
                type="button"
                onClick={() => setSelectedMeal(meal)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/4 text-left shadow-[0_14px_28px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                  <MealImage
                    meal={meal}
                    className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-3 text-sm font-bold text-slate-50">{meal.name}</h3>

                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                      {meal.kcal} kcal / 100g
                    </span>
                    <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-rose-200">
                      {meal.protein.toFixed(1)}g protein
                    </span>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200">
                      {meal.fats.toFixed(1)}g fats
                    </span>
                    <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-200">
                      {meal.carbs.toFixed(1)}g carbs
                    </span>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                      {toCategoryLabel(meal.category)}
                    </span>
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                      {meal.itemType === "Prepared" ? "Meal" : "Product"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-slate-400">No food items match your search.</p>
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
    meal.itemType === "Prepared" && Boolean(meal.preparationSteps?.trim());

  const preparationLines = getCleanPreparationSteps(meal.preparationSteps);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-4 sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-backdrop absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="modal-panel relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-y-auto rounded-2xl border border-white/12 bg-slate-900 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-slate-300 transition-all hover:bg-black/70 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative h-72 w-full shrink-0 overflow-hidden bg-slate-800 sm:h-80">
          <MealImage meal={meal} className="h-full w-full object-contain p-3" />
        </div>

        <div className="p-5">
          <h2 className="mb-3 text-xl font-bold text-slate-50">{meal.name}</h2>

          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              {meal.kcal} kcal / 100g
            </span>
            <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200">
              {meal.protein.toFixed(1)}g protein
            </span>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
              {meal.fats.toFixed(1)}g fats
            </span>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
              {meal.carbs.toFixed(1)}g carbs
            </span>
            <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-semibold text-slate-300">
              per 100g
            </span>
          </div>

          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-200">
              {meal.itemType === "Prepared" ? "Ingredients" : "About This Product"}
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">{meal.description}</p>
          </div>

          {shouldShowPreparation ? (
            <>
              <h3 className="mb-3 text-sm font-semibold text-slate-200">Preparation Steps</h3>
              <div className="space-y-3">
                {preparationLines.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-300">{step}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getCleanPreparationSteps(value?: string | null): string[] {
  if (!value) return [];
  return value
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .map((line) => line.replace(/^step\s*\d+\s*[:.)-]?\s*/i, "").trim())
    .filter((line) => line.length > 0 && !/^step\s*\d+$/i.test(line));
}

function MealImage({ meal, className }: { meal: FoodItem; className: string }) {
  const [failed, setFailed] = useState(false);

  if (!hasMediaUrl(meal.imageUrl) || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800 to-slate-950 px-4 text-center text-slate-400">
        <ImageIcon className="h-12 w-12 text-emerald-300/30" />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Image not added
        </p>
      </div>
    );
  }

  return (
    <img
      src={meal.imageUrl}
      alt={meal.name}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
