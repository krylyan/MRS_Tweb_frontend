import {
  ArrowDownWideNarrow,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import ReactDOM from "react-dom";
import type { FoodItem, MealItemType } from "../types/meal";
import { mealLibrary, type MealSortMode } from "../utils/mealLibrary";

interface MealFormState {
  id: string | null;
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
  priority: string;
  popularity: string;
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
  itemType: "simple",
  preparationSteps: "",
  priority: "0",
  popularity: "0",
});

const toCategoryLabel = (category: string): string =>
  category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function AdminMeals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<MealSortMode>("priority");
  const [newCategory, setNewCategory] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");
  const [form, setForm] = useState<MealFormState>(createEmptyForm);
  const [meals, setMeals] = useState<FoodItem[]>(() => mealLibrary.getAllMealsForAdmin());
  const [categories, setCategories] = useState<string[]>(() => mealLibrary.getFilterCategories());
  const [mealToDelete, setMealToDelete] = useState<FoodItem | null>(null);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => setStatusMessage(""), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  useEffect(() => {
    if (!mealToDelete) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMealToDelete(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mealToDelete]);

  const sortedMeals = useMemo(() => mealLibrary.getAllMealsForAdmin(sortMode), [sortMode, meals]);

  const filteredMeals = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return sortedMeals.filter((meal) => {
      const matchesFilter = activeFilter === "all" || meal.category === activeFilter;
      const matchesQuery =
        !normalizedQuery ||
        meal.name.toLowerCase().includes(normalizedQuery) ||
        meal.description.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, searchQuery, sortedMeals]);

  const refreshLibrary = () => {
    setMeals(mealLibrary.getAllMealsForAdmin(sortMode));
    setCategories(mealLibrary.getFilterCategories());
  };

  const setResultMessage = (ok: boolean, successMessage: string, errorMessage?: string) => {
    setStatusTone(ok ? "success" : "error");
    setStatusMessage(ok ? successMessage : errorMessage ?? "Action failed.");
  };

  const toNumber = (value: string): number => Number(value || 0);

  const handleSubmit = () => {
    const payload = {
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
      preparationSteps: form.preparationSteps
        .split(/\r?\n/)
        .map((step) => step.trim())
        .filter(Boolean),
      priority: toNumber(form.priority),
      popularity: toNumber(form.popularity),
    };

    const result = form.id
      ? mealLibrary.updateMeal(form.id, payload)
      : mealLibrary.createMeal(payload);

    setResultMessage(
      result.ok,
      form.id ? "Meal updated successfully." : "Meal created successfully.",
      result.message,
    );

    if (result.ok) {
      setForm(createEmptyForm());
      refreshLibrary();
    }
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
      itemType: meal.itemType ?? "simple",
      preparationSteps: (meal.preparationSteps ?? []).join("\n"),
      priority: String(meal.priority ?? 0),
      popularity: String(meal.popularity ?? 0),
    });
  };

  const handleDeleteMeal = (meal: FoodItem) => {
    const result = mealLibrary.deleteMeal(meal.id);
    setResultMessage(result.ok, `${meal.name} deleted.`, result.message);

    if (result.ok) {
      if (form.id === meal.id) {
        setForm(createEmptyForm());
      }
      refreshLibrary();
    }

    setMealToDelete(null);
  };

  const handleToggleRecommended = (meal: FoodItem) => {
    const result = mealLibrary.toggleRecommended(meal.id);
    setResultMessage(
      result.ok,
      meal.recommended ? `${meal.name} is no longer recommended.` : `${meal.name} marked as recommended.`,
      result.message,
    );

    if (result.ok) {
      refreshLibrary();
    }
  };

  const handleToggleHidden = (meal: FoodItem) => {
    const result = mealLibrary.toggleHidden(meal.id);
    setResultMessage(
      result.ok,
      meal.hidden ? `${meal.name} is visible again.` : `${meal.name} has been hidden from users.`,
      result.message,
    );

    if (result.ok) {
      refreshLibrary();
    }
  };

  const handleAddCategory = () => {
    const result = mealLibrary.addCategory(newCategory);
    setResultMessage(result.ok, "Category added.", result.message);

    if (result.ok) {
      setNewCategory("");
      refreshLibrary();
    }
  };

  const handleRemoveCategory = (category: string) => {
    const result = mealLibrary.removeCategory(category);
    setResultMessage(result.ok, `Category ${category} removed.`, result.message);

    if (result.ok) {
      if (activeFilter === category) {
        setActiveFilter("all");
      }
      refreshLibrary();
    }
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
                Add or edit meals, mark them as recommended or hidden, manage categories, control prepared vs simple products, update nutrition and images, and organize the library by priority, popularity, or category.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <AdminStatCard label="Meals" value={meals.length.toString()} />
              <AdminStatCard label="Recommended" value={meals.filter((meal) => meal.recommended).length.toString()} />
              <AdminStatCard label="Hidden" value={meals.filter((meal) => meal.hidden).length.toString()} />
              <AdminStatCard label="Categories" value={categories.length.toString()} />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="reveal-up reveal-delay-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search meals..."
                  className="h-12 w-full rounded-[14px] border border-white/12 bg-white/4 pl-12 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-amber-400/60 focus:shadow-[0_0_16px_rgba(251,191,36,0.16)]"
                />
              </div>

              <label className="relative">
                <ArrowDownWideNarrow className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={sortMode}
                  onChange={(event) => {
                    const nextSortMode = event.target.value as MealSortMode;
                    setSortMode(nextSortMode);
                    setMeals(mealLibrary.getAllMealsForAdmin(nextSortMode));
                  }}
                  className="h-12 w-full appearance-none rounded-[14px] border border-white/12 bg-white/4 pl-11 pr-4 text-sm font-semibold text-slate-100 outline-none transition-all focus:border-amber-400/60"
                >
                  <option value="priority">Sort: Priority</option>
                  <option value="popularity">Sort: Popularity</option>
                  <option value="category">Sort: Category</option>
                </select>
              </label>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeFilter === "all"
                    ? "bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40"
                    : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white"
                  }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveFilter(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeFilter === category
                      ? "bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40"
                      : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white"
                    }`}
                >
                  {toCategoryLabel(category)}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredMeals.map((meal) => {
                return (
                  <article
                    key={meal.id}
                    className="rounded-2xl border border-white/8 bg-slate-950/40 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
                  >
                    <div className="grid gap-4 xl:grid-cols-[96px_minmax(0,1fr)_220px] xl:items-center">
                      <div className="xl:col-start-1">
                        <img
                          src={meal.imageUrl}
                          alt={meal.name}
                          className="h-24 w-24 rounded-2xl object-cover"
                        />
                      </div>

                      <div className="min-w-0 xl:col-start-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{meal.name}</h3>
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                            {toCategoryLabel(meal.category)}
                          </span>
                          {meal.recommended ? (
                            <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[11px] font-semibold text-amber-100">
                              Recommended
                            </span>
                          ) : null}
                          {meal.hidden ? (
                            <span className="rounded-full bg-rose-400/20 px-2.5 py-1 text-[11px] font-semibold text-rose-100">
                              Hidden
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-400">
                          {meal.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-300">{meal.kcal} kcal</span>
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-300">{meal.protein}g protein</span>
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-300">{meal.fats}g fats</span>
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-300">{meal.carbs}g carbs</span>
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-300">{meal.grams}g serving</span>
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-300">Priority {meal.priority ?? 0}</span>
                          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-slate-300">Popularity {meal.popularity ?? 0}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 xl:col-start-3 xl:w-[220px] xl:justify-self-end">
                        <ActionIconButton
                          label="Edit"
                          title="Edit"
                          icon={<Pencil className="h-4 w-4" />}
                          tone="sky"
                          onClick={() => handleEditMeal(meal)}
                        />
                        <ActionIconButton
                          label={meal.recommended ? "Unrecommend" : "Recommend"}
                          title={meal.recommended ? "Unrecommend" : "Recommend"}
                          icon={<Sparkles className="h-4 w-4" />}
                          tone="amber"
                          onClick={() => handleToggleRecommended(meal)}
                        />
                        <ActionIconButton
                          label={meal.hidden ? "Show" : "Hide"}
                          title={meal.hidden ? "Show" : "Hide"}
                          icon={meal.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          tone="violet"
                          onClick={() => handleToggleHidden(meal)}
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
                );
              })}

              {filteredMeals.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-10 text-center text-slate-400">
                  No meals match the current filters.
                </div>
              ) : null}
            </div>
          </section>

          <div className="space-y-6">
            <section className="reveal-up reveal-delay-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{form.id ? "Edit Meal" : "Add Meal"}</h2>
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
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  />
                </FormField>

                <FormField label="Category">
                  <select
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-white/12 bg-slate-900 px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {toCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </FormField>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Calories">
                    <input
                      type="number"
                      value={form.kcal}
                      onChange={(event) => setForm((prev) => ({ ...prev, kcal: event.target.value }))}
                      className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                    />
                  </FormField>
                  <FormField label="Protein">
                    <input
                      type="number"
                      value={form.protein}
                      onChange={(event) => setForm((prev) => ({ ...prev, protein: event.target.value }))}
                      className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                    />
                  </FormField>
                  <FormField label="Fats">
                    <input
                      type="number"
                      value={form.fats}
                      onChange={(event) => setForm((prev) => ({ ...prev, fats: event.target.value }))}
                      className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                    />
                  </FormField>
                  <FormField label="Carbs">
                    <input
                      type="number"
                      value={form.carbs}
                      onChange={(event) => setForm((prev) => ({ ...prev, carbs: event.target.value }))}
                      className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                    />
                  </FormField>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <FormField label="Serving (g)">
                    <input
                      type="number"
                      value={form.grams}
                      onChange={(event) => setForm((prev) => ({ ...prev, grams: event.target.value }))}
                      className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                    />
                  </FormField>
                  <FormField label="Priority">
                    <input
                      type="number"
                      value={form.priority}
                      onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
                      className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                    />
                  </FormField>
                  <FormField label="Popularity">
                    <input
                      type="number"
                      value={form.popularity}
                      onChange={(event) => setForm((prev) => ({ ...prev, popularity: event.target.value }))}
                      className="input-no-spinner h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                    />
                  </FormField>
                </div>

                <FormField label="Details mode">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, itemType: "prepared" }))}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${form.itemType === "prepared"
                          ? "border-amber-400/40 bg-amber-400/15 text-amber-100"
                          : "border-white/12 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                        }`}
                    >
                      Recipe
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, itemType: "simple", preparationSteps: "" }))}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${form.itemType === "simple"
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
                    onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  />
                </FormField>

                <FormField label="Description">
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    rows={4}
                    className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  />
                </FormField>

                <FormField label={form.itemType === "prepared" ? "Preparation steps" : "About this product text"}>
                  <textarea
                    value={form.preparationSteps}
                    onChange={(event) => setForm((prev) => ({ ...prev, preparationSteps: event.target.value }))}
                    rows={5}
                    placeholder={
                      form.itemType === "prepared"
                        ? "One step per line"
                        : "Leave empty to show the main description in About This Product"
                    }
                    className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                    disabled={form.itemType === "simple"}
                  />
                </FormField>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-400"
                >
                  {form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {form.id ? "Save changes" : "Add meal"}
                </button>
              </div>
            </section>

            <section className="reveal-up reveal-delay-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-200" />
                <h2 className="text-xl font-bold text-white">Manage Categories</h2>
              </div>

              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  placeholder="Add new category..."
                  className="h-11 flex-1 rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-400"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-200"
                  >
                    <span>{toCategoryLabel(category)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category)}
                      className="text-slate-400 transition-colors hover:text-rose-300"
                      aria-label={`Remove ${category}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {statusMessage ? (
          <div className="pointer-events-none fixed bottom-4 right-4 z-[9999]">
            <div
              className={`min-w-[260px] max-w-[360px] rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_42px_rgba(0,0,0,0.35)] backdrop-blur-md ${statusTone === "success"
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
            <DeleteMealModal
              onCancel={() => setMealToDelete(null)}
              onConfirm={() => handleDeleteMeal(mealToDelete)}
            />,
            document.body,
          )
          : null}
      </div>
    </main>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
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
  tone: "sky" | "amber" | "violet" | "rose";
}) {
  const toneClasses: Record<typeof tone, string> = {
    sky: "border-sky-400/25 bg-sky-400/10 text-sky-100 hover:bg-sky-400/20",
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20",
    violet: "border-violet-400/25 bg-violet-400/10 text-violet-100 hover:bg-violet-400/20",
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

function DeleteMealModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="modal-backdrop absolute inset-0 bg-black/75" onClick={onCancel} />

      <div className="modal-panel relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/12 bg-slate-900 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        <div className="border-b border-white/10 px-8 py-8 text-center">
          <h2 className="mx-auto max-w-[290px] text-[20px] font-bold leading-[1.2] text-slate-50 sm:text-[22px]">
            Are you sure you want to delete this item?
          </h2>
          <p className="mt-6 text-sm leading-6 text-slate-400">
            This action cannot be undone.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-base font-semibold text-slate-200 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl border border-rose-400/25 bg-rose-500/15 px-4 py-3 text-base font-semibold text-rose-200 transition-colors hover:bg-rose-500/25 hover:text-rose-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
