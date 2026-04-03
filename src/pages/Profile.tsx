import { useEffect, useState } from "react";
import {
  Award,
  Clock,
  Dumbbell,
  Flame,
  Pencil,
  UserCircle2,
} from "lucide-react";


interface Achievement {
  emoji: string;
  title: string;
  date: string | null;
  locked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { emoji: "🎯", title: "First Workout", date: "Jan 15, 2024", locked: false },
  { emoji: "🔥", title: "7 Day Streak", date: "Feb 3, 2024", locked: false },
  { emoji: "💪", title: "10 Workouts", date: "Feb 10, 2024", locked: false },
  { emoji: "⚡", title: "30 Day Streak", date: null, locked: true },
  { emoji: "🏆", title: "50 Workouts", date: null, locked: true },
  { emoji: "👑", title: "100 Workouts", date: null, locked: true },
];

const WEEKLY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const WEEKLY_COMPLETED = [true, true, false, true, true, false, false] as const;
const WEEKLY_HEIGHTS = ["h-28", "h-24", "h-0", "h-32", "h-28", "h-0", "h-0"] as const;

interface InsightRow {
  label: string;
  value: string;
  highlight?: boolean;
}

const INSIGHTS: InsightRow[] = [
  { label: "Favorite Exercise", value: "Bench Press" },
  { label: "Best Streak", value: "14 days" },
  { label: "Avg. Workout Duration", value: "52 mins" },
  { label: "Workout Plans", value: "3 active" },
  { label: "Total Weight Lifted", value: "12,450 lbs" },
  { label: "Consistency Score", value: "87%", highlight: true },
];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("User");
  const [formEmail, setFormEmail] = useState("user@example.com");
  const [editError, setEditError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const displayName = formName || "User";
  const displayEmail = formEmail || "user@example.com";

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleSave = (): void => {
    const nextName = formName.trim();
    const nextEmail = formEmail.trim();

    if (!nextName || !nextEmail) {
      setEditError("Please fill in your name and email.");
      return;
    }

    setEditError("");
    setIsEditing(false);
  };

  const completedCount = WEEKLY_COMPLETED.filter(Boolean).length;
  const weeklyGoal = 5;
  const percentage = Math.round((completedCount / weeklyGoal) * 100);

  return (
    <div className="min-h-screen text-slate-200">
      <div
        className={`mx-auto max-w-[1200px] px-4 pb-10 pt-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] sm:px-6 ${
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        {/* Profile Header */}
        <section className="reveal-up mb-6 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10">
              <UserCircle2 className="h-12 w-12 text-slate-400" />
            </div>
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="block w-full rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-lg font-bold text-white outline-none focus:border-emerald-500/60"
                  />
                  <input
                    type="text"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="block w-full rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-emerald-500/60"
                  />
                  {editError ? <p className="text-xs text-rose-400">{editError}</p> : null}
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                  <p className="text-sm text-gray-400">{displayEmail}</p>
                </>
              )}
              <span className="mt-2 inline-block rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-0.5 text-xs font-medium text-emerald-400">
                Member since January 2024
              </span>
            </div>
          </div>

          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormName(displayName);
                    setFormEmail(displayEmail);
                    setEditError("");
                  }}
                  className="rounded-xl border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/12"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setEditError("");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/12"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </section>

        {/* Stats Row */}
        <div className="reveal-up reveal-delay-1 mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <Dumbbell className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">24</p>
            <p className="text-sm text-gray-400">Total Workouts</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">7</p>
            <p className="text-sm text-gray-400">Day Streak</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">1240</p>
            <p className="text-sm text-gray-400">Active Minutes</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
              <Award className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-sm text-gray-400">Achievements</p>
          </div>
        </div>

        {/* Weekly Activity */}
        <section className="reveal-up reveal-delay-2 mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-xl font-bold text-white">Weekly Activity</h2>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-400">Progress to weekly goal</p>
              <p className="text-2xl font-bold text-white">
                {completedCount} / {weeklyGoal} workouts
              </p>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{percentage}%</p>
          </div>
          <div className="flex items-end gap-3">
            {WEEKLY_DAYS.map((day, i) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-lg transition-all ${
                    WEEKLY_COMPLETED[i]
                      ? `${WEEKLY_HEIGHTS[i]} bg-emerald-500`
                      : "h-16 bg-white/8"
                  }`}
                />
                <span className="text-xs text-gray-400">{day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="reveal-up reveal-delay-3 mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-xl font-bold text-white">Achievements</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.title}
                className={`rounded-xl border p-4 transition-colors ${
                  a.locked
                    ? "border-white/10 bg-white/3 opacity-60"
                    : "border-emerald-500/30 bg-emerald-600/15"
                }`}
              >
                <span className="mb-2 block text-2xl">{a.emoji}</span>
                <p className="font-semibold text-white">{a.title}</p>
                <p className="text-xs text-gray-400">{a.locked ? "Locked" : a.date}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fitness Insights */}
        <section className="reveal-up reveal-delay-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-xl font-bold text-white">Fitness Insights</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {INSIGHTS.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3"
              >
                <span className="text-sm text-gray-400">{row.label}</span>
                <span
                  className={`text-sm font-semibold ${row.highlight ? "text-emerald-400" : "text-white"}`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

