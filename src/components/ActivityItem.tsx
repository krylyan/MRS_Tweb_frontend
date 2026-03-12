import { Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Exercise } from "../data/exercises";

interface ActivityItemProps {
  exercise: Exercise;
  Icon: LucideIcon;
  onDelete: (exerciseId: number) => void;
}

export default function ActivityItem({ exercise, Icon, onDelete }: ActivityItemProps) {
  const detail = exercise.duration ?? `${exercise.defaultSets} sets`;

  return (
    <div className="flex items-center justify-between rounded-[10px] border border-white/10 bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.08]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-[8px] border border-white/10 bg-white/10 p-2 text-slate-200">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">{exercise.name}</p>
          <p className="text-xs text-slate-300">{detail}</p>
        </div>
      </div>

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

