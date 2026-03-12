import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { Exercise, ExerciseType } from "../data/exercises";

interface ExerciseSearchProps {
  exercises: Exercise[];
  addedExerciseIds: number[];
  getIconForType: (type: ExerciseType) => LucideIcon;
  onSelectExercise: (exercise: Exercise) => void;
}

export default function ExerciseSearch({
  exercises,
  addedExerciseIds,
  getIconForType,
  onSelectExercise,
}: ExerciseSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return exercises.filter((exercise) => exercise.name.toLowerCase().includes(normalized)).slice(0, 10);
  }, [exercises, query]);

  const showDropdown = query.trim().length > 0;

  return (
    <div className="relative mb-3">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search exercises..."
        className="h-10 w-full rounded-[10px] border border-white/20 bg-white/[0.03] pl-10 pr-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.2)]"
      />

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 overflow-auto rounded-[10px] border border-white/12 bg-slate-900/95 p-1 shadow-[0_14px_28px_rgba(0,0,0,0.35)] backdrop-blur-[8px]">
          {results.length ? (
            results.map((exercise) => {
              const Icon = getIconForType(exercise.type);
              const alreadyAdded = addedExerciseIds.includes(exercise.id);

              return (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => onSelectExercise(exercise)}
                  className="flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-[8px] border border-white/10 bg-white/10 p-1.5 text-slate-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{exercise.name}</p>
                      <p className="text-xs capitalize text-slate-400">{exercise.type}</p>
                    </div>
                  </div>
                  {alreadyAdded ? <span className="text-[11px] font-semibold text-emerald-300">Added</span> : null}
                </button>
              );
            })
          ) : (
            <p className="px-2.5 py-2 text-sm text-slate-300">No matching exercises.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

