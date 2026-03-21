import { CalendarDays, ChevronRight, Dumbbell, Heart, Plus } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
        <header className="reveal-up mb-4 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px] md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-300">Workout library</p>
              <h1 className="text-3xl font-bold leading-tight text-slate-50 md:text-4xl">My Plans</h1>
              <p className="mt-1 text-sm text-slate-300">
                Open an existing workout or start a new draft from scratch.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/home"
                className="rounded-[10px] border border-white/25 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/14"
              >
                Back to Home
              </Link>
              <button
                type="button"
                onClick={() => navigate("/gym-plan?new=1")}
                className="inline-flex items-center gap-2 rounded-[10px] border-0 bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-blue-600"
              >
                <Plus className="h-4 w-4" />
                New workout
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[78px_minmax(0,1fr)]">
          <aside className="reveal-up hidden rounded-[14px] border border-white/12 bg-white/4 p-2.5 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px] xl:flex xl:flex-col xl:justify-between">
            <div className="space-y-2">
              <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-emerald-400/40 bg-emerald-500/20 text-emerald-200">
                <Dumbbell className="h-4.5 w-4.5" />
              </div>
              <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.03] text-slate-300">
                <CalendarDays className="h-4.5 w-4.5" />
              </div>
            </div>
            <Link
              to="/home"
              className="mx-auto inline-flex rounded-[10px] border border-white/20 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-white/14"
            >
              Home
            </Link>
          </aside>

          <section className="reveal-up reveal-delay-1 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-50">Saved workouts</h2>
              <span className="text-sm text-slate-400">{plans.length} plans</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan, index) => (
                <article
                  key={plan.id}
                  className={`reveal-up rounded-[14px] border p-4 shadow-[0_14px_28px_rgba(0,0,0,0.18)] backdrop-blur-[6px] ${
                    index % 3 === 0
                      ? "border-emerald-400/20 bg-gradient-to-br from-emerald-500/12 to-slate-900/45"
                      : index % 3 === 1
                        ? "border-blue-400/20 bg-gradient-to-br from-blue-500/12 to-slate-900/45"
                        : "border-white/12 bg-gradient-to-br from-white/[0.06] to-slate-900/45"
                  }`}
                >
                  <div className="flex h-full flex-col">
                    <div className="mb-6 flex h-36 items-start justify-between rounded-[12px] border border-white/10 bg-slate-950/30 p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Workout
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-50">{plan.name}</h3>
                      </div>

                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.04] text-slate-200">
                        <Heart className="h-4.5 w-4.5" />
                      </div>
                    </div>

                    <div className="mb-5 space-y-2 text-sm text-slate-300">
                      <div className="flex items-center justify-between">
                        <span>Days</span>
                        <span className="font-semibold text-slate-100">{plan.days.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Updated</span>
                        <span className="font-semibold text-slate-100">{formatDate(plan.updatedAt)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/gym-plan?planId=${plan.id}`)}
                      className="mt-auto inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-100 transition-all hover:bg-white/[0.08]"
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
                className="reveal-up reveal-delay-2 flex min-h-[278px] items-center justify-center rounded-[14px] border border-dashed border-white/20 bg-white/[0.03] p-4 text-slate-200 transition-all hover:border-emerald-400/35 hover:bg-emerald-500/10 hover:text-emerald-100"
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.04]">
                    <Plus className="h-8 w-8" />
                  </span>
                  <span className="text-lg font-semibold">Add workout</span>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
