import {
  CalendarCheck2,
  Clock,
  Dumbbell,
  Flame,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getWorkoutPlans } from "../utils/planStorage";
import { useTimer } from "../contexts/TimerContext";

export default function Home() {
  const navigate = useNavigate();
  const { timeLeft, isRunning, setTime, start, pause, reset, setIsActive } = useTimer();
  const plans = getWorkoutPlans();
  const totalPlans = plans.length;
  const [customTime, setCustomTime] = useState<string>('');
  const [unit, setUnit] = useState<string>('minutes');
  const [timerReady, setTimerReady] = useState<boolean>(false);

  useEffect(() => {
    setIsActive(true);
    return () => setIsActive(false);
  }, [setIsActive]);

  useEffect(() => {
    // Check if timer is ready to start
    const hasCustomTime = customTime.trim() !== '' && !isNaN(parseInt(customTime)) && parseInt(customTime) > 0;
    const hasTimeLeft = timeLeft > 0;
    setTimerReady(hasCustomTime || hasTimeLeft);
  }, [customTime, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetTime = (minutes: number) => {
    setTime(minutes * 60);
  };

  const handleStart = () => {
    // If there's custom time in input, set it first
    if (customTime.trim() !== '') {
      const num = parseInt(customTime);
      if (!isNaN(num) && num > 0) {
        const seconds = unit === 'minutes' ? num * 60 : num;
        setTime(seconds);
      }
    }
    start();
  };

  return (
    <div className="min-h-screen px-8 py-8 lg:px-12">
      {/* Header */}
      <div className="reveal-up mb-10">
        <h1 className="text-4xl font-bold text-white">Welcome Back!</h1>
        <p className="mt-2 text-lg text-gray-400">Ready to crush your goals today?</p>
      </div>

      {/* Stats Row */}
      <div className="reveal-up reveal-delay-1 mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
            <CalendarCheck2 className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{totalPlans}</p>
          <p className="mt-1 text-sm text-gray-400">Workout Plans</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
            <TrendingUp className="h-6 w-6 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            12.5k <span className="text-base font-normal text-gray-400">lbs</span>
          </p>
          <p className="mt-1 text-sm text-gray-400">Total Volume</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
            <Flame className="h-6 w-6 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-white">2,450</p>
          <p className="mt-1 text-sm text-gray-400">Calories Burned</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
            <Target className="h-6 w-6 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">18</p>
          <p className="mt-1 text-sm text-gray-400">Active Days</p>
        </div>
      </div>

      {/* Quick Timer */}
      <div className="reveal-up reveal-delay-1 mb-10">
        <h2 className="mb-5 text-xl font-bold text-white">Quick Timer</h2>
        <div className="rounded-2xl border border-white/12 bg-white/4 p-6 shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
          <div className="mb-6 text-center">
            <div className="text-4xl font-bold text-slate-50">{formatTime(timeLeft)}</div>
          </div>
          <div className="mb-4 flex justify-center gap-3">
            <button
              onClick={() => handleSetTime(1)}
              className="rounded-[10px] bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:bg-emerald-400 active:scale-95"
            >
              1 min
            </button>
            <button
              onClick={() => handleSetTime(5)}
              className="rounded-[10px] bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:bg-blue-400 active:scale-95"
            >
              5 min
            </button>
            <button
              onClick={() => handleSetTime(10)}
              className="rounded-[10px] bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-200 hover:bg-purple-400 active:scale-95"
            >
              10 min
            </button>
          </div>
          <div className="mb-4 flex items-center justify-center gap-3">
            <input
              type="number"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              placeholder="Enter time"
              className="rounded-[10px] border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:border-emerald-400/60 focus:outline-none"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded-[10px] border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-slate-50 focus:border-emerald-400/60 focus:outline-none"
            >
              <option value="minutes">minutes</option>
              <option value="seconds">seconds</option>
            </select>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleStart}
              disabled={!timerReady || isRunning}
              className="rounded-[10px] bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:bg-green-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start
            </button>
            <button
              onClick={pause}
              disabled={!isRunning}
              className="rounded-[10px] bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-yellow-500/30 transition-all duration-200 hover:bg-yellow-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pause
            </button>
            <button
              onClick={reset}
              className="rounded-[10px] bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all duration-200 hover:bg-red-400 active:scale-95"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent Workouts */}
      <div className="reveal-up reveal-delay-2 grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Quick Actions */}
        <div className="xl:col-span-2">
          <h2 className="mb-5 text-xl font-bold text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/gym-plan")}
              className="group rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-600/30 to-emerald-900/40 p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-500/20"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/40 transition-transform group-hover:scale-110">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Create New Workout</h3>
              <p className="mt-1 text-sm text-gray-400">Start planning your next training session</p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/plans")}
              className="group rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-600/30 to-blue-900/40 p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-500/20"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/40 transition-transform group-hover:scale-110">
                <CalendarCheck2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">View My Plans</h3>
              <p className="mt-1 text-sm text-gray-400">Access your saved workout programs</p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/gym-plan")}
              className="group rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-600/30 to-purple-900/40 p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/20"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 shadow-lg shadow-purple-500/40 transition-transform group-hover:scale-110">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Exercise Library</h3>
              <p className="mt-1 text-sm text-gray-400">Discover new movements and techniques</p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="group rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-600/20 to-amber-900/40 p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/60 hover:shadow-xl hover:shadow-orange-500/20"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/40 transition-transform group-hover:scale-110">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Track Progress</h3>
              <p className="mt-1 text-sm text-gray-400">Review your achievements and stats</p>
            </button>
          </div>
        </div>

        {/* Recent Workouts */}
        <div>
          <h2 className="mb-5 text-xl font-bold text-white">Recent Workouts</h2>
          <div className="space-y-4">
            {plans.length > 0 ? (
              plans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/8"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-white">{plan.name}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(plan.updatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="h-3.5 w-3.5" />
                      {plan.days.length} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {plan.days.length * 15} min
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center text-sm text-gray-500">
                No workouts yet. Create your first plan!
              </div>
            )}

            <Link
              to="/plans"
              className="block rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-medium text-gray-400 transition-colors hover:bg-white/8 hover:text-white"
            >
              View All Plans
            </Link>
          </div>
        </div>
      </div>

      {/* Motivation Banner */}
      <div className="reveal-up reveal-delay-3 mt-10 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600/20 to-emerald-900/30 px-8 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h3 className="text-lg font-bold text-white">
              You&apos;re on a roll! 🔥
            </h3>
            <p className="mt-1 text-sm text-gray-300">
              {totalPlans} workout plan{totalPlans !== 1 ? "s" : ""} created. Keep up the amazing work!
            </p>
          </div>
          <Link
            to="/profile"
            className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600"
          >
            View Progress
          </Link>
        </div>
      </div>
    </div>
  );
}

