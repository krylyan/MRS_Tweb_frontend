import { Check, ChevronDown, ChevronUp, Flame, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { FoodItem } from "../types/meal";
import { getDateKey, isPlanDayCompleted, markPlanDayCompleted } from "../utils/planCompletion";
import { getPlanActivation, getActiveDayForDate } from "../utils/planCycleTracker";
import { mealLibrary } from "../utils/mealLibrary";

type MealSlot = "breakfast" | "lunch" | "snacks" | "dinner";
type DayMeals = Record<MealSlot, FoodItem[]>;
type AllDayMeals = Record<string, DayMeals>;

const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snacks: "Snacks",
  dinner: "Dinner",
};

const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "snacks", "dinner"];

const DAYS = Array.from({ length: 7 }, (_, i) => ({
  id: `day-${i + 1}`,
  label: `Day ${i + 1}`,
}));

const ACTIVE_MEAL_KEY = "fitlife_active_meal_plan";

const DEFAULT_DAY_ONE_IDS: Record<MealSlot, string[]> = {
  breakfast: ["bread", "egg", "yogurt"],
  lunch: ["lettuce", "tomato", "chicken", "rice"],
  snacks: ["apple", "hummus", "carrot"],
  dinner: ["salmon", "sweet-potato", "almonds"],
};

const createEmptyDay = (): DayMeals => ({
  breakfast: [],
  lunch: [],
  snacks: [],
  dinner: [],
});

const createInitialMeals = (catalogue: FoodItem[]): AllDayMeals => {
  const catalogueById = new Map(catalogue.map((food) => [food.id, food]));
  const pickMeals = (ids: string[]): FoodItem[] =>
    ids
      .map((id) => catalogueById.get(id))
      .filter((food): food is FoodItem => Boolean(food));

  return {
    "day-1": {
      breakfast: pickMeals(DEFAULT_DAY_ONE_IDS.breakfast),
      lunch: pickMeals(DEFAULT_DAY_ONE_IDS.lunch),
      snacks: pickMeals(DEFAULT_DAY_ONE_IDS.snacks),
      dinner: pickMeals(DEFAULT_DAY_ONE_IDS.dinner),
    },
    ...Object.fromEntries(
      Array.from({ length: 6 }, (_, i) => [`day-${i + 2}`, createEmptyDay()]),
    ),
  };
};

