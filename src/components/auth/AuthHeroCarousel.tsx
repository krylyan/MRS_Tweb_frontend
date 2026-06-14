import { useState } from "react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1400&q=80",
    alt: "Healthy fitness and nutrition lifestyle",
    headline: "Build strength, fuel results",
  },
  {
    image: "/images/auth/strength-training.png",
    alt: "Athlete performing a barbell squat",
    headline: "Train with purpose, grow with every rep",
  },
  {
    image: "/images/auth/functional-training.png",
    alt: "Athlete training with battle ropes",
    headline: "Move stronger, become unstoppable",
  },
];

export default function AuthHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [animationKey, setAnimationKey] = useState(0);
  const activeSlide = slides[activeIndex];

  const move = (step: number) => {
    setDirection(step > 0 ? "right" : "left");
    setActiveIndex((current) => (current + step + slides.length) % slides.length);
    setAnimationKey((current) => current + 1);
  };

  return (
    <section className="relative hidden min-h-[620px] overflow-hidden rounded-[14px] border border-white/10 bg-slate-900 lg:block">
      <style>{`
        @keyframes authSlideFromRight {
          from { opacity: 0; transform: translateX(72px) scale(1.035); filter: blur(4px); }
          to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
        }
        @keyframes authSlideFromLeft {
          from { opacity: 0; transform: translateX(-72px) scale(1.035); filter: blur(4px); }
          to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
        }
        @keyframes authCopyIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .auth-slide-image, .auth-slide-copy { animation: none !important; }
        }
      `}</style>

      <img
        key={`${activeSlide.image}-${animationKey}`}
        src={activeSlide.image}
        alt={activeSlide.alt}
        className="auth-slide-image h-full w-full object-cover"
        style={{
          animation: `${direction === "right" ? "authSlideFromRight" : "authSlideFromLeft"} 520ms cubic-bezier(.22,1,.36,1) both`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(37,99,235,0.16)_0%,rgba(15,23,42,0.18)_36%,rgba(15,23,42,0.88)_100%)]" />

      <button
        type="button"
        onClick={() => move(-1)}
        className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-w-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/70"
        aria-label="Previous promotional image"
      />
      <button
        type="button"
        onClick={() => move(1)}
        className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-e-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/70"
        aria-label="Next promotional image"
      />

      <div className="pointer-events-none absolute left-[18px] top-[18px] z-20 text-[32px] font-bold leading-none tracking-[0.4px] text-white">
        FitLife
      </div>
      <div
        key={`copy-${animationKey}`}
        className="auth-slide-copy pointer-events-none absolute bottom-[72px] left-[22px] right-[22px] z-20 text-[44px] font-medium leading-[1.06] text-white"
        style={{ animation: "authCopyIn 420ms 100ms cubic-bezier(.22,1,.36,1) both" }}
      >
        {activeSlide.headline}
      </div>
      <div className="absolute bottom-6 left-[22px] z-20 flex gap-[10px]">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (index === activeIndex) return;
              setDirection(index > activeIndex ? "right" : "left");
              setActiveIndex(index);
              setAnimationKey((current) => current + 1);
            }}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-9 bg-emerald-400" : "w-7 bg-white/45 hover:bg-white/70"
            }`}
            aria-label={`Show promotional image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
