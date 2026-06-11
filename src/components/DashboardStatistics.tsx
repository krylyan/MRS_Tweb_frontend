import { Activity, Beef, Flame, Scale } from "lucide-react";
import { useMemo, useState } from "react";

export interface EnergyChartPoint {
  date: string;
  label: string;
  consumed: number;
  burned: number;
}

export interface WeightChartPoint {
  date: string;
  label: string;
  weight: number;
}

export interface MacroChartData {
  protein: number;
  carbs: number;
  fats: number;
}

interface DashboardStatisticsProps {
  energy: EnergyChartPoint[];
  weight: WeightChartPoint[];
  macros: MacroChartData;
  macroGoal: MacroChartData;
}

type ChartType = "energy" | "macros" | "weight";

const chartOptions: Array<{
  id: ChartType;
  label: string;
  title: string;
  icon: typeof Activity;
}> = [
  { id: "energy", label: "Calories", title: "Calories consumed vs burned", icon: Flame },
  { id: "macros", label: "Macros", title: "Macronutrient distribution", icon: Beef },
  { id: "weight", label: "Weight", title: "Weight over time", icon: Scale },
];

const WIDTH = 900;
const HEIGHT = 280;
const PAD = { top: 28, right: 28, bottom: 48, left: 62 };

function buildLinePath(points: Array<{ x: number; y: number }>): string {
  if (!points.length) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    const previous = points[index - 1];
    const middleX = (previous.x + point.x) / 2;
    return `${path} C${middleX.toFixed(1)},${previous.y.toFixed(1)} ${middleX.toFixed(1)},${point.y.toFixed(1)} ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }, "");
}

function LineChart({
  labels,
  series,
  unit,
  emptyMessage,
}: {
  labels: string[];
  series: Array<{ id: string; label: string; color: string; values: number[] }>;
  unit: string;
  emptyMessage: string;
}) {
  const allValues = series.flatMap((item) => item.values).filter((value) => Number.isFinite(value));
  const hasData = allValues.length > 0 && allValues.some((value) => value > 0);
  const minValue = hasData ? Math.min(...allValues) : 0;
  const maxValue = hasData ? Math.max(...allValues) : 1;
  const valueRange = Math.max(1, maxValue - minValue);
  const chartMin = Math.max(0, minValue - valueRange * 0.18);
  const chartMax = maxValue + valueRange * 0.18;
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const xFor = (index: number) =>
    PAD.left + (labels.length <= 1 ? innerWidth / 2 : (index / (labels.length - 1)) * innerWidth);
  const yFor = (value: number) =>
    PAD.top + innerHeight - ((value - chartMin) / Math.max(1, chartMax - chartMin)) * innerHeight;

  if (!hasData) {
    return (
      <div className="flex h-[280px] items-center justify-center px-6 text-center text-sm text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  const gridValues = Array.from({ length: 5 }, (_, index) =>
    chartMin + ((chartMax - chartMin) * index) / 4,
  ).reverse();

  return (
    <div className="overflow-x-auto px-2 pb-2">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="min-w-[680px] w-full" role="img">
        <defs>
          {series.map((item) => (
            <filter key={item.id} id={`glow-${item.id}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {gridValues.map((value) => {
          const y = yFor(value);
          return (
            <g key={value}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.07)"
              />
              <text x={PAD.left - 12} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">
                {Math.round(value)}{unit}
              </text>
            </g>
          );
        })}

        {labels.map((label, index) => (
          <text
            key={`${label}-${index}`}
            x={xFor(index)}
            y={HEIGHT - 14}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#64748b"
          >
            {label}
          </text>
        ))}

        {series.map((item) => {
          const points = item.values.map((value, index) => ({ x: xFor(index), y: yFor(value) }));
          return (
            <g key={item.id}>
              <path
                d={buildLinePath(points)}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinecap="round"
                filter={`url(#glow-${item.id})`}
                className="dashboard-line"
              />
              {points.map((point, index) => (
                <g key={`${item.id}-${index}`}>
                  <circle cx={point.x} cy={point.y} r="5" fill="#0f172a" stroke={item.color} strokeWidth="2.5" />
                  <title>{`${labels[index]}: ${item.values[index].toFixed(1)}${unit}`}</title>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MacroPieChart({ macros, goal }: { macros: MacroChartData; goal: MacroChartData }) {
  const [hoveredMacro, setHoveredMacro] = useState<string | null>(null);
  const items = [
    { label: "Protein", value: macros.protein, color: "#34d399" },
    { label: "Carbohydrates", value: macros.carbs, color: "#22d3ee" },
    { label: "Fats", value: macros.fats, color: "#fb923c" },
  ];
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (total <= 0) {
    return (
      <div className="flex h-[280px] items-center justify-center px-6 text-center text-sm text-slate-400">
        Add foods to the active meal plan to see the macronutrient distribution.
      </div>
    );
  }

  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="grid min-h-[320px] items-center gap-8 px-6 py-7 lg:grid-cols-[minmax(240px,0.72fr)_minmax(440px,1.28fr)]">
      <div className="relative mx-auto h-60 w-60">
        <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90 overflow-visible drop-shadow-[0_0_24px_rgba(34,211,238,0.12)]">
          <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(15,23,42,0.88)" strokeWidth="28" />
          {items.map((item) => {
            const fraction = item.value / total;
            const segmentLength = circumference * fraction;
            const offset = -circumference * cumulative;
            cumulative += fraction;
            const isHovered = hoveredMacro === item.label;
            return (
              <circle
                key={item.label}
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={isHovered ? 34 : 28}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                className="macro-segment cursor-pointer transition-[stroke-width,filter] duration-200"
                style={{
                  filter: isHovered ? `drop-shadow(0 0 8px ${item.color})` : undefined,
                  ["--segment-length" as string]: segmentLength,
                }}
                onMouseEnter={() => setHoveredMacro(item.label)}
                onMouseLeave={() => setHoveredMacro(null)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-[54px] flex flex-col items-center justify-center rounded-full border border-white/10 bg-slate-900/95 text-center shadow-inner">
          {hoveredMacro ? (() => {
            const item = items.find((candidate) => candidate.label === hoveredMacro)!;
            return (
              <>
                <span className="text-sm font-bold text-white">{item.label}</span>
                <span className="mt-1 text-lg font-extrabold" style={{ color: item.color }}>{item.value.toFixed(1)}g</span>
                <span className="text-xs text-slate-500">{Math.round((item.value / total) * 100)}%</span>
              </>
            );
          })() : (
            <>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Daily</span>
              <span className="mt-1 text-base font-bold text-white">macro split</span>
            </>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30">
        <div className="grid grid-cols-[1fr_96px_96px] border-b border-white/8 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          <span>Macronutrient</span>
          <span className="text-right">Current plan</span>
          <span className="text-right">Goal</span>
        </div>
        {items.map((item) => {
          const goalValue =
            item.label === "Protein" ? goal.protein :
            item.label === "Carbohydrates" ? goal.carbs :
            goal.fats;
          const progress = goalValue > 0 ? Math.min(1, item.value / goalValue) : 0;
          return (
            <div key={item.label} className="border-b border-white/[0.06] px-4 py-4 last:border-b-0">
              <div className="grid grid-cols-[1fr_96px_96px] items-center">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="text-right text-sm font-bold text-white">{item.value.toFixed(1)}g</span>
                <span className="text-right text-sm font-semibold text-slate-400">{Math.round(goalValue)}g</span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-950/80">
                <div
                  className="macro-progress h-full rounded-full"
                  style={{ width: `${progress * 100}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardStatistics({ energy, weight, macros, macroGoal }: DashboardStatisticsProps) {
  const [activeChart, setActiveChart] = useState<ChartType>("energy");
  const activeOption = chartOptions.find((option) => option.id === activeChart) ?? chartOptions[0];
  const ActiveIcon = activeOption.icon;

  const weightSeries = useMemo(
    () => [{ id: "weight", label: "Weight", color: "#38bdf8", values: weight.map((item) => item.weight) }],
    [weight],
  );
  const energySeries = useMemo(
    () => [
      { id: "consumed", label: "Calories consumed", color: "#fb923c", values: energy.map((item) => item.consumed) },
      { id: "burned", label: "Calories burned", color: "#22d3ee", values: energy.map((item) => item.burned) },
    ],
    [energy],
  );

  return (
    <section className="reveal-up mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-sm">
      <style>{`
        @keyframes dashboardLineIn {
          from { stroke-dasharray: 1200; stroke-dashoffset: 1200; opacity: 0; }
          to { stroke-dasharray: 1200; stroke-dashoffset: 0; opacity: 1; }
        }
        .dashboard-line { animation: dashboardLineIn 1s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .dashboard-line, .macro-segment, .macro-progress { animation: none !important; }
        }
        @keyframes macroDraw { from { stroke-dasharray: 0 999; opacity: .25; } to { opacity: 1; } }
        @keyframes macroGrow { from { width: 0; } }
        .macro-segment { animation: macroDraw .8s cubic-bezier(0.22,1,0.36,1) both; }
        .macro-progress { animation: macroGrow .75s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="flex flex-col gap-4 border-b border-white/[0.07] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300">
            <ActiveIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Statistics</p>
            <h2 className="mt-0.5 text-lg font-bold text-white">{activeOption.title}</h2>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-slate-950/45 p-1">
          {chartOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setActiveChart(option.id)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                activeChart === option.id
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {activeChart === "energy" ? (
        <>
          <div className="flex flex-wrap gap-5 px-6 pt-5">
            {energySeries.map((item) => (
              <span key={item.id} className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
          <LineChart
            labels={energy.map((item) => item.label)}
            series={energySeries}
            unit=" kcal"
            emptyMessage="Complete meal and workout days to build your energy balance chart."
          />
        </>
      ) : null}

      {activeChart === "macros" ? <MacroPieChart macros={macros} goal={macroGoal} /> : null}

      {activeChart === "weight" ? (
        <LineChart
          labels={weight.map((item) => item.label)}
          series={weightSeries}
          unit=" kg"
          emptyMessage="Update your weight in Profile to start tracking progress."
        />
      ) : null}
    </section>
  );
}