function FoodPickerModal({
  catalogue,
  existing,
  slotLabel,
  onAdd,
  onClose,
}: {
  catalogue: FoodItem[];
  existing: string[];
  slotLabel: string;
  onAdd: (food: FoodItem) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(catalogue.map((f) => f.category))).sort();
    return ["all", ...cats];
  }, [catalogue]);

  useEffect(() => {
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q_lower = q.trim().toLowerCase();
    return catalogue.filter((food) => {
      const matchesSearch =
        !q_lower ||
        food.name.toLowerCase().includes(q_lower) ||
        food.description.toLowerCase().includes(q_lower);
      const matchesCategory =
        activeCategory === "all" || food.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [catalogue, q, activeCategory]);

  const existingSet = useMemo(() => new Set(existing), [existing]);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="modal-backdrop absolute inset-0 bg-black/75"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="modal-panel relative z-10 flex w-full max-w-4xl flex-col rounded-2xl border border-white/12 bg-slate-900 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h3 className="text-xl font-bold text-slate-50">
            Food Library
            <span className="ml-2 text-base font-normal text-slate-400">— {slotLabel}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-slate-400 transition-all hover:bg-white/10 hover:text-slate-100"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search foods..."
              className="h-11 w-full rounded-[10px] border border-white/20 bg-white/[0.04] pl-10 pr-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.18)]"
            />
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 px-6 py-4">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all ${
                activeCategory === cat
                  ? "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400/40"
                  : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.10] hover:text-slate-100"
              }`}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Food cards grid */}
        <div className="max-h-[420px] overflow-y-auto px-6 pb-6">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No foods found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((food) => {
                const alreadyAdded = existingSet.has(food.id);
                return (
                  <button
                    key={food.id}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => {
                      if (!alreadyAdded) {
                        onAdd(food);
                        onClose();
                      }
                    }}
                    className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                      alreadyAdded
                        ? "cursor-default border-emerald-400/30 bg-emerald-500/5 opacity-70"
                        : "border-white/10 bg-white/5 hover:border-emerald-400/40 hover:bg-emerald-500/10"
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-32 w-full overflow-hidden bg-slate-800">
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2 left-2 rounded-lg bg-emerald-600/90 px-2 py-0.5 text-[11px] font-bold text-white shadow">
                        {food.grams}g
                      </span>
                      {alreadyAdded ? (
                        <span className="absolute right-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Added
                        </span>
                      ) : null}
                    </div>

                    {/* Info */}
                    <div className="px-3 pb-3 pt-2">
                      <p className="mb-1.5 text-sm font-bold leading-snug text-slate-100">{food.name}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                        <span className="flex items-center gap-0.5 font-semibold text-orange-400">
                          <Flame className="h-3 w-3" />
                          {food.kcal}
                        </span>
                        <span className="font-medium text-emerald-400">{food.protein}g P</span>
                        <span className="font-medium text-amber-300">{food.fats}g F</span>
                        <span className="font-medium text-blue-400">{food.carbs}g C</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function FoodCard({ food, onRemove }: { food: FoodItem; onRemove: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-white/20">
      <div className="relative h-36 w-full overflow-hidden bg-slate-800">
        <img
          src={food.imageUrl}
          alt={food.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute bottom-2 left-2 rounded-lg bg-emerald-600/90 px-2 py-0.5 text-[11px] font-bold text-white shadow">
          {food.grams}g
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${food.name}`}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 shadow-md transition-all hover:bg-rose-400"
        >
          <X className="h-3 w-3 text-white" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 pb-1 pt-2 text-[11px]">
        <span className="flex items-center gap-0.5 font-medium text-orange-400">
          <Flame className="h-3 w-3" />
          {food.kcal}
        </span>
        <span className="font-medium text-amber-300">{food.carbs}g</span>
        <span className="font-medium text-rose-300">{food.protein}g</span>
        <span className="font-medium text-lime-300">{food.fats}g</span>
      </div>

      <div className="px-3 pb-3 pt-0.5">
        <p className="text-sm font-bold leading-snug text-slate-100">{food.name}</p>
        <p className="text-[11px] text-emerald-400">add alternatives</p>
      </div>
    </div>
  );
}

