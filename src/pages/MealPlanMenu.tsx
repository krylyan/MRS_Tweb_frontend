import { Check, ChevronDown, ChevronUp, Flame, Loader2, Plus, Save, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FoodTypeDropdown, type FoodTypeFilter } from "../components/FoodTypeDropdown";
import type { FoodItem } from "../types/meal";
import { getDateKey } from "../utils/planCompletion";
import { mealService } from "../services/mealService";
import { mealPlanApi, type MealPlanApi, type MealPlanCreateDayBody, type MealPlanItemApi, type MealSlotApi } from "../services/mealPlanApi";
import { planActivationApi, type PlanActivationApi } from "../services/planActivationApi";
import { planCompletionApi, type PlanCompletionResponseDto } from "../services/planCompletionApi";

type MealSlot = "breakfast" | "lunch" | "snacks" | "dinner";
type PlannedFoodItem = FoodItem & {
  planItemId?: number;
  foodItemId: number;
  quantityGrams: number;
};
type DayMeals = Record<MealSlot, PlannedFoodItem[]>;
type AllDayMeals = Record<string, DayMeals>;

const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snacks: "Snacks",
  dinner: "Dinner",
};

const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "snacks", "dinner"];
const SLOT_TO_API: Record<MealSlot, MealSlotApi> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};
const API_TO_SLOT: Record<MealSlotApi, MealSlot> = {
  Breakfast: "breakfast",
  Lunch: "lunch",
  Dinner: "dinner",
  Snacks: "snacks",
};

const DAYS = Array.from({ length: 7 }, (_, i) => ({
  id: `day-${i + 1}`,
  label: `Day ${i + 1}`,
}));

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDaysToDateKey = (dateKey: string, days: number): string => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return getDateKey(date);
};

const daysBetween = (startKey: string, endKey: string): number =>
  Math.round((parseDateKey(endKey).getTime() - parseDateKey(startKey).getTime()) / 86_400_000);

const getActivationStartKey = (activation: PlanActivationApi): string =>
  activation.lastCycleResetAt ?? activation.activatedAt;

const getScheduledDayForDate = (activation: PlanActivationApi, dateKey: string) => {
  const diff = Math.max(0, daysBetween(getActivationStartKey(activation), dateKey));
  const totalDays = Math.max(1, activation.totalDays || 7);
  const cycleOffset = Math.floor(diff / totalDays) * totalDays;
  const dayNumber = (diff % totalDays) + 1;

  return {
    dayId: `day-${dayNumber}`,
    cycleStartKey: addDaysToDateKey(getActivationStartKey(activation), cycleOffset),
  };
};

const getScheduledDateForDayInCycle = (
  activation: PlanActivationApi,
  dayId: string,
  referenceDateKey: string,
): string => {
  const todaySchedule = getScheduledDayForDate(activation, referenceDateKey);
  const dayNumber = Number.parseInt(dayId.replace("day-", ""), 10) || 1;
  return addDaysToDateKey(todaySchedule.cycleStartKey, dayNumber - 1);
};

const createEmptyDay = (): DayMeals => ({
  breakfast: [],
  lunch: [],
  snacks: [],
  dinner: [],
});

const createInitialMeals = (_catalogue: FoodItem[]): AllDayMeals => {

  return {
    ...Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => [`day-${i + 1}`, createEmptyDay()]),
    ),
  };
};

const toPlannedFood = (food: FoodItem, quantityGrams = 100, planItemId?: number): PlannedFoodItem => {
  const factor = quantityGrams / 100;
  return {
    ...food,
    planItemId,
    foodItemId: food.id,
    quantityGrams,
    kcal: Number((food.kcal * factor).toFixed(1)),
    protein: Number((food.protein * factor).toFixed(1)),
    carbs: Number((food.carbs * factor).toFixed(1)),
    fats: Number((food.fats * factor).toFixed(1)),
  };
};

const mapPlanItemToFood = (item: MealPlanItemApi): PlannedFoodItem => ({
  ...item.foodItem,
  planItemId: item.id,
  foodItemId: item.foodItemId,
  quantityGrams: item.quantityGrams,
  kcal: item.kcal,
  protein: item.protein,
  carbs: item.carbs,
  fats: item.fats,
});

