import { ChevronRight, Heart, Plus } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkoutPlans } from "../utils/planStorage";

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export default function MyPlans() {
  const navigate = useNavigate();
  const plans = useMemo(() => getWorkoutPlans(), []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-8">
        <h1 className="reveal-up mb-4 text-3xl font-bold leading-tight text-slate-50 md:text-4xl">My Plans</h1>

        <section className="reveal-up mb-4 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px] md:p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              className="rounded-[14px] border border-emerald-300/40 bg-gradient-to-r from-emerald-500/30 via-emerald-400/14 to-cyan-400/18 p-[1px] shadow-[0_0_0_1px_rgba(52,211,153,0.14),0_16px_34px_rgba(16,185,129,0.2)]"
              aria-current="page"
            >
              <div className="rounded-[13px] bg-slate-900/78 px-6 py-5 text-center">
                <p className="text-2xl font-semibold text-emerald-50">Workout</p>
              </div>
            </button>

            <button
              type="button"
              className="rounded-[14px] border border-blue-400/22 bg-gradient-to-r from-blue-500/12 via-sky-400/8 to-emerald-400/10 p-[1px] transition-all hover:border-blue-300/30 hover:from-blue-500/16 hover:to-emerald-400/14"
            >
              <div className="rounded-[13px] bg-slate-900/88 px-6 py-5 text-center">
                <p className="text-2xl font-semibold text-slate-100">Alimentation</p>
              </div>
            </button>
          </div>
        </section>

        <section className="reveal-up reveal-delay-1 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-50">Saved workouts</h2>
            <span className="text-sm text-slate-400">{plans.length} plans</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan, index) => (
              <article
                key={plan.id}
                className={`reveal-up rounded-[16px] border p-4 shadow-[0_18px_36px_rgba(0,0,0,0.2)] backdrop-blur-[6px] ${
                  index % 3 === 0
                    ? "border-emerald-300/30 bg-gradient-to-br from-emerald-400/22 via-teal-400/12 to-slate-900/55"
                    : index % 3 === 1
                      ? "border-blue-300/30 bg-gradient-to-br from-blue-400/22 via-sky-400/12 to-slate-900/55"
                      : "border-cyan-300/24 bg-gradient-to-br from-cyan-400/20 via-white/10 to-slate-900/55"
                }`}
                >
                  <div className="flex h-full flex-col">
                    <div className="mb-6 flex h-40 items-start justify-between rounded-[12px] border border-white/12 bg-slate-950/28 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                          Workout
                        </p>
                        <h3 className="mt-2 max-w-full break-all text-[30px] font-semibold leading-tight text-slate-50">
                          {plan.name}
                        </h3>
                      </div>

                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-white/12 bg-white/[0.06] text-slate-100">
                        <Heart className="h-4.5 w-4.5" />
                      </div>
                  </div>

                  <div className="mb-5 space-y-2 text-sm text-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Days</span>
                      <span className="font-semibold text-slate-50">{plan.days.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Updated</span>
                      <span className="font-semibold text-slate-50">{formatDate(plan.updatedAt)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/gym-plan?planId=${plan.id}`)}
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/25 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-50 transition-all hover:bg-white/[0.12]"
                  >
                    Details
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}

            <button
              type="button"
              onClick={() => navigate("/gym-plan?new=1")}
              className="reveal-up reveal-delay-2 flex min-h-[304px] items-center justify-center rounded-[16px] border border-dashed border-white/25 bg-gradient-to-br from-white/[0.08] to-slate-900/50 p-4 text-slate-100 transition-all hover:border-emerald-300/40 hover:bg-gradient-to-br hover:from-emerald-400/18 hover:to-slate-900/55 hover:text-emerald-100"
            >
              <div className="flex flex-col items-center gap-4">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.06]">
                  <Plus className="h-8 w-8" />
                </span>
                <span className="text-lg font-semibold">Add workout</span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
