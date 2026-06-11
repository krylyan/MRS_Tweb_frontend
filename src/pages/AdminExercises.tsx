import { Dumbbell, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import ReactDOM from "react-dom";
import { exerciseService } from "../services/exerciseService";
import type { Exercise } from "../types/exercise";
import { MUSCLE_GROUPS } from "../types/exercise";
import { hasMediaUrl } from "../utils/media";

interface ExerciseFormState {
  id: number | null;
  name: string;
  muscleGroup: string;
  gifUrl: string;
  instructions: string;
  metValue: string;
}

const createEmptyForm = (): ExerciseFormState => ({
  id: null,
  name: "",
  muscleGroup: "",
  gifUrl: "",
  instructions: "",
  metValue: "5",
});

export default function AdminExercises() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");
  const [form, setForm] = useState<ExerciseFormState>(createEmptyForm);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

  useEffect(() => {
    exerciseService.getAllExercises().then((data) => {
      setExercises(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const id = window.setTimeout(() => setStatusMessage(""), 3200);
    return () => window.clearTimeout(id);
  }, [statusMessage]);

  useEffect(() => {
    if (!exerciseToDelete) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExerciseToDelete(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [exerciseToDelete]);

  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return exercises.filter((ex) => {
      const matchesFilter = activeFilter === "all" || ex.muscleGroup === activeFilter;
      const matchesQuery = !q || ex.name.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, exercises, searchQuery]);

  const refreshExercises = async () => {
    const data = await exerciseService.getAllExercises();
    setExercises(data);
  };

  const setResultMessage = (ok: boolean, successMsg: string, errorMsg?: string) => {
    setStatusTone(ok ? "success" : "error");
    setStatusMessage(ok ? successMsg : errorMsg ?? "Action failed.");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.muscleGroup || !form.instructions) {
      setResultMessage(false, "", "All fields are required.");
      return;
    }
    setSubmitting(true);
    const payload = {
      name: form.name,
      muscleGroup: form.muscleGroup,
      gifUrl: form.gifUrl,
      instructions: form.instructions,
      metValue: Math.min(20, Math.max(1, Number(form.metValue) || 5)),
    };
    const result = form.id
      ? await exerciseService.updateExercise(form.id, payload)
      : await exerciseService.createExercise(payload);
    setResultMessage(
      result.ok,
      form.id ? "Exercise updated successfully." : "Exercise added successfully.",
      result.ok ? undefined : result.message,
    );
    if (result.ok) {
      setForm(createEmptyForm());
      setExercises((prev) => {
        const withoutSavedExercise = prev.filter((exercise) => exercise.id !== result.exercise.id);
        return [result.exercise, ...withoutSavedExercise];
      });
      await refreshExercises();
    }
    setSubmitting(false);
  };

  const handleEdit = (exercise: Exercise) => {
    setForm({
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      gifUrl: exercise.gifUrl,
      instructions: exercise.instructions,
      metValue: String(exercise.metValue || 5),
    });
    setStatusMessage("");
  };

  const handleConfirmDelete = async (exercise: Exercise) => {
    const result = await exerciseService.deleteExercise(exercise.id);
    setResultMessage(result.ok, `${exercise.name} deleted.`, result.message);
    if (result.ok) {
      await refreshExercises();
    }
    setExerciseToDelete(null);
  };

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1450px] px-4 py-6 sm:px-6 sm:py-8">
        <section className="reveal-up mb-6 rounded-3xl border border-amber-400/25 bg-amber-500/15 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                <Dumbbell className="h-3.5 w-3.5" />
                Admin Exercise Library
              </div>
              <h1 className="text-4xl font-bold text-white">Manage Exercises</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Add, edit, and remove exercises from the shared database catalog.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              <AdminStatCard label="Total Exercises" value={exercises.length.toString()} />
              <AdminStatCard label="Categories" value={MUSCLE_GROUPS.length.toString()} />
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                {MUSCLE_GROUPS.map((mg) => (
                  <button
                    key={mg}
                    type="button"
                    onClick={() => setActiveFilter(mg)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      activeFilter === mg
                        ? "bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40"
                        : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white"
                    }`}
                  >
                    {mg}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="py-10 text-center text-slate-400 animate-pulse">
                Loading exercises...
              </div>
            )}

            {!loading && (
              <div className="space-y-3">
                {filteredExercises.map((exercise) => (
                  <article
                    key={exercise.id}
                    className="rounded-2xl border border-white/8 bg-slate-950/40 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
                  >
                    <div className="grid gap-4 xl:grid-cols-[96px_minmax(0,1fr)_80px] xl:items-center">
                      <div className="xl:col-start-1">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-slate-800">
                          {hasMediaUrl(exercise.gifUrl) ? (
                            <img
                              src={exercise.gifUrl}
                              alt={exercise.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Dumbbell className="h-9 w-9 text-amber-300/35" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 xl:col-start-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold capitalize text-emerald-200">
                            {exercise.muscleGroup}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-400">
                          {exercise.instructions}
                        </p>
                      </div>

                      <div className="flex gap-2 xl:col-start-3 xl:justify-self-end">
                        <ActionIconButton
                          label="Edit"
                          title="Edit"
                          icon={<Pencil className="h-4 w-4" />}
                          tone="amber"
                          onClick={() => handleEdit(exercise)}
                        />
                        <ActionIconButton
                          label="Delete"
                          title="Delete"
                          icon={<Trash2 className="h-4 w-4" />}
                          tone="rose"
                          onClick={() => setExerciseToDelete(exercise)}
                        />
                      </div>
                    </div>
                  </article>
                ))}

                {filteredExercises.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-10 text-center text-slate-400">
                    No exercises match the current filters.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="reveal-up reveal-delay-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{form.id ? "Edit Exercise" : "Add Exercise"}</h2>
              {form.id ? (
                <button
                  type="button"
                  onClick={() => setForm(createEmptyForm())}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-slate-300 transition-colors hover:bg-white/[0.1] hover:text-white"
                  aria-label="Cancel edit"
                  title="Cancel edit"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">Muscle Group</span>
                <select
                  value={form.muscleGroup}
                  onChange={(e) => setForm((p) => ({ ...p, muscleGroup: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-white/12 bg-slate-900 px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                >
                  <option value="">Select a muscle group</option>
                  {MUSCLE_GROUPS.map((mg) => (
                    <option key={mg} value={mg}>
                      {mg}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">Image / GIF URL</span>
                <input
                  type="text"
                  value={form.gifUrl}
                  onChange={(e) => setForm((p) => ({ ...p, gifUrl: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">Instructions</span>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))}
                  rows={6}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">MET intensity</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="0.1"
                  value={form.metValue}
                  onChange={(e) => setForm((p) => ({ ...p, metValue: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 text-sm text-white outline-none transition-all focus:border-amber-400/50"
                />
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  Used to estimate calories burned from body weight and workout duration.
                </p>
              </label>

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
                    <Plus className="h-4 w-4" />
                    {form.id ? "Save exercise" : "Add exercise"}
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

      {exerciseToDelete
        ? ReactDOM.createPortal(
            <DeleteModal
              itemName={exerciseToDelete.name}
              onCancel={() => setExerciseToDelete(null)}
              onConfirm={() => handleConfirmDelete(exerciseToDelete)}
            />,
            document.body,
          )
        : null}
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
  tone = "rose",
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  title: string;
  tone?: "rose" | "amber";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-400/25 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20"
      : "border-rose-400/25 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20";
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={title}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${toneClass}`}
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
          <h2 className="mx-auto max-w-[290px] text-[20px] font-bold leading-[1.2] text-slate-50 sm:text-[22px]">
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