const planToMeals = (plan: MealPlanApi): AllDayMeals => {
  const result = createInitialMeals([]);
  plan.days.forEach((day) => {
    const dayId = `day-${day.dayNumber}`;
    result[dayId] = createEmptyDay();
    day.categories.forEach((category) => {
      const slot = API_TO_SLOT[category.slot];
      result[dayId][slot] = category.items.map(mapPlanItemToFood);
    });
  });
  return result;
};

const buildMealPlanPayload = (allMeals: AllDayMeals): MealPlanCreateDayBody[] =>
  DAYS.map((day, dayIndex) => ({
    label: day.label,
    dayNumber: dayIndex + 1,
    categories: MEAL_SLOTS.map((slot, slotIndex) => ({
      slot: SLOT_TO_API[slot],
      order: slotIndex,
      items: (allMeals[day.id]?.[slot] ?? []).map((food, foodIndex) => ({
        foodItemId: food.foodItemId,
        order: foodIndex,
        quantityGrams: food.quantityGrams,
      })),
    })),
  }));

function FoodPickerModal({
  catalogue,
  existing,
  slotLabel,
  onAdd,
  onClose,
}: {
  catalogue: FoodItem[];
  existing: number[];
  slotLabel: string;
  onAdd: (food: FoodItem) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [activeLibrary, setActiveLibrary] = useState<FoodTypeFilter>("all");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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
      const matchesLibrary =
        activeLibrary === "all" || food.itemType === activeLibrary;
      return matchesSearch && matchesLibrary;
    });
  }, [catalogue, q, activeLibrary]);

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

        <div className="relative z-40 px-6 py-4">
          <FoodTypeDropdown value={activeLibrary} onChange={setActiveLibrary} className="max-w-[220px]" />
        </div>

        {/* Food cards grid */}
        <div className="relative z-0 max-h-[420px] overflow-y-auto px-6 pb-6">
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
                        className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2 left-2 rounded-lg bg-emerald-600/90 px-2 py-0.5 text-[11px] font-bold text-white shadow">
                        100g
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
                          {food.kcal}/100g
                        </span>
                        <span className="font-medium text-emerald-400">{food.protein.toFixed(1)}g P</span>
                        <span className="font-medium text-amber-300">{food.fats.toFixed(1)}g F</span>
                        <span className="font-medium text-blue-400">{food.carbs.toFixed(1)}g C</span>
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

