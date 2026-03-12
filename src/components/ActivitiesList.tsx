import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

export default function ActivitiesList({
  dayExercises,
  selectedExerciseId,
  getIconForMuscleGroup,
  searchExercises,
  onAddExercise,
  onSelectExercise,
  onDeleteExercise,
}: ActivitiesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const results = useMemo(() => searchExercises(searchQuery).slice(0, 10), [searchExercises, searchQuery]);
  const addedIds = useMemo(() => new Set(dayExercises.map((exercise) => exercise.id)), [dayExercises]);
  const showDropdown = isDropdownOpen && searchQuery.trim().length > 0;

  return (
    <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <h2 className="mb-3 text-lg font-semibold text-slate-50">Activities</h2>

      <div ref={searchContainerRef} className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onFocus={() => setIsDropdownOpen(searchQuery.trim().length > 0)}
          onChange={(event) => {
            const next = event.target.value;
            setSearchQuery(next);
            setIsDropdownOpen(next.trim().length > 0);
          }}
          placeholder="Search exercises..."
          className="h-10 w-full rounded-[10px] border border-white/20 bg-white/[0.03] pl-10 pr-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.2)]"
        />

        {showDropdown ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 overflow-auto rounded-[10px] border border-white/12 bg-slate-900/95 p-1 shadow-[0_14px_28px_rgba(0,0,0,0.35)] backdrop-blur-[8px]">
            {results.length ? (
              results.map((exercise) => {
                const Icon = getIconForMuscleGroup(exercise.muscleGroup);
                const alreadyAdded = addedIds.has(exercise.id);

                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => {
                      onAddExercise(exercise);
                      onSelectExercise(exercise);
                    }}
                    className="flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-white/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-[8px] border border-white/10 bg-white/10 p-1.5 text-slate-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{exercise.name}</p>
                        <p className="text-xs capitalize text-slate-400">{exercise.muscleGroup}</p>
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
            No activities selected for this day yet.
          </p>
        )}
      </div>
    </section>
  );
}
