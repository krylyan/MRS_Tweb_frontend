import { Check, ChevronDown, ChevronUp, Flame, Plus, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FOOD_CATALOGUE } from "../data/meals";
import type { FoodItem } from "../types/meal";

/* ────────────────────────────── Types ──────────────────────────────── */
type MealSlot = "breakfast" | "lunch" | "snacks" | "dinner";

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

/* ────────────────────────── Food catalogue ─────────────────────────── */
const findFood = (id: string) => FOOD_CATALOGUE.find((f) => f.id === id)!;

/* ──────────────────────── Day meals state ──────────────────────────── */
type DayMeals = Record<MealSlot, FoodItem[]>;
type AllDayMeals = Record<string, DayMeals>;

const createEmptyDay = (): DayMeals => ({
  breakfast: [],
  lunch: [],
  snacks: [],
  dinner: [],
});

const INITIAL_MEALS: AllDayMeals = {
  "day-1": {
    breakfast: [findFood("bread"), findFood("egg"), findFood("yogurt")],
    lunch:     [findFood("lettuce"), findFood("tomato"), findFood("chicken"), findFood("rice")],
    snacks:    [findFood("apple"), findFood("hummus"), findFood("carrot")],
    dinner:    [findFood("salmon"), findFood("sweet-potato"), findFood("almonds")],
  },
  ...Object.fromEntries(
    Array.from({ length: 6 }, (_, i) => [`day-${i + 2}`, createEmptyDay()]),
  ),
};