function MealSection({
  catalogue,
  slot,
  items,
  collapsed,
  onToggleCollapse,
  onAdd,
  onRemove,
}: {
  catalogue: FoodItem[];
  slot: MealSlot;
  items: FoodItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onAdd: (food: FoodItem) => void;
  onRemove: (foodId: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const slotKcal = items.reduce((sum, food) => sum + food.kcal, 0);

  return (
    <>
      <section className="mb-4 rounded-2xl border border-white/10 bg-white/5">
        <button
          type="button"
          onClick={() => {
            onToggleCollapse();
          }}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-slate-50">
            {MEAL_LABELS[slot]}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              <span className="font-semibold text-slate-200">{slotKcal}</span> kcal
            </span>
            {collapsed ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{ gridTemplateRows: collapsed ? "0fr" : "1fr" }}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                {items.map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onRemove={() => onRemove(food.id)}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] text-slate-400 transition-all hover:border-emerald-400/40 hover:bg-emerald-500/5 hover:text-emerald-400"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-white/25">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Add food</p>
                    <p className="mt-0.5 text-xs text-slate-500">to {MEAL_LABELS[slot]}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {pickerOpen ? (
        <FoodPickerModal
          catalogue={catalogue}
          existing={items.map((food) => food.id)}
          slotLabel={MEAL_LABELS[slot]}
          onAdd={(food) => {
            onAdd(food);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </>
  );
}

export default function MealPlanMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const storedActiveMealPlanId = localStorage.getItem(ACTIVE_MEAL_KEY);
  const activeMealPlanId = searchParams.get("planId") ?? storedActiveMealPlanId;
  const canMarkCompleted = Boolean(activeMealPlanId && activeMealPlanId === storedActiveMealPlanId);
  const completionDateKey = getDateKey(searchParams.get("date"));
  const urlDayId = searchParams.get("dayId");
  const availableMeals = useMemo(() => mealLibrary.getVisibleMeals("priority"), []);
  const [title, setTitle] = useState("New Meal Plan");
  const [titleFocused, setTitleFocused] = useState(false);
  // If dayId is passed from dashboard, open that specific day
  const initialDayId = urlDayId && DAYS.some((d) => d.id === urlDayId) ? urlDayId : "day-1";
  const [activeDayId, setActiveDayId] = useState(initialDayId);
  const [allMeals, setAllMeals] = useState<AllDayMeals>(() => createInitialMeals(availableMeals));
  const [collapsed, setCollapsed] = useState<Record<MealSlot, boolean>>({
    breakfast: false,
    lunch: false,
    snacks: false,
    dinner: false,
  });
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [completionVersion, setCompletionVersion] = useState(0);

  const currentMeals = allMeals[activeDayId];

  const allFoods = useMemo(() => Object.values(currentMeals).flat(), [currentMeals]);
  const totalKcal = useMemo(() => allFoods.reduce((sum, food) => sum + food.kcal, 0), [allFoods]);
  const totalP = useMemo(() => allFoods.reduce((sum, food) => sum + food.protein, 0), [allFoods]);
  const totalC = useMemo(() => allFoods.reduce((sum, food) => sum + food.carbs, 0), [allFoods]);
  const totalF = useMemo(() => allFoods.reduce((sum, food) => sum + food.fats, 0), [allFoods]);

  const proteinPct = totalKcal > 0 ? Math.round((totalP * 4 / totalKcal) * 100) : 0;
  const fatsPct = totalKcal > 0 ? Math.round((totalF * 9 / totalKcal) * 100) : 0;
  const carbsPct = totalKcal > 0 ? Math.round((totalC * 4 / totalKcal) * 100) : 0;
  const completedDayIds = useMemo(
    () =>
      activeMealPlanId
        ? DAYS
            .filter((day) => isPlanDayCompleted("meal", activeMealPlanId, day.id, completionDateKey))
            .map((day) => day.id)
        : [],
    [activeMealPlanId, completionDateKey, completionVersion],
  );

  // Compute which meal plan day maps to TODAY (for blue highlight)
  const todayPlanDayId = useMemo(() => {
    if (!canMarkCompleted || !activeMealPlanId) return "day-1";
    const activation = getPlanActivation("meal");
    if (!activation) return "day-1";
    return getActiveDayForDate(activation, getDateKey()).dayId;
  }, [activeMealPlanId, canMarkCompleted]);
  const isCompletedForDate = useMemo(
    () =>
      canMarkCompleted && activeMealPlanId
        ? isPlanDayCompleted("meal", activeMealPlanId, activeDayId, completionDateKey)
        : false,
    [activeDayId, activeMealPlanId, canMarkCompleted, completionDateKey, completionVersion],
  );

  const markDirty = () => {
    setIsDirty(true);
    setSaved(false);
  };

  const addFood = (slot: MealSlot, food: FoodItem) => {
    setAllMeals((prev) => ({
      ...prev,
      [activeDayId]: { ...prev[activeDayId], [slot]: [...prev[activeDayId][slot], food] },
    }));
    markDirty();
  };

  const removeFood = (slot: MealSlot, foodId: string) => {
    setAllMeals((prev) => ({
      ...prev,
      [activeDayId]: {
        ...prev[activeDayId],
        [slot]: prev[activeDayId][slot].filter((food) => food.id !== foodId),
      },
    }));
    markDirty();
  };

  const toggleCollapse = (slot: MealSlot) => {
    setCollapsed((prev) => ({ ...prev, [slot]: !prev[slot] }));
  };

  const handleSave = () => {
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleMarkCompleted = () => {
    if (!activeMealPlanId || !canMarkCompleted) return;
    markPlanDayCompleted("meal", activeMealPlanId, activeDayId, completionDateKey);
    setCompletionVersion((current) => current + 1);
  };

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              markDirty();
            }}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            className={`w-full max-w-xl rounded-xl border bg-transparent px-2 py-1 text-3xl font-bold text-slate-50 outline-none transition-all sm:text-4xl ${
              titleFocused ? "border-emerald-400/60" : "border-transparent"
            }`}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {canMarkCompleted ? (
              <button
                type="button"
                onClick={handleMarkCompleted}
                disabled={isCompletedForDate}
                className={`inline-flex w-fit items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  isCompletedForDate
                    ? "cursor-default border-emerald-300/30 bg-emerald-500/15 text-emerald-200"
                    : "border-cyan-300/25 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"
                }`}
              >
                {isCompletedForDate ? <Check className="h-4 w-4" /> : null}
                {isCompletedForDate ? "Day completed" : "Mark day completed"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSave}
              className={`inline-flex w-fit items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 ${
                saved
                  ? "bg-emerald-600 shadow-emerald-600/30"
                  : isDirty
                    ? "animate-pulse bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-400"
                    : "bg-white/8 shadow-none hover:bg-white/12"
              }`}
            >
              {saved ? <Check className="h-4 w-4" /> : null}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        <section className="reveal-up mb-4 rounded-[14px] border border-white/12 bg-white/4 px-4 py-3 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
          <div className="flex flex-wrap items-center gap-2.5">
            {DAYS.map((day) => {
              const isSelected = day.id === activeDayId;
              const isToday = day.id === todayPlanDayId;
              const isCompleted = completedDayIds.includes(day.id);

              let dayClass = "rounded-[10px] border px-4 py-2 text-sm font-semibold transition-colors ";
              if (isCompleted && isToday) {
                dayClass += "border-rose-400/70 bg-blue-500/25 text-blue-100 shadow-[0_0_14px_rgba(244,63,94,0.25)]";
              } else if (isCompleted) {
                dayClass += "border-rose-400/60 bg-rose-500/10 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.15)]";
              } else if (isToday) {
                dayClass += "border-blue-400/50 bg-blue-500/25 text-blue-100 shadow-[0_0_16px_rgba(59,130,246,0.22)]";
              } else if (isSelected) {
                dayClass += "border-emerald-400/40 bg-emerald-500/20 text-emerald-200";
              } else {
                dayClass += "border-white/10 bg-white/[0.02] text-slate-200 hover:bg-white/[0.08]";
              }

              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setActiveDayId(day.id)}
                  className={dayClass}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Daily totals inline strip */}
        <div className="reveal-up mb-4 flex flex-wrap items-center gap-4 rounded-[14px] border border-white/12 bg-white/4 px-5 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.2)] backdrop-blur-[6px]">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-400">{totalKcal.toLocaleString()} kcal</span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Protein</span>
            <span className="text-sm font-semibold text-emerald-400">{totalP}g</span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="text-xs text-slate-400">Fats</span>
            <span className="text-sm font-semibold text-amber-400">{totalF}g</span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400" />
            <span className="text-xs text-slate-400">Carbs</span>
            <span className="text-sm font-semibold text-blue-400">{totalC}g</span>
          </div>
        </div>

        {/* Macro percentage bar */}
        <div className="reveal-up mb-6">
          <div className="flex h-6 overflow-hidden rounded-full text-[11px] font-semibold text-white">
            <div
              className="flex items-center justify-center bg-emerald-500 transition-all duration-500"
              style={{ width: `${proteinPct}%` }}
              title={`Protein ${proteinPct}%`}
            >
              {proteinPct > 9 ? `Protein ${proteinPct}%` : null}
            </div>
            <div
              className="flex items-center justify-center bg-orange-400 transition-all duration-500"
              style={{ width: `${fatsPct}%` }}
              title={`Fats ${fatsPct}%`}
            >
              {fatsPct > 9 ? `Fats ${fatsPct}%` : null}
            </div>
            <div
              className="flex items-center justify-center bg-blue-400 transition-all duration-500"
              style={{ width: `${carbsPct}%` }}
              title={`Carbs ${carbsPct}%`}
            >
              {carbsPct > 9 ? `Carbs ${carbsPct}%` : null}
            </div>
            {totalKcal === 0 ? <div className="flex-1 bg-white/10" /> : null}
          </div>

          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Protein {proteinPct}%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
              Fats {fatsPct}%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
              Carbs {carbsPct}%
            </span>
          </div>
        </div>

        <div className="w-full">
          {MEAL_SLOTS.map((slot) => (
            <MealSection
              key={slot}
              catalogue={availableMeals}
              slot={slot}
              items={currentMeals[slot]}
              collapsed={collapsed[slot]}
              onToggleCollapse={() => toggleCollapse(slot)}
              onAdd={(food) => addFood(slot, food)}
              onRemove={(id) => removeFood(slot, id)}
            />
          ))}
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => navigate("/plans?tab=alimentation")}
            className="text-sm text-slate-400 transition-colors hover:text-slate-200"
          >
            &lt;- Back to My Plans
          </button>
        </div>
      </div>
    </main>
  );
}
