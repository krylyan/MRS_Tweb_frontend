import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { exerciseService } from "../services/exerciseService";
import type { Exercise, MuscleGroup } from "../types/exercise";

const MUSCLE_GROUPS: Array<MuscleGroup | "all"> = [
  "all",
  "chest",
  "back",
  "legs",
  "arms",
  "core",
  "cardio",
];

export default function Exercises() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MuscleGroup | "all">("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const allResults = useMemo(
    () => exerciseService.searchExercises(searchQuery),
    [searchQuery],
  );

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? allResults
        : allResults.filter((e) => e.muscleGroup === activeFilter),
    [allResults, activeFilter],
  );

  // Close detail modal on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedExercise(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="reveal-up mb-6">
          <h1 className="text-4xl font-bold text-slate-50">Exercise Library</h1>
          <p className="mt-1 text-slate-400">
            Discover exercises with detailed instructions and guidance
          </p>
        </div>

        {/* Search */}
        <div className="reveal-up reveal-delay-1 mb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="h-12 w-full rounded-[14px] border border-white/12 bg-white/4 pl-12 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.18)]"
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className="reveal-up reveal-delay-2 mb-4 flex flex-wrap items-center gap-2">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setActiveFilter(group)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold capitalize transition-all ${
                activeFilter === group
                  ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
                  : "border-white/12 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-slate-100"
              }`}
            >
              {group === "all" ? "All" : group}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="reveal-up reveal-delay-2 mb-4 text-sm text-slate-400">
          {filtered.length} exercises found
        </p>

        {/* Grid */}
        <div className="reveal-up reveal-delay-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => setSelectedExercise(exercise)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/4 text-left shadow-[0_14px_28px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-xl hover:shadow-emerald-500/10"
            >
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-2 text-sm font-bold text-slate-50">
                  {exercise.name}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-emerald-300">
                    {exercise.muscleGroup}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-slate-400">No exercises match your search.</p>
          </div>
        )}
      </div>

      {/* Detail modal — portal */}
      {selectedExercise
        ? ReactDOM.createPortal(
            <ExerciseDetailModal
              exercise={selectedExercise}
              onClose={() => setSelectedExercise(null)}
            />,
            document.body,
          )
        : null}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Exercise detail modal                                              */
/* ------------------------------------------------------------------ */
interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
}

function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  const instructionLines = exercise.instructions
    .split(/\.\s+/)
    .filter((s) => s.trim().length > 0)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));

  return (
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

      {/* Panel */}
      <div className="modal-panel relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/12 bg-slate-900 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-slate-300 transition-all hover:bg-black/70 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-800">
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Scrollable content */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {/* Title */}
          <h2 className="mb-3 text-xl font-bold text-slate-50">
            {exercise.name}
          </h2>

          {/* Tags */}
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold capitalize text-emerald-300">
              {exercise.muscleGroup}
            </span>
          </div>

          {/* How to Perform */}
          <h3 className="mb-3 text-sm font-semibold text-slate-200">
            How to Perform
          </h3>
          <div className="mb-5 space-y-3">
            {instructionLines.map((line, index) => (
              <div key={index} className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-slate-300">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
