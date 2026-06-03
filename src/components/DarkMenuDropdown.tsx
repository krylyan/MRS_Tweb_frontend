import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface DarkMenuOption<T extends string> {
  value: T;
  label: string;
}

interface DarkMenuDropdownProps<T extends string> {
  value: T;
  options: Array<DarkMenuOption<T>>;
  onChange: (value: T) => void;
  icon?: LucideIcon;
  accent?: "emerald" | "amber";
  className?: string;
}

export function DarkMenuDropdown<T extends string>({
  value,
  options,
  onChange,
  icon: Icon,
  accent = "emerald",
  className = "",
}: DarkMenuDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];
  const activeText = accent === "amber" ? "text-amber-100" : "text-emerald-100";
  const activeBg = accent === "amber" ? "bg-amber-400/12" : "bg-emerald-500/12";
  const activeRing = accent === "amber" ? "ring-amber-300/30" : "ring-emerald-400/30";

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative ${open ? "z-[120]" : "z-10"} ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between gap-3 rounded-[14px] border border-white/12 bg-white/[0.04] px-4 text-sm font-semibold text-slate-100 outline-none transition-all hover:bg-white/[0.07] focus:border-emerald-500/60"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-slate-400" /> : null}
          <span className="truncate">{selected.label}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-[9999] w-full min-w-[190px] overflow-hidden rounded-2xl border border-white/12 bg-slate-950/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-all ${
                  isActive
                    ? `${activeBg} ${activeText} ring-1 ${activeRing}`
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  {isActive ? <Check className="h-4 w-4" /> : null}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
