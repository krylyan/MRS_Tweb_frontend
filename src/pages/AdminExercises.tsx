import {
  Dumbbell,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { exerciseLibrary } from "../utils/exerciseLibrary";
import type { Exercise } from "../types/exercise";

interface ExerciseFormState {
  id: string | null;
  name: string;
  muscleGroup: string;
  gifUrl: string;
  instructions: string;
}

const createEmptyForm = (): ExerciseFormState => ({
  id: null,
  name: "",
  muscleGroup: "",
  gifUrl: "",
  instructions: "",
});

export default function AdminExercises() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [newCategory, setNewCategory] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");
  const [form, setForm] = useState<ExerciseFormState>(createEmptyForm);
  const [exercises, setExercises] = useState<Exercise[]>(() => exerciseLibrary.getAllExercisesForAdmin());
  const [categories, setCategories] = useState<string[]>(() => exerciseLibrary.getFilterCategories());

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage("");
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  const filteredExercises = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchesFilter = activeFilter === "all" || exercise.muscleGroup === activeFilter;
      const matchesQuery =
        !normalizedQuery ||
        exercise.name.toLowerCase().includes(normalizedQuery) ||
        exercise.instructions.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, exercises, searchQuery]);

  const refreshLibrary = () => {
    setExercises(exerciseLibrary.getAllExercisesForAdmin());
    setCategories(exerciseLibrary.getFilterCategories());
  };

  const setResultMessage = (ok: boolean, successMessage: string, errorMessage?: string) => {
    setStatusTone(ok ? "success" : "error");
    setStatusMessage(ok ? successMessage : errorMessage ?? "Action failed.");
  };

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      muscleGroup: form.muscleGroup,
      gifUrl: form.gifUrl,
      instructions: form.instructions,
    };

    const result = form.id
      ? exerciseLibrary.updateExercise(form.id, payload)
      : exerciseLibrary.createExercise(payload);

    setResultMessage(
      result.ok,
      form.id ? "Exercise updated successfully." : "Exercise created successfully.",
      result.message,
    );

    if (result.ok) {
      setForm(createEmptyForm());
      refreshLibrary();
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setForm({
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      gifUrl: exercise.gifUrl,
      instructions: exercise.instructions,
    });
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    const result = exerciseLibrary.deleteExercise(exercise.id);
    setResultMessage(result.ok, `${exercise.name} deleted.`, result.message);

    if (result.ok) {
      if (form.id === exercise.id) {
        setForm(createEmptyForm());
      }
      refreshLibrary();
    }
  };

  const handleToggleRecommended = (exercise: Exercise) => {
    const result = exerciseLibrary.toggleRecommended(exercise.id);
    setResultMessage(
      result.ok,
      exercise.recommended ? `${exercise.name} is no longer recommended.` : `${exercise.name} marked as recommended.`,
      result.message,
    );

    if (result.ok) {
      refreshLibrary();
    }
  };

  const handleToggleHidden = (exercise: Exercise) => {
    const result = exerciseLibrary.toggleHidden(exercise.id);
    setResultMessage(
      result.ok,
      exercise.hidden ? `${exercise.name} is visible again.` : `${exercise.name} has been hidden from users.`,
      result.message,
    );

    if (result.ok) {
      refreshLibrary();
    }
  };

  const handleAddCategory = () => {
    const result = exerciseLibrary.addCategory(newCategory);
    setResultMessage(result.ok, "Category added.", result.message);

    if (result.ok) {
      setNewCategory("");
      refreshLibrary();
    }
  };

  const handleRemoveCategory = (category: string) => {
    const result = exerciseLibrary.removeCategory(category);
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
        <section className="reveal-up mb-6 rounded-3xl border border-amber-300/20 bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(15,23,42,0.96))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                <Dumbbell className="h-3.5 w-3.5" />
                Admin Exercise Library
              </div>
              <h1 className="text-4xl font-bold text-white">Manage Exercises</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Add new exercises, edit existing entries, hide broken items, mark recommendations, and manage the filter categories used by the exercise library.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <AdminStatCard label="Exercises" value={exercises.length.toString()} />
              <AdminStatCard
                label="Recommended"
                value={exercises.filter((exercise) => exercise.recommended).length.toString()}
              />
              <AdminStatCard
                label="Hidden"
                value={exercises.filter((exercise) => exercise.hidden).length.toString()}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="reveal-up reveal-delay-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative lg:w-[420px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search exercises..."
                  className="h-12 w-full rounded-[14px] border border-white/12 bg-white/4 pl-12 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-amber-400/60 focus:shadow-[0_0_16px_rgba(251,191,36,0.16)]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    activeFilter === "all"
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
                    className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all ${
                      activeFilter === category
                        ? "bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40"
                        : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredExercises.map((exercise) => (
                <article
                  key={exercise.id}
                  className="rounded-2xl border border-white/8 bg-slate-950/40 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex gap-4">
                      <img
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        className="h-24 w-24 rounded-2xl object-cover"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold capitalize text-emerald-200">
                            {exercise.muscleGroup}
                          </span>
                          {exercise.recommended ? (
                            <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[11px] font-semibold text-amber-100">
                              Recommended
                            </span>
                          ) : null}
                          {exercise.hidden ? (
                            <span className="rounded-full bg-rose-400/20 px-2.5 py-1 text-[11px] font-semibold text-rose-100">
                              Hidden
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-400">
                          {exercise.instructions}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 xl:w-[220px] xl:justify-items-end">
                      <ActionIconButton
                        label="Edit"
                        title="Edit"
                        icon={<Pencil className="h-4 w-4" />}
                        tone="sky"
                        onClick={() => handleEditExercise(exercise)}
                      />

                      <ActionIconButton
                        label={exercise.recommended ? "Unrecommend" : "Recommend"}
                        title={exercise.recommended ? "Unrecommend" : "Recommend"}
                        icon={<Sparkles className="h-4 w-4" />}
                        tone="amber"
                        onClick={() => handleToggleRecommended(exercise)}
                      />

                      <ActionIconButton
                        label={exercise.hidden ? "Show" : "Hide"}
                        title={exercise.hidden ? "Show" : "Hide"}
                        icon={exercise.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        tone="violet"
                        onClick={() => handleToggleHidden(exercise)}
                      />

                      <ActionIconButton
                        label="Delete"
                        title="Delete"
                        icon={<Trash2 className="h-4 w-4" />}
                        tone="rose"
                        onClick={() => handleDeleteExercise(exercise)}
                      />
                    </div>
                  </div>
                </article>
              ))}

              {filteredExercises.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-10 text-center text-slate-400">
                  No exercises match the current filters.
                </div>
              ) : null}
            </div>
          </section>

          <div className="space-y-6">
            <section className="reveal-up reveal-delay-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {form.id ? "Edit Exercise" : "Add Exercise"}
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
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">Category</span>
                  <select
                    value={form.muscleGroup}
                    onChange={(event) => setForm((prev) => ({ ...prev, muscleGroup: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-white/12 bg-slate-900 px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">Image / GIF URL</span>
                  <input
                    type="text"
                    value={form.gifUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, gifUrl: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-300">Instructions</span>
                  <textarea
                    value={form.instructions}
                    onChange={(event) => setForm((prev) => ({ ...prev, instructions: event.target.value }))}
                    rows={6}
                    className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-400"
                >
                  {form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {form.id ? "Save changes" : "Add exercise"}
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
                    <span className="capitalize">{category}</span>
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
    </main>
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
