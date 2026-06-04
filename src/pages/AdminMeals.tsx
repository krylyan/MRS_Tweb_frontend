import {
  Pencil,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import ReactDOM from "react-dom";
import { FoodTypeDropdown, type FoodTypeFilter } from "../components/FoodTypeDropdown";
import { mealService, type FoodItemPayload } from "../services/mealService";
import type { FoodItem, MealItemType } from "../types/meal";

interface MealFormState {
  id: number | null;
  name: string;
  category: string;
  kcal: string;
  protein: string;
  fats: string;
  carbs: string;
  grams: string;
  imageUrl: string;
  description: string;
  itemType: MealItemType;
  preparationSteps: string;
}

const createEmptyForm = (): MealFormState => ({
  id: null,
  name: "",
  category: "",
  kcal: "0",
  protein: "0",
  fats: "0",
  carbs: "0",
  grams: "100",
  imageUrl: "",
  description: "",
  itemType: "Simple",
  preparationSteps: "",
});

const toCategoryLabel = (category: string): string =>
  category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function AdminMeals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FoodTypeFilter>("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");
  const [form, setForm] = useState<MealFormState>(createEmptyForm);
  const [meals, setMeals] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<FoodItem | null>(null);

  useEffect(() => {
    Promise.all([mealService.getAllMeals(), mealService.getFilterCategories()])
      .then(([data, cats]) => {
        setMeals(data);
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const id = window.setTimeout(() => setStatusMessage(""), 3200);
    return () => window.clearTimeout(id);
  }, [statusMessage]);

  useEffect(() => {
    if (!mealToDelete) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMealToDelete(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mealToDelete]);

  const filteredMeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return meals.filter((m) => {
      const matchesFilter = activeFilter === "all" || m.itemType === activeFilter;
      const matchesQuery =
        !q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, meals, searchQuery]);

  const refreshMeals = async () => {
    const [data, cats] = await Promise.all([
      mealService.getAllMeals(),
      mealService.getFilterCategories(),
    ]);
    setMeals(data);
    setCategories(cats);
  };

  const setResultMessage = (ok: boolean, successMsg: string, errorMsg?: string) => {
    setStatusTone(ok ? "success" : "error");
    setStatusMessage(ok ? successMsg : errorMsg ?? "Action failed.");
  };

  const toNumber = (value: string): number => Number(value || 0);

  const buildPayload = (): FoodItemPayload => ({
    name: form.name,
    category: form.category,
    kcal: toNumber(form.kcal),
    protein: toNumber(form.protein),
    fats: toNumber(form.fats),
    carbs: toNumber(form.carbs),
    grams: toNumber(form.grams),
    imageUrl: form.imageUrl,
    description: form.description,
    itemType: form.itemType,
    preparationSteps: form.itemType === "Prepared" && form.preparationSteps.trim()
      ? form.preparationSteps.trim()
      : null,
  });

  const handleSubmit = async () => {
    if (!form.name || !form.category) {
      setResultMessage(false, "", "Name and category are required.");
      return;
    }
    setSubmitting(true);
    const payload = buildPayload();
    const result = form.id
      ? await mealService.updateMeal(form.id, payload)
      : await mealService.createMeal(payload);

    setResultMessage(
      result.ok,
      form.id ? "Meal updated successfully." : "Meal created successfully.",
      result.ok ? undefined : result.message,
    );
    if (result.ok) {
      setForm(createEmptyForm());
      setMeals((prev) => {
        const withoutSavedMeal = prev.filter((meal) => meal.id !== result.meal.id);
        return [result.meal, ...withoutSavedMeal];
      });
      await refreshMeals();
    }
    setSubmitting(false);
  };

  const handleEditMeal = (meal: FoodItem) => {
    setForm({
      id: meal.id,
      name: meal.name,
      category: meal.category,
      kcal: String(meal.kcal),
      protein: String(meal.protein),
      fats: String(meal.fats),
      carbs: String(meal.carbs),
      grams: String(meal.grams),
      imageUrl: meal.imageUrl,
      description: meal.description,
      itemType: meal.itemType,
      preparationSteps: meal.preparationSteps ?? "",
    });
  };

  const handleDeleteMeal = async (meal: FoodItem) => {
    const result = await mealService.deleteMeal(meal.id);
    setResultMessage(result.ok, `${meal.name} deleted.`, result.message);
    if (result.ok) {
      if (form.id === meal.id) setForm(createEmptyForm());
      await refreshMeals();
    }
    setMealToDelete(null);
  };

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1450px] px-4 py-6 sm:px-6 sm:py-8">
        <section className="reveal-up mb-6 rounded-3xl border border-amber-400/25 bg-amber-500/15 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                Admin Meal Library
              </div>
              <h1 className="text-4xl font-bold text-white">Manage Meals</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Add or edit meals, manage categories and nutrition data.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AdminStatCard label="Meals" value={meals.length.toString()} />
              <AdminStatCard label="Categories" value={categories.length.toString()} />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="reveal-up reveal-delay-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="relative z-40 mb-4">
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search meals..."
                  className="h-12 w-full rounded-[14px] border border-white/12 bg-white/4 pl-12 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-amber-400/60"
                />
              </div>

              <FoodTypeDropdown
                value={activeFilter}
                onChange={setActiveFilter}
                accent="amber"
                className="max-w-[220px]"
              />
            </div>

            {loading && (
              <div className="py-10 text-center text-slate-400 animate-pulse">
                Loading meals...
              </div>
            )}

            {!loading && (
              <div className="relative z-0 space-y-3">
                {filteredMeals.map((meal) => (
                  <article
                    key={meal.id}
                    className="rounded-2xl border border-white/8 bg-slate-950/40 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
                  >
                    <div className="grid gap-4 xl:grid-cols-[96px_minmax(0,1fr)_160px] xl:items-center">
                      <div className="xl:col-start-1">
                        <img
                          src={meal.imageUrl}
                          alt={meal.name}
                          className="h-24 w-24 rounded-2xl bg-slate-950/60 object-contain p-1.5"
                        />
                      </div>

                      <div className="min-w-0 xl:col-start-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{meal.name}</h3>
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                            {toCategoryLabel(meal.category)}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-400">
                          {meal.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-300">
                            {meal.kcal} kcal / 100g
                          </span>
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-300">
                            {meal.protein}g protein
                          </span>
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-300">
                            {meal.fats}g fats
                          </span>
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-300">
                            {meal.carbs}g carbs
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 xl:col-start-3 xl:w-[112px] xl:justify-self-end">
                        <ActionIconButton
                          label="Edit"
                          title="Edit"
                          icon={<Pencil className="h-4 w-4" />}
                          tone="sky"
                          onClick={() => handleEditMeal(meal)}
                        />
                        <ActionIconButton
                          label="Delete"
                          title="Delete"
                          icon={<Trash2 className="h-4 w-4" />}
                          tone="rose"
                          onClick={() => setMealToDelete(meal)}
                        />
                      </div>
                    </div>
                  </article>
                ))}

                {filteredMeals.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-10 text-center text-slate-400">
                    No meals match the current filters.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="reveal-up reveal-delay-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {form.id ? "Edit Meal" : "Add Meal"}
              </h2>
              {form.id ? (
                <button
                  type="button"
                  onClick={() => setForm(createEmptyForm())}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              <FormField label="Name">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                />
              </FormField>

              <FormField label="Category">
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. chicken, protein, carbs..."
                  className="h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                />
              </FormField>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Calories / 100g">
                  <input
                    type="number"
                    value={form.kcal}
                    onChange={(e) => setForm((p) => ({ ...p, kcal: e.target.value }))}
                    className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  />
                </FormField>
                <FormField label="Protein (g)">
                  <input
                    type="number"
                    value={form.protein}
                    onChange={(e) => setForm((p) => ({ ...p, protein: e.target.value }))}
                    className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  />
                </FormField>
                <FormField label="Fats (g)">
                  <input
                    type="number"
                    value={form.fats}
                    onChange={(e) => setForm((p) => ({ ...p, fats: e.target.value }))}
                    className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  />
                </FormField>
                <FormField label="Carbs (g)">
                  <input
                    type="number"
                    value={form.carbs}
                    onChange={(e) => setForm((p) => ({ ...p, carbs: e.target.value }))}
                    className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  />
                </FormField>
              </div>

              <FormField label="Nutrition base (g)">
                <input
                  type="number"
                  value={form.grams}
                  onChange={(e) => setForm((p) => ({ ...p, grams: e.target.value }))}
                  className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                />
              </FormField>

              <FormField label="Type">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, itemType: "Prepared" }))}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      form.itemType === "Prepared"
                        ? "border-amber-400/40 bg-amber-400/15 text-amber-100"
                        : "border-white/12 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                    }`}
                  >
                    Recipe
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, itemType: "Simple", preparationSteps: "" }))}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      form.itemType === "Simple"
                        ? "border-amber-400/40 bg-amber-400/15 text-amber-100"
                        : "border-white/12 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                    }`}
                  >
                    Product
                  </button>
                </div>
              </FormField>

              <FormField label="Image URL">
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                />
              </FormField>

              <FormField
                label={form.itemType === "Prepared" ? "Preparation Steps" : "About This Product"}
              >
                <textarea
                  value={form.preparationSteps}
                  onChange={(e) => setForm((p) => ({ ...p, preparationSteps: e.target.value }))}
                  rows={5}
                  placeholder={
                    form.itemType === "Prepared"
                      ? "Enter preparation instructions..."
                      : "Optional additional text"
                  }
                  disabled={form.itemType === "Simple"}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition-all focus:border-amber-400/50 disabled:opacity-40"
                />
              </FormField>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-400 disabled:opacity-50"
              >
                {submitting ? (
                  "Saving..."
                ) : (
                  <>
                    {form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {form.id ? "Save changes" : "Add meal"}
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>

      {statusMessage ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[9999]">
          <div
            className={`min-w-[260px] max-w-[360px] rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_42px_rgba(0,0,0,0.35)] backdrop-blur-md ${
              statusTone === "success"
                ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-200"
                : "border-rose-500/30 bg-rose-500/12 text-rose-200"
            }`}
          >
            {statusMessage}
          </div>
        </div>
      ) : null}

      {mealToDelete
        ? ReactDOM.createPortal(
            <DeleteModal
              itemName={mealToDelete.name}
              onCancel={() => setMealToDelete(null)}
              onConfirm={() => handleDeleteMeal(mealToDelete)}
            />,
            document.body,
          )
        : null}
    </main>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function AdminStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}

function ActionIconButton({
  icon,
  label,
  onClick,
  title,
  tone,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  title: string;
  tone: "sky" | "amber" | "rose";
}) {
  const toneClasses: Record<typeof tone, string> = {
    sky: "border-sky-400/25 bg-sky-400/10 text-sky-100 hover:bg-sky-400/20",
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20",
    rose: "border-rose-400/25 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20",
  };
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={title}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${toneClasses[tone]}`}
      >
        {icon}
      </button>
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-950/95 px-2.5 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </div>
    </div>
  );
}

function DeleteModal({
  itemName,
  onCancel,
  onConfirm,
}: {
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-backdrop absolute inset-0 bg-black/75" onClick={onCancel} />
      <div className="modal-panel relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/12 bg-slate-900 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        <div className="border-b border-white/10 px-8 py-8 text-center">
          <h2 className="mx-auto max-w-[290px] text-[20px] font-bold leading-[1.2] text-slate-50">
            Delete &ldquo;{itemName}&rdquo;?
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-400">This action cannot be undone.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-base font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl border border-rose-400/25 bg-rose-500/15 px-4 py-3 text-base font-semibold text-rose-200 transition-colors hover:bg-rose-500/25"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
