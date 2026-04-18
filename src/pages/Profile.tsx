import { useEffect, useState } from "react";
import {
  Award,
  Clock,
  Dumbbell,
  Flame,
  Pencil,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import AuthUtils from "../utils/authUtils";

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

const USER_INSIGHTS: InsightRow[] = [
  { label: "Favorite Exercise", value: "Bench Press" },
  { label: "Best Streak", value: "14 days" },
  { label: "Avg. Workout Duration", value: "52 mins" },
  { label: "Workout Plans", value: "3 active" },
  { label: "Total Weight Lifted", value: "12,450 lbs" },
  { label: "Consistency Score", value: "87%", highlight: true },
];

export default function Profile() {
  const currentUser = AuthUtils.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const adminInsights: InsightRow[] = [
    { label: "Account Type", value: "Special Admin" },
    { label: "Admin Mode", value: AuthUtils.isAdminModeEnabled() ? "Enabled" : "Disabled", highlight: true },
    { label: "Managed Users", value: `${AuthUtils.getAllUsers().length}` },
    { label: "Privileges", value: "Roles, blocks, deletion" },
    { label: "Default Admin Login", value: "admin / admin" },
    { label: "Default User Login", value: "max / max" },
  ];

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(currentUser?.fullName ?? "User");
  const [formEmail, setFormEmail] = useState(currentUser?.username ?? "user@example.com");
  const [editError, setEditError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const displayName = formName || currentUser?.fullName || "User";
  const displayEmail = formEmail || currentUser?.username || "user@example.com";

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const latestUser = AuthUtils.getCurrentUser();
    setFormName(latestUser?.fullName ?? "User");
    setFormEmail(latestUser?.username ?? "user@example.com");
  }, []);

  const handleSave = (): void => {
    const nextName = formName.trim();
    const nextEmail = formEmail.trim();

    if (!nextName || !nextEmail) {
      setEditError("Please fill in your name and email.");
      return;
    }

    const result = AuthUtils.updateCurrentProfile(nextName, nextEmail);

    if (!result.ok) {
      setEditError(result.message ?? "Unable to update profile.");
      return;
    }

    setEditError("");
    setIsEditing(false);
  };

  const completedCount = WEEKLY_COMPLETED.filter(Boolean).length;
  const weeklyGoal = 5;
  const percentage = Math.round((completedCount / weeklyGoal) * 100);
  const insights = isAdmin ? adminInsights : USER_INSIGHTS;

  return (
    <div className="min-h-screen text-slate-200">
      <div
        className={`mx-auto max-w-[1200px] px-4 pb-10 pt-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] sm:px-6 ${
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
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
                    onChange={(event) => setFormName(event.target.value)}
                    className="block w-full rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-lg font-bold text-white outline-none focus:border-emerald-500/60"
                  />
                  <input
                    type="text"
                    value={formEmail}
                    onChange={(event) => setFormEmail(event.target.value)}
                    className="block w-full rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-emerald-500/60"
                  />
                  {editError ? <p className="text-xs text-rose-400">{editError}</p> : null}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-0.5 text-xs font-semibold text-amber-200">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Admin
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-400">{displayEmail}</p>
                </>
              )}
              <span
                className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                  isAdmin
                    ? "border border-amber-400/40 bg-amber-500/15 text-amber-200"
                    : "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                }`}
              >
                {isAdmin ? "Special administrator account" : "Standard user account"}
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
                    setFormName(currentUser?.fullName ?? "User");
                    setFormEmail(currentUser?.username ?? "user@example.com");
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

        <div className="reveal-up reveal-delay-1 mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <Dumbbell className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{isAdmin ? AuthUtils.getAllUsers().length : 24}</p>
            <p className="text-sm text-gray-400">{isAdmin ? "Registered Users" : "Total Workouts"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {isAdmin
                ? AuthUtils.getAllUsers().filter((user) => user.blocked).length
                : 7}
            </p>
            <p className="text-sm text-gray-400">{isAdmin ? "Blocked Accounts" : "Day Streak"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{isAdmin ? "24/7" : 1240}</p>
            <p className="text-sm text-gray-400">{isAdmin ? "Admin Access" : "Active Minutes"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
              <Award className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{isAdmin ? "Admin" : 3}</p>
            <p className="text-sm text-gray-400">{isAdmin ? "Account Role" : "Achievements"}</p>
          </div>
        </div>

        <section className="reveal-up reveal-delay-2 mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-xl font-bold text-white">
            {isAdmin ? "Admin Activity" : "Weekly Activity"}
          </h2>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-400">
                {isAdmin ? "Administrative control overview" : "Progress to weekly goal"}
              </p>
              <p className="text-2xl font-bold text-white">
                {isAdmin ? "Admin privileges active" : `${completedCount} / ${weeklyGoal} workouts`}
              </p>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{isAdmin ? "100%" : `${percentage}%`}</p>
          </div>
          <div className="flex items-end gap-3">
            {WEEKLY_DAYS.map((day, index) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-lg transition-all ${
                    WEEKLY_COMPLETED[index]
                      ? `${WEEKLY_HEIGHTS[index]} ${isAdmin ? "bg-amber-400" : "bg-emerald-500"}`
                      : "h-16 bg-white/8"
                  }`}
                />
                <span className="text-xs text-gray-400">{day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="reveal-up reveal-delay-3 mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-xl font-bold text-white">
            {isAdmin ? "Access Badges" : "Achievements"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.map((achievement) => (
              <div
                key={achievement.title}
                className={`rounded-xl border p-4 transition-colors ${
                  achievement.locked
                    ? "border-white/10 bg-white/3 opacity-60"
                    : isAdmin
                      ? "border-amber-400/30 bg-amber-500/10"
                      : "border-emerald-500/30 bg-emerald-600/15"
                }`}
              >
                <span className="mb-2 block text-2xl">{achievement.emoji}</span>
                <p className="font-semibold text-white">{achievement.title}</p>
                <p className="text-xs text-gray-400">
                  {achievement.locked ? "Locked" : achievement.date}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="reveal-up reveal-delay-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-xl font-bold text-white">
            {isAdmin ? "Admin Insights" : "Fitness Insights"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3"
              >
                <span className="text-sm text-gray-400">{row.label}</span>
                <span
                  className={`text-sm font-semibold ${
                    row.highlight
                      ? isAdmin
                        ? "text-amber-300"
                        : "text-emerald-400"
                      : "text-white"
                  }`}
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
