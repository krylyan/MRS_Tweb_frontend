import { Dumbbell, Pencil, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { DarkMenuDropdown } from "../components/DarkMenuDropdown";
import { exerciseService } from "../services/exerciseService";
import type { Exercise, MuscleGroup } from "../types/exercise";
import { MUSCLE_GROUPS } from "../types/exercise";
import AuthUtils from "../utils/authUtils";
import { hasMediaUrl } from "../utils/media";

const getSecondExerciseFrameUrl = (url: string): string =>
  url.replace(/\/0\.jpg(?=($|\?))/, "/1.jpg");

type ExerciseFilter = "all" | MuscleGroup;

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ExerciseFilter>("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const currentUser = AuthUtils.getCurrentUser();
  const isAdminMode = AuthUtils.isAdminModeEnabled();
  const canEditLibrary = isAdminMode && currentUser?.role === "Admin";

  useEffect(() => {
    exerciseService
      .getAllExercises()
      .then((data) => {
        setExercises(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load exercises. Is the backend running?");
        setLoading(false);
      });
  }, []);

  const muscleGroupOptions = useMemo(
    () => [
      { value: "all" as const, label: "All" },
      ...MUSCLE_GROUPS.map((group) => ({ value: group, label: group })),
    ],
    [],
  );

  const filtered = useMemo(() => {
    let result = exercises;
    if (activeFilter !== "all") {
      result = result.filter((e) => e.muscleGroup === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }
    return result;
  }, [exercises, activeFilter, searchQuery]);

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
        <div className="reveal-up mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-50">Exercise Library</h1>
            <p className="mt-1 text-slate-400">
              Discover exercises with detailed instructions and guidance
            </p>
          </div>
          {canEditLibrary ? (
            <Link
              to="/admin/exercises"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/25 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-100 transition-all hover:bg-amber-400/20 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          ) : null}
        </div>

        {/* Search and filter */}
        <div className="reveal-up reveal-delay-1 relative z-40 mb-4 grid gap-3 lg:grid-cols-[1fr_220px]">
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

          <DarkMenuDropdown
            value={activeFilter}
            options={muscleGroupOptions}
            onChange={setActiveFilter}
            icon={Dumbbell}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-slate-400 animate-pulse">
            Loading exercises...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="py-16 text-center text-rose-400">{error}</div>
        )}

        {/* Count */}
        {!loading && !error && (
          <p className="reveal-up reveal-delay-2 mb-4 text-sm text-slate-400">
            {filtered.length} exercises found
          </p>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="reveal-up reveal-delay-3 relative z-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => setSelectedExercise(exercise)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/4 text-left shadow-[0_14px_28px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                  {hasMediaUrl(exercise.gifUrl) ? (
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <Dumbbell className="h-14 w-14 text-emerald-300/25 transition-transform duration-300 group-hover:scale-110" />
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-slate-300 backdrop-blur-sm">
                    Click for details
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-2 text-sm font-bold text-slate-50">{exercise.name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-emerald-300">
                      {exercise.muscleGroup}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-slate-400">No exercises match your search.</p>
          </div>
        )}
      </div>

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

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
}

function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  const [gifFailed, setGifFailed] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const frameUrls = useMemo(() => {
    if (!hasMediaUrl(exercise.gifUrl)) return [];
    const secondFrame = getSecondExerciseFrameUrl(exercise.gifUrl);
    return secondFrame === exercise.gifUrl ? [exercise.gifUrl] : [exercise.gifUrl, secondFrame];
  }, [exercise.gifUrl]);
  const instructionLines = exercise.instructions
    .split(/\.\s+/)
    .filter((s) => s.trim().length > 0)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));

  useEffect(() => {
    setGifFailed(false);
    setFrameIndex(0);
  }, [exercise.id]);

  useEffect(() => {
    if (frameUrls.length < 2 || gifFailed) return;
    const intervalId = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frameUrls.length);
    }, 650);

    return () => window.clearInterval(intervalId);
  }, [frameUrls.length, gifFailed]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-backdrop absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="modal-panel relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/12 bg-slate-900 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-slate-300 transition-all hover:bg-black/70 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative flex h-56 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950">
          {frameUrls.length > 0 && !gifFailed ? (
            <img
              src={frameUrls[frameIndex]}
              alt={exercise.name}
              className="h-full w-full object-cover"
              onError={() => setGifFailed(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Dumbbell className="h-14 w-14 text-emerald-300/30" />
              <p className="text-sm font-medium">No exercise GIF added yet</p>
            </div>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <h2 className="mb-3 text-xl font-bold text-slate-50">{exercise.name}</h2>
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold capitalize text-emerald-300">
              {exercise.muscleGroup}
            </span>
          </div>
          <h3 className="mb-3 text-sm font-semibold text-slate-200">How to Perform</h3>
          <div className="mb-5 space-y-3">
            {instructionLines.map((line, index) => (
              <div key={index} className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-slate-300">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
