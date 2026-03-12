import { useEffect, useMemo, useState } from "react";
import type { Exercise } from "../types/exercise";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface WorkoutPreviewProps {
  selectedExercise: Exercise | null;
}

export default function WorkoutPreview({ selectedExercise }: WorkoutPreviewProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  const previewFrames = useMemo<string[]>(() => {
    if (!selectedExercise) {
      return [];
    }

    if (selectedExercise.previewFrames?.length) {
      return selectedExercise.previewFrames;
    }

    return [selectedExercise.gifUrl];
  }, [selectedExercise]);

  useEffect(() => {
    setFrameIndex(0);
  }, [selectedExercise?.id]);

  useEffect(() => {
    if (previewFrames.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setFrameIndex((previous) => (previous + 1) % previewFrames.length);
    }, 900);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [previewFrames]);

  const previewSource = previewFrames[frameIndex] ?? selectedExercise?.gifUrl;

  return (
    <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <h2 className="mb-3 text-lg font-semibold text-slate-50">Workout preview</h2>

      <div className="overflow-hidden rounded-[10px] border border-white/10 bg-slate-900/35">
        {selectedExercise && previewSource ? (
          <img
            key={`${selectedExercise.id}-${frameIndex}`}
            src={previewSource}
            alt={selectedExercise.name}
            className="h-[250px] w-full object-cover md:h-[280px]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Workout preview"
            className="h-[250px] w-full object-cover md:h-[280px]"
          />
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