/* ──────────────────────── FoodPicker (dropdown) ────────────────────── */
function FoodPicker({
  existing,
  onAdd,
  onClose,
}: {
  existing: string[];
  onAdd: (food: FoodItem) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const available = FOOD_CATALOGUE.filter(
    (f) =>
      !existing.includes(f.id) &&
      f.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      {/* backdrop that closes picker */}
      <div className="fixed inset-0 z-[190]" onClick={onClose} />
      {/* panel — above backdrop */}
      <div className="absolute bottom-full left-0 z-[200] mb-2 w-64 overflow-hidden rounded-2xl border border-white/12 bg-slate-900 shadow-[0_24px_48px_rgba(0,0,0,0.7)]">
        <div className="p-3">
          <input
            autoFocus
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search foods..."
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500/50"
          />
        </div>
        <div className="max-h-60 overflow-y-auto px-2 pb-2">
          {available.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400">No foods found</p>
          )}
          {available.map((food) => (
            <button
              key={food.id}
              type="button"
              onClick={() => { onAdd(food); onClose(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/8"
            >
              <img src={food.imageUrl} alt={food.name} className="h-8 w-8 rounded-lg object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-200">{food.name}</p>
                <p className="text-xs text-slate-400">{food.kcal} kcal - {food.grams}g</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────── FoodCard ─────────────────────────────── */
function FoodCard({ food, onRemove }: { food: FoodItem; onRemove: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-white/20">
      {/* Image */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-800">
        <img
          src={food.imageUrl}
          alt={food.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {/* Gram badge — bottom left */}
        <span className="absolute bottom-2 left-2 rounded-lg bg-emerald-600/90 px-2 py-0.5 text-[11px] font-bold text-white shadow">
          {food.grams}g
        </span>
        {/* Remove button — top right */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${food.name}`}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 shadow-md transition-all hover:bg-rose-400"
        >
          <X className="h-3 w-3 text-white" />
        </button>
      </div>

      {/* Macro row */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 pt-2 pb-1 text-[11px]">
        <span className="flex items-center gap-0.5 font-medium text-orange-400">
          <Flame className="h-3 w-3" />{food.kcal}
        </span>
        <span className="font-medium text-amber-300">{food.carbs}g</span>
        <span className="font-medium text-rose-300">{food.protein}g</span>
        <span className="font-medium text-lime-300">{food.fats}g</span>
      </div>

      {/* Name */}
      <div className="px-3 pb-3 pt-0.5">
        <p className="text-sm font-bold leading-snug text-slate-100">{food.name}</p>
        <p className="text-[11px] text-emerald-400">add alternatives</p>
      </div>
    </div>
  );
}

/* ──────────────────────────── MealSection ──────────────────────────── */
function MealSection({
  slot,
  items,
  collapsed,
  onToggleCollapse,
  onAdd,
  onRemove,
}: {
  slot: MealSlot;
  items: FoodItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onAdd: (food: FoodItem) => void;
  onRemove: (foodId: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const slotKcal = items.reduce((s, f) => s + f.kcal, 0);

  return (
    // No overflow-hidden on this container so the picker dropdown can escape
    <section className="mb-4 rounded-2xl border border-white/10 bg-white/5">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => { onToggleCollapse(); setPickerOpen(false); }}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span className="text-sm font-bold uppercase tracking-widest text-slate-50">
          {MEAL_LABELS[slot]}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            <span className="font-semibold text-slate-200">{slotKcal}</span> kcal
          </span>
          {collapsed
            ? <ChevronDown className="h-4 w-4 text-slate-400" />
            : <ChevronUp className="h-4 w-4 text-slate-400" />
          }
        </div>
      </button>

      {/* CSS grid collapse */}
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: collapsed ? "0fr" : "1fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {/* Food cards */}
              {items.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onRemove={() => onRemove(food.id)}
                />
              ))}

              {/* Add food card */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPickerOpen((p) => !p)}
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

                {pickerOpen && (
                  <FoodPicker
                    existing={items.map((f) => f.id)}
                    onAdd={(food) => { onAdd(food); setPickerOpen(false); }}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Daily totals sidebar ─────────────────────── */
function DailyTotals({ meals }: { meals: DayMeals }) {
  const all = Object.values(meals).flat();
  const kcal    = all.reduce((s, f) => s + f.kcal,    0);
  const protein = all.reduce((s, f) => s + f.protein, 0);
  const carbs   = all.reduce((s, f) => s + f.carbs,   0);
  const fats    = all.reduce((s, f) => s + f.fats,    0);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-300">
        Daily totals
      </h3>
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Calories</span>
          <span className="text-sm font-semibold text-orange-400">{kcal.toLocaleString()} kcal</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Protein</span>
          <span className="text-sm font-semibold text-emerald-400">{protein}g</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Fats</span>
          <span className="text-sm font-semibold text-amber-400">{fats}g</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Carbs</span>
          <span className="text-sm font-semibold text-blue-400">{carbs}g</span>
        </div>
      </div>

      {kcal > 0 && (
        <div className="mt-5">
          <div className="flex h-2.5 overflow-hidden rounded-full">
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${Math.round((protein * 4 / kcal) * 100)}%` }}
            />
            <div
              className="bg-amber-400 transition-all"
              style={{ width: `${Math.round((fats * 9 / kcal) * 100)}%` }}
            />
            <div
              className="bg-blue-400 transition-all"
              style={{ width: `${Math.round((carbs * 4 / kcal) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-500">
            <span className="text-emerald-400">Protein</span>
            <span className="text-amber-400">Fats</span>
            <span className="text-blue-400">Carbs</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Main page ─────────────────────────────── */
export default function MealPlanMenu() {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle]               = useState("New Meal Plan");
  const [titleFocused, setTitleFocused] = useState(false);
  const [activeDayId, setActiveDayId]   = useState("day-1");
  const [allMeals, setAllMeals]         = useState<AllDayMeals>(INITIAL_MEALS);
  const [collapsed, setCollapsed]       = useState<Record<MealSlot, boolean>>({
    breakfast: false,
    lunch: false,
    snacks: false,
    dinner: false,
  });
  const [saved, setSaved]     = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const currentMeals = allMeals[activeDayId];

  const allFoods    = useMemo(() => Object.values(currentMeals).flat(), [currentMeals]);
  const totalKcal   = useMemo(() => allFoods.reduce((s, f) => s + f.kcal,    0), [allFoods]);
  const totalP      = useMemo(() => allFoods.reduce((s, f) => s + f.protein, 0), [allFoods]);
  const totalC      = useMemo(() => allFoods.reduce((s, f) => s + f.carbs,   0), [allFoods]);
  const totalF      = useMemo(() => allFoods.reduce((s, f) => s + f.fats,    0), [allFoods]);

  const proteinPct = totalKcal > 0 ? Math.round((totalP * 4 / totalKcal) * 100) : 0;
  const fatsPct    = totalKcal > 0 ? Math.round((totalF * 9 / totalKcal) * 100) : 0;
  const carbsPct   = totalKcal > 0 ? Math.round((totalC * 4 / totalKcal) * 100) : 0;

  const markDirty = () => { setIsDirty(true); setSaved(false); };

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
        [slot]: prev[activeDayId][slot].filter((f) => f.id !== foodId),
      },
    }));
    markDirty();
  };

  const toggleCollapse = (slot: MealSlot) =>
    setCollapsed((prev) => ({ ...prev, [slot]: !prev[slot] }));

  const handleSave = () => {
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">

        {/* ── Title + Save ────────────────────────────────────── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); markDirty(); }}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            className={`w-full max-w-xl rounded-xl border bg-transparent px-2 py-1 text-3xl font-bold text-slate-50 outline-none transition-all sm:text-4xl ${
              titleFocused ? "border-emerald-400/60" : "border-transparent"
            }`}
          />
          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 ${
              saved
                ? "bg-emerald-600 shadow-emerald-600/30"
                : isDirty
                ? "animate-pulse bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-400"
                : "bg-white/8 shadow-none hover:bg-white/12"
            }`}
          >
            {saved && <Check className="h-4 w-4" />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* ── Days selector (matches GymPlanMenu style, 7 days) ── */}
        <section className="reveal-up mb-4 rounded-[14px] border border-white/12 bg-white/4 px-4 py-3 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
          <div className="flex flex-wrap items-center gap-2.5">
            {DAYS.map((day) => {
              const isActive = day.id === activeDayId;
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setActiveDayId(day.id)}
                  className={`rounded-[10px] border px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
                      : "border-white/10 bg-white/[0.02] text-slate-200 hover:bg-white/[0.08]"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Macro progress bar ──────────────────────────────── */}
        <div className="reveal-up mb-6">
          <div className="flex h-6 overflow-hidden rounded-full text-[11px] font-semibold text-white">
            <div
              className="flex items-center justify-center bg-emerald-500 transition-all duration-500"
              style={{ width: `${proteinPct}%` }}
              title={`Protein ${proteinPct}%`}
            >
              {proteinPct > 9 && `Protein ${proteinPct}%`}
            </div>
            <div
              className="flex items-center justify-center bg-orange-400 transition-all duration-500"
              style={{ width: `${fatsPct}%` }}
              title={`Fats ${fatsPct}%`}
            >
              {fatsPct > 9 && `Fats ${fatsPct}%`}
            </div>
            <div
              className="flex items-center justify-center bg-blue-400 transition-all duration-500"
              style={{ width: `${carbsPct}%` }}
              title={`Carbs ${carbsPct}%`}
            >
              {carbsPct > 9 && `Carbs ${carbsPct}%`}
            </div>
            {totalKcal === 0 && (
              <div className="flex-1 bg-white/10" />
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Protein {proteinPct}%</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-orange-400" />Fats {fatsPct}%</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-blue-400" />Carbs {carbsPct}%</span>
          </div>
        </div>

        {/* ── Two-column layout ───────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* Left: meal sections */}
          <div className="flex-1">
            {MEAL_SLOTS.map((slot) => (
              <MealSection
                key={slot}
                slot={slot}
                items={currentMeals[slot]}
                collapsed={collapsed[slot]}
                onToggleCollapse={() => toggleCollapse(slot)}
                onAdd={(food) => addFood(slot, food)}
                onRemove={(id) => removeFood(slot, id)}
              />
            ))}
          </div>

          {/* Right: daily totals (sticky) */}
          <div className="lg:w-64 lg:shrink-0 xl:w-72">
            <div className="sticky top-6">
              <DailyTotals meals={currentMeals} />
            </div>
          </div>
        </div>

        {/* ── Back link ───────────────────────────────────────── */}
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
