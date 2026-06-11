import { Plus } from "lucide-react";
import type { Exercise } from "../types/exercise";
import ExerciseFrameCarousel from "./ExerciseFrameCarousel";

interface WorkoutPreviewProps {
  selectedExercise: Exercise | null;
}

export default function WorkoutPreview({ selectedExercise }: WorkoutPreviewProps) {
  return (
    <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <h2 className="mb-3 text-lg font-semibold text-slate-50">Workout preview</h2>

      <div className="overflow-hidden rounded-[10px] border border-white/10 bg-slate-900/35">
        {selectedExercise ? (
          <ExerciseFrameCarousel
            imageUrl={selectedExercise.gifUrl}
            alt={selectedExercise.name}
            className="h-[250px] w-full md:h-[280px]"
            imageClassName="object-cover"
            emptyMessage="No preview available"
          />
        ) : (
          <div className="flex h-[250px] w-full items-center justify-center bg-slate-950/35 md:h-[280px]">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-semibold text-slate-100">No exercise selected</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Plus className="h-3.5 w-3.5" />
                Add an exercise to show its preview
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">Instructions</p>
        <p className="mt-1 text-sm text-slate-100">
          {selectedExercise?.instructions ?? "Select an exercise from Activities to preview movement and instructions."}
        </p>
      </div>
    </section>
  );
}
