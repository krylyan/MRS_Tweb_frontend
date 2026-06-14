import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { hasMediaUrl } from "../utils/media";

interface ExerciseFrameCarouselProps {
  imageUrl: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  emptyMessage?: string;
}

const getFrameUrls = (url: string): string[] => {
  if (!hasMediaUrl(url)) return [];

  const secondFrame = url.replace(/\/0\.jpg(?=($|\?))/, "/1.jpg");
  return secondFrame === url ? [url] : [url, secondFrame];
};

export default function ExerciseFrameCarousel({
  imageUrl,
  alt,
  className = "",
  imageClassName = "object-cover",
  emptyMessage = "No exercise image available",
}: ExerciseFrameCarouselProps) {
  const candidateFrames = useMemo(() => getFrameUrls(imageUrl), [imageUrl]);
  const [availableFrames, setAvailableFrames] = useState<string[]>(candidateFrames.slice(0, 1));
  const [frameIndex, setFrameIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const [animationKey, setAnimationKey] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFrameIndex(0);
    setAnimationKey(0);
    setImageFailed(false);
    setAvailableFrames(candidateFrames.slice(0, 1));

    if (candidateFrames.length < 2) return;

    const probe = new Image();
    probe.onload = () => {
      if (!cancelled) setAvailableFrames(candidateFrames);
    };
    probe.onerror = () => {
      if (!cancelled) setAvailableFrames(candidateFrames.slice(0, 1));
    };
    probe.src = candidateFrames[1];

    return () => {
      cancelled = true;
    };
  }, [candidateFrames]);

  const changeFrame = (step: number) => {
    if (availableFrames.length < 2) return;
    setDirection(step > 0 ? "next" : "previous");
    setFrameIndex((current) => (current + step + availableFrames.length) % availableFrames.length);
    setAnimationKey((current) => current + 1);
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 ${className}`}>
      <style>{`
        @keyframes exerciseFrameNext {
          from { opacity: 0; transform: translateX(64px) scale(1.04) rotate(.8deg); filter: blur(3px); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes exerciseFramePrevious {
          from { opacity: 0; transform: translateX(-64px) scale(1.04) rotate(-.8deg); filter: blur(3px); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes exerciseDirectionSweepNext {
          from { opacity: .45; transform: translateX(-100%); }
          to { opacity: 0; transform: translateX(100%); }
        }
        @keyframes exerciseDirectionSweepPrevious {
          from { opacity: .45; transform: translateX(100%); }
          to { opacity: 0; transform: translateX(-100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .exercise-frame-animated { animation: none !important; }
        }
      `}</style>

      {availableFrames.length > 0 && !imageFailed ? (
        <>
          <img
            key={`${availableFrames[frameIndex]}-${animationKey}`}
            src={availableFrames[frameIndex]}
            alt={alt}
            className={`exercise-frame-animated h-full w-full ${imageClassName}`}
            style={{
              animation: `${direction === "next" ? "exerciseFrameNext" : "exerciseFramePrevious"} 430ms cubic-bezier(0.22, 1, 0.36, 1) both`,
            }}
            onError={() => setImageFailed(true)}
          />
          <span
            key={`sweep-${animationKey}`}
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/18 to-transparent"
            style={{
              animation: `${direction === "next" ? "exerciseDirectionSweepNext" : "exerciseDirectionSweepPrevious"} 430ms ease-out both`,
            }}
          />
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
          <Dumbbell className="h-14 w-14 text-emerald-300/30" />
          <p className="text-sm font-medium">{emptyMessage}</p>
        </div>
      )}

      {availableFrames.length > 1 && !imageFailed ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              changeFrame(-1);
            }}
            className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/65 text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-950/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            aria-label="Previous exercise image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              changeFrame(1);
            }}
            className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/65 text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-950/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            aria-label="Next exercise image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full border border-white/10 bg-slate-950/55 px-2.5 py-1.5 backdrop-blur-md">
            {availableFrames.map((frame, index) => (
              <span
                key={frame}
                className={`h-1.5 rounded-full transition-all ${
                  index === frameIndex ? "w-5 bg-emerald-300" : "w-1.5 bg-white/45"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