function FoodCard({ food, onOpen, onRemove }: { food: PlannedFoodItem; onOpen: () => void; onRemove: () => void }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="relative min-h-[265px] cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.07]"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-800">
        <img
          src={food.imageUrl}
          alt={food.name}
          className="h-full w-full object-contain p-2 transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <span className="absolute bottom-2 left-2 rounded-lg bg-emerald-600/90 px-2 py-0.5 text-[11px] font-bold text-white shadow">
          {food.quantityGrams}g
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 pb-1 pt-2 text-[11px]">
        <span className="flex items-center gap-0.5 font-medium text-orange-400">
          <Flame className="h-3 w-3" />
          {food.kcal} kcal
        </span>
        <span className="font-medium text-emerald-400">{food.protein.toFixed(1)}g P</span>
        <span className="font-medium text-amber-300">{food.fats.toFixed(1)}g F</span>
        <span className="font-medium text-blue-400">{food.carbs.toFixed(1)}g C</span>
      </div>

      <div className="px-3 pb-3 pt-0.5">
        <p className="text-sm font-bold leading-snug text-slate-100">{food.name}</p>
        <p className="text-[11px] text-emerald-400">click to edit quantity</p>
      </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${food.name}`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 shadow-md transition-all hover:bg-rose-400"
        >
          <X className="h-4 w-4 text-white" />
        </button>
    </article>
  );
}

function QuantityModal({
  food,
  onSave,
  onClose,
}: {
  food: PlannedFoodItem;
  onSave: (quantityGrams: number) => void;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(food.quantityGrams);
  const preview = toPlannedFood(food, quantity, food.planItemId);
  const shouldShowPreparation = food.itemType === "Prepared" && Boolean(food.preparationSteps?.trim());
  const preparationLines = getCleanPreparationSteps(food.preparationSteps);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/75 p-4 sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-y-auto rounded-2xl border border-white/12 bg-slate-900 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        <div className="relative h-72 shrink-0 bg-slate-800 sm:h-80">
          <img src={food.imageUrl} alt={food.name} className="h-full w-full object-contain p-3" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <h2 className="text-xl font-bold text-slate-50">{food.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-orange-500/15 px-3 py-1 text-orange-300">{preview.kcal} kcal</span>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">{preview.protein.toFixed(1)}g protein</span>
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-amber-300">{preview.fats.toFixed(1)}g fats</span>
            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-blue-300">{preview.carbs.toFixed(1)}g carbs</span>
          </div>

          <label className="mt-5 block text-sm font-semibold text-slate-200" htmlFor="quantityGrams">
            Consumed quantity
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="quantityGrams"
              type="text"
              inputMode="decimal"
              value={quantity}
              onChange={(event) => {
                const normalizedValue = event.target.value.replace(",", ".").replace(/[^\d.]/g, "");
                setQuantity(Math.max(0, Number(normalizedValue || 0)));
              }}
              className="h-12 flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-slate-100 outline-none focus:border-emerald-400/70"
            />
            <span className="text-sm font-semibold text-slate-400">grams</span>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="mb-2 text-sm font-bold text-slate-200">
              {food.itemType === "Prepared" ? "Ingredients" : "About This Product"}
            </h3>
            <p className="text-sm leading-6 text-slate-300">{food.description || `${food.name} from the food library.`}</p>
          </div>

          {shouldShowPreparation ? (
            <div className="mt-5">
              <h3 className="mb-3 text-sm font-bold text-slate-200">Preparation Steps</h3>
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
            </div>
          ) : null}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] py-3 text-sm font-semibold text-slate-300 hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(quantity)}
              className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400"
            >
              Save quantity
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
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

function MealSection({
  catalogue,
  slot,
  items,
  collapsed,
  onToggleCollapse,
  onAdd,
  onOpen,
  onRemove,
}: {
  catalogue: FoodItem[];
  slot: MealSlot;
  items: PlannedFoodItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onAdd: (food: FoodItem) => void;
  onOpen: (food: PlannedFoodItem) => void;
  onRemove: (foodId: number) => void;
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
              <span className="font-semibold text-orange-400">{slotKcal}</span> kcal
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
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                {items.map((food, index) => (
                  <FoodCard
                    key={`${food.planItemId ?? food.foodItemId}-${index}`}
                    food={food}
                    onOpen={() => onOpen(food)}
                    onRemove={() => onRemove(food.foodItemId)}
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
  const routePlanId = searchParams.get("planId");
  const isNewPlan = searchParams.get("new") === "1";
  const [activeMealActivation, setActiveMealActivation] = useState<PlanActivationApi | null>(null);
  const [mealCompletions, setMealCompletions] = useState<PlanCompletionResponseDto[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(routePlanId);
  const activeMealPlanId = currentPlanId;
  const completionDateKey = getDateKey(searchParams.get("date"));
  const todayKey = getDateKey();
  const canMarkCompleted = Boolean(
    activeMealPlanId &&
    activeMealActivation &&
    activeMealPlanId === activeMealActivation.planIdentifier &&
    completionDateKey === todayKey
  );
  const urlDayId = searchParams.get("dayId");
  const [availableMeals, setAvailableMeals] = useState<FoodItem[]>([]);
  useEffect(() => {
    mealService.getAllMeals().then(setAvailableMeals);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadActiveMealPlan = async () => {
      const activation = await planActivationApi.getActive("Meal");
      if (cancelled) return;
      setActiveMealActivation(activation);

      if (!routePlanId && !isNewPlan) {
        const activatedPlanId = activation?.planIdentifier;
        if (activatedPlanId && Number.isFinite(Number(activatedPlanId))) {
          setCurrentPlanId(activatedPlanId);
          return;
        }

        const plans = await mealPlanApi.getMyPlans();
        if (cancelled) return;
        const fallbackPlan = plans[0];
        setCurrentPlanId(fallbackPlan ? String(fallbackPlan.id) : null);
        navigate(fallbackPlan ? `/meal-plan?planId=${fallbackPlan.id}` : "/meal-plan?new=1", {
          replace: true,
        });
      }
    };

    loadActiveMealPlan();

    return () => {
      cancelled = true;
    };
  }, [isNewPlan, navigate, routePlanId]);

  const [title, setTitle] = useState("New Meal Plan");
  const [titleFocused, setTitleFocused] = useState(false);
  // If dayId is passed from dashboard, open that specific day
  const initialDayId = urlDayId && DAYS.some((d) => d.id === urlDayId) ? urlDayId : "day-1";
  const [activeDayId, setActiveDayId] = useState(initialDayId);
  const [allMeals, setAllMeals] = useState<AllDayMeals>(() => createInitialMeals(availableMeals));
  const [selectedFood, setSelectedFood] = useState<{ slot: MealSlot; food: PlannedFoodItem } | null>(null);
  const [collapsed, setCollapsed] = useState<Record<MealSlot, boolean>>({
    breakfast: false,
    lunch: false,
    snacks: false,
    dinner: false,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [completionVersion, setCompletionVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    planCompletionApi.getByUser("Meal").then((items) => {
      if (!cancelled) setMealCompletions(items);
    });

    return () => {
      cancelled = true;
    };
  }, [completionVersion]);

  useEffect(() => {
    let cancelled = false;

    const loadPlan = async () => {
      if (isNewPlan) {
        setCurrentPlanId(null);
        setTitle("New Meal Plan");
        setAllMeals(createInitialMeals([]));
        return;
      }

      const targetId = routePlanId ?? activeMealActivation?.planIdentifier;
      if (!targetId || !Number.isFinite(Number(targetId))) return;

      const plan = await mealPlanApi.getById(Number(targetId));
      if (!plan || cancelled) return;
      setCurrentPlanId(String(plan.id));
      setTitle(plan.name);
      setAllMeals(planToMeals(plan));
      setIsDirty(false);
    };

    loadPlan();
    return () => {
      cancelled = true;
    };
  }, [activeMealActivation?.planIdentifier, isNewPlan, routePlanId]);

  const currentMeals = allMeals[activeDayId];

  const allFoods = useMemo(() => Object.values(currentMeals).flat(), [currentMeals]);
  const totalKcal = useMemo(() => allFoods.reduce((sum, food) => sum + food.kcal, 0), [allFoods]);
  const totalP = useMemo(() => allFoods.reduce((sum, food) => sum + food.protein, 0), [allFoods]);
  const totalC = useMemo(() => allFoods.reduce((sum, food) => sum + food.carbs, 0), [allFoods]);
  const totalF = useMemo(() => allFoods.reduce((sum, food) => sum + food.fats, 0), [allFoods]);

  const completedDayIds = useMemo(() => {
    if (!activeMealPlanId || !activeMealActivation || activeMealPlanId !== activeMealActivation.planIdentifier) return [];
    return DAYS
      .filter((day) => {
        const dayDate = getScheduledDateForDayInCycle(activeMealActivation, day.id, todayKey);
        return mealCompletions.some(
          (item) => item.dayToken === `${activeMealPlanId}:${day.id}` && item.dateKey === dayDate,
        );
      })
      .map((day) => day.id);
  }, [activeMealActivation, activeMealPlanId, mealCompletions, todayKey]);

  // Compute which meal plan day maps to TODAY (for blue highlight)
  const todayPlanDayId = useMemo(() => {
    if (!activeMealActivation || !activeMealPlanId || activeMealPlanId !== activeMealActivation.planIdentifier) return "";
    return getScheduledDayForDate(activeMealActivation, todayKey).dayId;
  }, [activeMealActivation, activeMealPlanId, todayKey]);
  const isCompletedForDate = useMemo(
    () =>
      canMarkCompleted && activeMealPlanId
        ? mealCompletions.some(
            (item) => item.dayToken === `${activeMealPlanId}:${activeDayId}` && item.dateKey === todayKey,
          )
        : false,
    [activeDayId, activeMealPlanId, canMarkCompleted, mealCompletions, todayKey],
  );

  const markDirty = () => {
    setIsDirty(true);
    setSaveState("idle");
  };

  const addFood = (slot: MealSlot, food: FoodItem) => {
    setAllMeals((prev) => ({
      ...prev,
      [activeDayId]: { ...prev[activeDayId], [slot]: [...prev[activeDayId][slot], toPlannedFood(food)] },
    }));
    markDirty();
  };

  const removeFood = (slot: MealSlot, foodId: number) => {
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

  const handleSave = async () => {
    if (saveState === "saving") return;
    setSaveState("saving");

    const payload = buildMealPlanPayload(allMeals);
    const mealsPerDay = Math.max(1, MEAL_SLOTS.length);
    const numericPlanId = currentPlanId && Number.isFinite(Number(currentPlanId)) ? Number(currentPlanId) : null;
    const savedPlan = numericPlanId
      ? await mealPlanApi.update(numericPlanId, title.trim() || "Meal Plan", mealsPerDay, payload)
      : await mealPlanApi.create(title.trim() || "Meal Plan", mealsPerDay, payload);

    if (!savedPlan) {
      setSaveState("error");
      return;
    }

    setCurrentPlanId(String(savedPlan.id));
    setTitle(savedPlan.name);
    setAllMeals(planToMeals(savedPlan));
    setIsDirty(false);
    setSaveState("saved");
    window.setTimeout(() => setSaveState((current) => (current === "saved" ? "idle" : current)), 1800);
    if (!numericPlanId) {
      navigate(`/meal-plan?planId=${savedPlan.id}`, { replace: true });
    }
  };

  const handleSaveQuantity = async (quantityGrams: number) => {
    if (!selectedFood) return;
    const { slot, food } = selectedFood;
    let updated: PlannedFoodItem | null = null;

    if (food.planItemId) {
      const savedItem = await mealPlanApi.updateItemQuantity(food.planItemId, quantityGrams);
      if (savedItem) updated = mapPlanItemToFood(savedItem);
    }

    updated ??= toPlannedFood(food, quantityGrams, food.planItemId);
    setAllMeals((prev) => ({
      ...prev,
      [activeDayId]: {
        ...prev[activeDayId],
        [slot]: prev[activeDayId][slot].map((item) =>
          (item.planItemId && item.planItemId === food.planItemId) ||
          (!item.planItemId && item.foodItemId === food.foodItemId)
            ? updated!
            : item,
        ),
      },
    }));
    setSelectedFood(null);
    markDirty();
  };

  const handleMarkCompleted = async () => {
    if (!activeMealPlanId || !canMarkCompleted || activeDayId !== todayPlanDayId) return;
    const completed = await planCompletionApi.markComplete({
      planType: "Meal",
      dayToken: `${activeMealPlanId}:${activeDayId}`,
      dateKey: todayKey,
    });
    if (completed) {
      setCompletionVersion((current) => current + 1);
    }
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
            {canMarkCompleted && activeDayId === todayPlanDayId ? (
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
                {isCompletedForDate ? "Completed" : "Complete"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === "saving" || (!isDirty && Boolean(currentPlanId))}
              className={`inline-flex w-fit items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95 ${
                saveState === "saved"
                  ? "scale-100 border-emerald-300/60 bg-emerald-400/25 text-emerald-50 shadow-[0_0_26px_rgba(16,185,129,0.35)]"
                  : saveState === "error"
                    ? "scale-100 border-rose-300/50 bg-rose-500/15 text-rose-100"
                    : isDirty || !currentPlanId
                      ? "scale-100 border-emerald-400/50 bg-emerald-500/20 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.25)] hover:bg-emerald-500/30 hover:shadow-[0_0_24px_rgba(16,185,129,0.35)]"
                      : "scale-95 cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
              }`}
            >
              {saveState === "saving" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saveState === "saved" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved!" : saveState === "error" ? "Save failed" : "Save Changes"}
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
            <span className="text-sm font-semibold text-emerald-400">{totalP.toFixed(1)}g</span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="text-xs text-slate-400">Fats</span>
            <span className="text-sm font-semibold text-amber-400">{totalF.toFixed(1)}g</span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400" />
            <span className="text-xs text-slate-400">Carbs</span>
            <span className="text-sm font-semibold text-blue-400">{totalC.toFixed(1)}g</span>
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
              onOpen={(food) => setSelectedFood({ slot, food })}
              onRemove={(id) => removeFood(slot, id)}
            />
          ))}
        </div>

        {selectedFood ? (
          <QuantityModal
            food={selectedFood.food}
            onSave={handleSaveQuantity}
            onClose={() => setSelectedFood(null)}
          />
        ) : null}

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
