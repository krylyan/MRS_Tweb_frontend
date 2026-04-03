import { Plus, Search, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import type { Exercise, MuscleGroup } from "../types/exercise";
import ActivityCard from "./ActivityCard";

interface ActivitiesListProps {
  dayExercises: Exercise[];
  selectedExerciseId: string | null;
  getIconForMuscleGroup: (muscleGroup: MuscleGroup) => LucideIcon;
  searchExercises: (query: string) => Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  onSelectExercise: (exercise: Exercise) => void;
  onDeleteExercise: (exerciseId: string) => void;
}

const MUSCLE_GROUPS: Array<MuscleGroup | "all"> = ["all", "chest", "back", "legs", "arms", "core", "cardio"];

export default function ActivitiesList({
  dayExercises,
  selectedExerciseId,
  getIconForMuscleGroup,
  searchExercises,
  onAddExercise,
  onSelectExercise,
  onDeleteExercise,
}: ActivitiesListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MuscleGroup | "all">("all");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
      setActiveFilter("all");
    }
  }, [isModalOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const allResults = useMemo(() => searchExercises(searchQuery), [searchExercises, searchQuery]);

  const filtered = useMemo(
    () => (activeFilter === "all" ? allResults : allResults.filter((e) => e.muscleGroup === activeFilter)),
    [allResults, activeFilter],
  );

  const addedIds = useMemo(() => new Set(dayExercises.map((e) => e.id)), [dayExercises]);

  return (
    <>
      <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-50">Activities</h2>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-sm font-semibold text-emerald-100 transition-all hover:bg-emerald-500/25"
          >
            <Plus className="h-4 w-4" />
            Add Exercise
          </button>
        </div>

        <div className="max-h-[620px] space-y-2.5 overflow-auto pr-1">
          {dayExercises.length ? (
            dayExercises.map((exercise) => (
              <ActivityCard
                key={exercise.id}
                exercise={exercise}
                icon={getIconForMuscleGroup(exercise.muscleGroup)}
                isSelected={selectedExerciseId === exercise.id}
                onSelect={onSelectExercise}
                onDelete={onDeleteExercise}
              />
            ))
          ) : (
            <p className="rounded-[10px] border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
              No activities yet. Press &ldquo;Add Exercise&rdquo; to get started.
            </p>
          )}
        </div>
      </section>

      {/* Exercise Library Modal — rendered via portal outside the grid */}
      {isModalOpen ? ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75" onClick={() => setIsModalOpen(false)} />

          {/* Modal panel */}
          <div className="relative z-10 flex w-full max-w-2xl flex-col rounded-2xl border border-white/12 bg-slate-900 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h3 className="text-xl font-bold text-slate-50">Exercise Library</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises..."
                  className="h-11 w-full rounded-[10px] border border-white/20 bg-white/[0.04] pl-10 pr-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.18)]"
                />
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 px-6 py-4">
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setActiveFilter(group)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all ${
                    activeFilter === group
                      ? "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400/40"
                      : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.10] hover:text-slate-100"
                  }`}
                >
                  {group === "all" ? "All" : group.charAt(0).toUpperCase() + group.slice(1)}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div className="max-h-[420px] overflow-y-auto px-6 pb-6">
              {filtered.length ? (
                <div className="space-y-2">
                  {filtered.map((exercise) => {
                    const Icon = getIconForMuscleGroup(exercise.muscleGroup);
                    const alreadyAdded = addedIds.has(exercise.id);
                    return (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => {
                          onAddExercise(exercise);
                          onSelectExercise(exercise);
                          setIsModalOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-[12px] border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition-all hover:border-emerald-400/30 hover:bg-emerald-500/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.06] text-slate-300">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-100">{exercise.name}</p>
                            <p className="text-xs capitalize text-slate-400">{exercise.muscleGroup}</p>
                          </div>
                        </div>
                        {alreadyAdded ? (
                          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                            Added
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-slate-400">No exercises found.</p>
              )}
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
