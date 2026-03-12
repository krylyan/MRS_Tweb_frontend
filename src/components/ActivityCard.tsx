import { Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Exercise } from "../types/exercise";

interface ActivityCardProps {
  exercise: Exercise;
  icon: LucideIcon;
  isSelected: boolean;
  onSelect: (exercise: Exercise) => void;
  onDelete: (exerciseId: string) => void;
}

export default function ActivityCard({
  exercise,
  icon: Icon,
  isSelected,
  onSelect,
  onDelete,
}: ActivityCardProps) {
  const detail = exercise.targetMuscle ?? exercise.muscleGroup;

  return (
    <div
      className={`flex items-center justify-between rounded-[10px] border px-3 py-2.5 transition-all ${
        isSelected
          ? "border-emerald-400/40 bg-emerald-500/15 shadow-[0_0_16px_rgba(16,185,129,0.15)]"
          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.08]"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(exercise)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="rounded-[8px] border border-white/10 bg-white/10 p-2 text-slate-200">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">{exercise.name}</p>
          <p className="text-xs capitalize text-slate-300">
            {exercise.muscleGroup} | {detail}
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onDelete(exercise.id)}
        className="ml-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[8px] text-slate-300 transition-all hover:bg-rose-500/15 hover:text-rose-300"
        aria-label={`Delete ${exercise.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
