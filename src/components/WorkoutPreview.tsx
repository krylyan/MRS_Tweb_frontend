import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { Exercise } from "../types/exercise";

interface WorkoutPreviewProps {
  selectedExercise: Exercise | null;
}

export default function WorkoutPreview({ selectedExercise }: WorkoutPreviewProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const [hasSecondaryFrame, setHasSecondaryFrame] = useState(false);
  const [showSecondaryFrame, setShowSecondaryFrame] = useState(false);

  const primaryFrameUrl = selectedExercise?.gifUrl ?? "";
  const secondaryFrameUrl =
    selectedExercise?.gifUrl?.replace(/\/0\.jpg(?=($|\?))/, "/1.jpg") ?? "";

  useEffect(() => {
    setHasImageError(false);
    setShowSecondaryFrame(false);
  }, [selectedExercise?.id]);

  useEffect(() => {
    if (!selectedExercise) {
      setHasSecondaryFrame(false);
      return;
    }

    if (!/\/0\.jpg($|\?)/.test(primaryFrameUrl)) {
      setHasSecondaryFrame(false);
      return;
    }

    const probeImage = new Image();
    probeImage.onload = () => setHasSecondaryFrame(true);
    probeImage.onerror = () => setHasSecondaryFrame(false);
    probeImage.src = secondaryFrameUrl;
  }, [primaryFrameUrl, secondaryFrameUrl, selectedExercise]);

  useEffect(() => {
    if (!selectedExercise || !hasSecondaryFrame) {
      return;
    }

    const interval = window.setInterval(() => {
      setShowSecondaryFrame((prev) => !prev);
    }, 550);

    return () => window.clearInterval(interval);
  }, [hasSecondaryFrame, selectedExercise]);

  return (
    <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <h2 className="mb-3 text-lg font-semibold text-slate-50">Workout preview</h2>

      <div className="overflow-hidden rounded-[10px] border border-white/10 bg-slate-900/35">
        {selectedExercise ? (
          hasImageError ? (
            <div className="flex h-[250px] w-full items-center justify-center md:h-[280px]">
              <p className="text-sm font-medium text-slate-300">No preview available</p>
            </div>
          ) : (
            <img
              key={selectedExercise.id}
              src={showSecondaryFrame ? secondaryFrameUrl : primaryFrameUrl}
              alt={selectedExercise.name}
              className="h-[250px] w-full object-cover md:h-[280px]"
              loading="lazy"
              onError={() => setHasImageError(true)}
            />
          )
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
