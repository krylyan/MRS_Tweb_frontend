import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface FoodItem {
  id: string;
  name: string;
  kcal: number;
  imageUrl: string;
}

type MealSlot = "breakfast" | "lunch" | "snacks" | "dinner";

interface MealColumn {
  key: MealSlot;
  label: string;
  items: FoodItem[];
}

/* ------------------------------------------------------------------ */
/*  Preset food catalogue (used in the "Add food" picker)             */
/* ------------------------------------------------------------------ */
const FOOD_CATALOGUE: FoodItem[] = [
  { id: "bread",        name: "Bread",        kcal: 130, imageUrl: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=60&h=60&fit=crop&auto=format" },
  { id: "egg",          name: "Egg",          kcal: 155, imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=60&h=60&fit=crop&auto=format" },
  { id: "cheese",       name: "Cheese",       kcal: 402, imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=60&h=60&fit=crop&auto=format" },
  { id: "oatmeal",      name: "Oatmeal",      kcal: 150, imageUrl: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=60&h=60&fit=crop&auto=format" },
  { id: "banana",       name: "Banana",       kcal: 89,  imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=60&h=60&fit=crop&auto=format" },
  { id: "apple",        name: "Apple",        kcal: 52,  imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=60&h=60&fit=crop&auto=format" },
  { id: "lettuce",      name: "Lettuce",      kcal: 15,  imageUrl: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=60&h=60&fit=crop&auto=format" },
  { id: "tomato",       name: "Tomato",       kcal: 18,  imageUrl: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=60&h=60&fit=crop&auto=format" },
  { id: "corn",         name: "Corn",         kcal: 86,  imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=60&h=60&fit=crop&auto=format" },
  { id: "rice",         name: "Rice",         kcal: 205, imageUrl: "https://images.unsplash.com/photo-1536304993881-ff86e0c9b96d?w=60&h=60&fit=crop&auto=format" },
  { id: "chicken",      name: "Chicken",      kcal: 239, imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=60&h=60&fit=crop&auto=format" },
  { id: "salmon",       name: "Salmon",       kcal: 208, imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=60&h=60&fit=crop&auto=format" },
  { id: "hummus",       name: "Hummus",       kcal: 166, imageUrl: "https://images.unsplash.com/photo-1637949385162-e416a5527778?w=60&h=60&fit=crop&auto=format" },
  { id: "carrot",       name: "Carrot",       kcal: 41,  imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=60&h=60&fit=crop&auto=format" },
  { id: "sweet-potato", name: "Sweet Potato", kcal: 86,  imageUrl: "https://images.unsplash.com/photo-1596097635121-14b38c5d7de4?w=60&h=60&fit=crop&auto=format" },
  { id: "coconut-milk", name: "Coconut Milk", kcal: 230, imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=60&h=60&fit=crop&auto=format" },
  { id: "almonds",      name: "Almonds",      kcal: 579, imageUrl: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=60&h=60&fit=crop&auto=format" },
  { id: "yogurt",       name: "Yogurt",       kcal: 100, imageUrl: "https://images.unsplash.com/photo-1488477181228-c84de6156a6f?w=60&h=60&fit=crop&auto=format" },
];

const INITIAL_COLUMNS: MealColumn[] = [
  {
    key: "breakfast",
    label: "Breakfast",
    items: [
      FOOD_CATALOGUE.find((f) => f.id === "bread")!,
      FOOD_CATALOGUE.find((f) => f.id === "egg")!,
    ],
  },
  {
    key: "lunch",
    label: "Lunch",
    items: [
      FOOD_CATALOGUE.find((f) => f.id === "lettuce")!,
      FOOD_CATALOGUE.find((f) => f.id === "tomato")!,
      FOOD_CATALOGUE.find((f) => f.id === "rice")!,
    ],
  },
  {
    key: "snacks",
    label: "Snacks",
    items: [
      FOOD_CATALOGUE.find((f) => f.id === "apple")!,
      FOOD_CATALOGUE.find((f) => f.id === "hummus")!,
    ],
  },
  {
    key: "dinner",
    label: "Dinner",
    items: [
      FOOD_CATALOGUE.find((f) => f.id === "chicken")!,
      FOOD_CATALOGUE.find((f) => f.id === "sweet-potato")!,
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Macro circle                                                        */
/* ------------------------------------------------------------------ */
function MacroCircle({
  label,
  grams,
  color,
}: {
  label: string;
  grams: number;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  const radius = 16;
  const circ = 2 * Math.PI * radius;

  return (
    <div
      className="relative flex h-[42px] w-[42px] cursor-default items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg width="42" height="42" className="-rotate-90">
        {/* track */}
        <circle cx="21" cy="21" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        {/* progress — full circle, just colored */}
        <circle
          cx="21"
          cy="21"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
      </svg>
      {/* Center label */}
      <span
        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold leading-none text-white transition-all duration-200"
        style={{ fontSize: hovered ? "8px" : "9px" }}
      >
        {hovered ? `${grams}g` : label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Food picker popover                                                */
/* ------------------------------------------------------------------ */
function FoodPicker({
  onAdd,
  onClose,
  existing,
}: {
  onAdd: (food: FoodItem) => void;
  onClose: () => void;
  existing: string[];
}) {
  const [q, setQ] = useState("");
  const available = FOOD_CATALOGUE.filter(
    (f) =>
      !existing.includes(f.id) &&
      f.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="absolute bottom-12 left-0 z-50 w-64 overflow-hidden rounded-2xl border border-white/12 bg-slate-900 shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
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
      <div className="max-h-56 overflow-y-auto px-2 pb-2">
        {available.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-400">No foods found</p>
        )}
        {available.map((food) => (
          <button
            key={food.id}
            type="button"
            onClick={() => {
              onAdd(food);
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/8"
          >
            <img
              src={food.imageUrl}
              alt={food.name}
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="flex-1 text-sm text-slate-200">{food.name}</span>
            <span className="text-xs text-slate-400">{food.kcal} kcal</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */
export default function MealPlanMenu() {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("New Meal Plan");
  const [titleFocused, setTitleFocused] = useState(false);
  const [columns, setColumns] = useState<MealColumn[]>(INITIAL_COLUMNS);
  const [openPicker, setOpenPicker] = useState<MealSlot | null>(null);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const totalKcal = columns
    .flatMap((c) => c.items)
    .reduce((sum, f) => sum + f.kcal, 0);

  // Fake macro grams derived from kcal
  const proteinG = Math.round(totalKcal * 0.25 / 4);
  const carbsG   = Math.round(totalKcal * 0.45 / 4);
  const fatsG    = Math.round(totalKcal * 0.30 / 9);

  const markDirty = () => { setIsDirty(true); setSaved(false); };

  const addFood = (slot: MealSlot, food: FoodItem) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === slot ? { ...col, items: [...col.items, food] } : col,
      ),
    );
    markDirty();
  };

  const removeFood = (slot: MealSlot, foodId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === slot
          ? { ...col, items: col.items.filter((f) => f.id !== foodId) }
          : col,
      ),
    );
    markDirty();
  };

  const handleSave = () => {
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">

        {/* ── Title ────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); markDirty(); }}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            className={`w-full max-w-xl rounded-xl border bg-transparent px-2 py-1 text-4xl font-bold text-slate-50 outline-none transition-all ${
              titleFocused ? "border-emerald-400/60" : "border-transparent"
            }`}
          />
          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 ${
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

        {/* ── Banner ───────────────────────────────────────────── */}
        <div className="reveal-up mb-8 overflow-hidden rounded-2xl border border-white/10">
          {/* Food photo */}
          <div className="relative h-52 w-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400&fit=crop&auto=format"
              alt="Meal plan banner"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>

          {/* Macro summary */}
          <div className="flex items-center gap-6 bg-slate-900/80 px-6 py-4 backdrop-blur-sm">
            {/* Kcal */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-50">
                  {totalKcal.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">Total kcal</p>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            {/* Macro circles */}
            <div className="flex items-center gap-3">
              <MacroCircle label="P" grams={proteinG} color="#34d399" />
              <MacroCircle label="C" grams={carbsG}   color="#60a5fa" />
              <MacroCircle label="F" grams={fatsG}    color="#fb923c" />
            </div>

            <div className="ml-2 flex flex-col gap-0.5 text-xs text-slate-400">
              <span><span className="text-emerald-400 font-semibold">{proteinG}g</span> Protein</span>
              <span><span className="text-blue-400 font-semibold">{carbsG}g</span> Carbs</span>
              <span><span className="text-orange-400 font-semibold">{fatsG}g</span> Fats</span>
            </div>
          </div>
        </div>

        {/* ── Meal columns ─────────────────────────────────────── */}
        <div className="reveal-up grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => (
            <div
              key={col.key}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/5"
            >
              {/* Column header */}
              <div className="border-b border-white/8 px-4 py-3">
                <h3 className="text-base font-bold text-slate-50">{col.label}</h3>
                <p className="text-xs text-slate-400">
                  {col.items.reduce((s, f) => s + f.kcal, 0)} kcal
                </p>
              </div>

              {/* Food items */}
              <div className="flex flex-1 flex-col gap-2 p-3">
                {col.items.map((food) => (
                  <div
                    key={food.id}
                    className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-white/15 hover:bg-white/8"
                  >
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-200">
                        {food.name}
                      </p>
                      <p className="text-xs text-emerald-400">{food.kcal} kcal</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFood(col.key, food.id)}
                      aria-label={`Remove ${food.name}`}
                      className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-500/15 hover:text-rose-400 group-hover:flex"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add button */}
              <div className="relative p-3 pt-0">
                <button
                  type="button"
                  onClick={() =>
                    setOpenPicker((prev) => (prev === col.key ? null : col.key))
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-2.5 text-sm font-medium text-slate-400 transition-all hover:border-emerald-400/40 hover:text-emerald-400"
                >
                  <Plus className="h-4 w-4" />
                  Add food
                </button>

                {openPicker === col.key && (
                  <FoodPicker
                    onAdd={(food) => addFood(col.key, food)}
                    onClose={() => setOpenPicker(null)}
                    existing={col.items.map((f) => f.id)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Back link ────────────────────────────────────────── */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => navigate("/plans?tab=alimentation")}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Back to My Plans
          </button>
        </div>
      </div>

      {/* Close picker on outside click */}
      {openPicker !== null && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenPicker(null)}
        />
      )}
    </main>
  );
}
