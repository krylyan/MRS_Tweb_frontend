import {
  CalendarCheck2,
  Check,
  ClipboardCheck,
  Grid3X3,
  Heart,
  MessageCircle,
  Play,
  Plus,
  Search,
  Trophy,
  UserRoundPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface ActivityItem {
  id: string;
  name: string;
  detail: string;
  icon: LucideIcon;
}

interface WorkoutItem {
  id: string;
  name: string;
  volume: string;
  note: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "search", label: "Search", icon: Search },
  { id: "dashboard", label: "Dashboard", icon: Grid3X3 },
  { id: "community", label: "Community", icon: Users },
  { id: "coach", label: "Coach", icon: UserRoundPlus },
  { id: "calendar", label: "Calendar", icon: CalendarCheck2 },
  { id: "tasks", label: "Tasks", icon: ClipboardCheck },
  { id: "support", label: "Support", icon: MessageCircle },
  { id: "awards", label: "Awards", icon: Trophy },
];

const ACTIVITY_POOL: ActivityItem[] = [
  { id: "squat", name: "Squat", detail: "5 sets", icon: Trophy },
  { id: "bicep-curl", name: "Bicep curl", detail: "3 sets", icon: UserRoundPlus },
  { id: "running", name: "Running", detail: "10 min", icon: CalendarCheck2 },
  { id: "sumo-squat", name: "Sumo squat", detail: "5 sets", icon: Users },
  { id: "chest-fly", name: "Chest fly", detail: "3 sets", icon: Heart },
  { id: "jumping-jacks", name: "Jumping jacks", detail: "1 minute", icon: Grid3X3 },
  { id: "plank", name: "Plank", detail: "60 sec", icon: ClipboardCheck },
  { id: "deadlift", name: "Deadlift", detail: "4 sets", icon: Search },
];

export default function GymPlanMenu() {
  const navigate = useNavigate();
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>("search");
  const [statusMessage, setStatusMessage] = useState<string>("Ready to build your gym plan.");
  const [days, setDays] = useState<string[]>(["Day 1", "Day 2", "Day 3"]);
  const [activeDay, setActiveDay] = useState<string>("Day 1");
  const [activities, setActivities] = useState<ActivityItem[]>(ACTIVITY_POOL.slice(0, 6));
  const [selectedActivities, setSelectedActivities] = useState<Record<string, boolean>>({
    "bicep-curl": true,
    "chest-fly": true,
  });
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([
    {
      id: "workout-1",
      name: "Bicep curl",
      volume: "12x 20 kg / 10x 22 kg",
      note: "Keep elbows close to your torso and avoid swinging.",
    },
  ]);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string>("workout-1");
  const [isSessionLive, setIsSessionLive] = useState<boolean>(false);
  const [likedPreview, setLikedPreview] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(132);

  const activeWorkout = useMemo<WorkoutItem>(() => {
    return (
      workouts.find((workout) => workout.id === activeWorkoutId) ?? {
        id: "workout-fallback",
        name: "Workout",
        volume: "3 sets",
        note: "",
      }
    );
  }, [activeWorkoutId, workouts]);

  const selectedActivityList = activities.filter((activity) => selectedActivities[activity.id]);

  const handleSidebarAction = (item: SidebarItem): void => {
    setActiveSidebarItem(item.id);
    setStatusMessage(`${item.label} section activated.`);
  };

  const handleCreateWorkout = (): void => {
    const nextWorkoutNumber = workouts.length + 1;
    const newWorkoutId = `workout-${Date.now()}`;
    const newWorkout: WorkoutItem = {
      id: newWorkoutId,
      name: `Workout ${nextWorkoutNumber}`,
      volume: "3 sets / 8 reps",
      note: "Add your focus and progression notes here.",
    };

    setWorkouts((prev) => [...prev, newWorkout]);
    setActiveWorkoutId(newWorkoutId);
    setStatusMessage(`${newWorkout.name} created.`);
  };

  const handleAddDay = (): void => {
    const nextDay = `Day ${days.length + 1}`;
    setDays((prev) => [...prev, nextDay]);
    setActiveDay(nextDay);
    setStatusMessage(`${nextDay} added to your schedule.`);
  };

  const handleAddActivity = (): void => {
    const currentIds = new Set(activities.map((activity) => activity.id));
    const unusedActivity = ACTIVITY_POOL.find((activity) => !currentIds.has(activity.id));

    if (unusedActivity) {
      setActivities((prev) => [...prev, unusedActivity]);
      setSelectedActivities((prev) => ({ ...prev, [unusedActivity.id]: true }));
      setStatusMessage(`${unusedActivity.name} added to activities.`);
      return;
    }

    const baseActivity = ACTIVITY_POOL[activities.length % ACTIVITY_POOL.length];
    const duplicatedActivity: ActivityItem = {
      ...baseActivity,
      id: `${baseActivity.id}-${Date.now()}`,
      name: `${baseActivity.name} Pro`,
    };
    setActivities((prev) => [...prev, duplicatedActivity]);
    setSelectedActivities((prev) => ({ ...prev, [duplicatedActivity.id]: true }));
    setStatusMessage(`${duplicatedActivity.name} added to activities.`);
  };

  const handleToggleActivity = (activity: ActivityItem): void => {
    const nextValue = !selectedActivities[activity.id];
    setSelectedActivities((prev) => ({ ...prev, [activity.id]: nextValue }));
    setStatusMessage(
      nextValue
        ? `${activity.name} selected for ${activeDay}.`
        : `${activity.name} removed from ${activeDay}.`,
    );
  };

  const handleApplySelectedActivities = (): void => {
    if (!selectedActivityList.length) {
      setStatusMessage("Select at least one activity first.");
      return;
    }

    const primaryActivity = selectedActivityList[0];
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === activeWorkoutId
          ? {
              ...workout,
              name: primaryActivity.name,
              volume: `${selectedActivityList.length} active exercises`,
            }
          : workout,
      ),
    );
    setStatusMessage(`${selectedActivityList.length} activities linked to ${activeDay}.`);
  };

  const handleSessionToggle = (): void => {
    const nextIsLive = !isSessionLive;
    setIsSessionLive(nextIsLive);
    setStatusMessage(nextIsLive ? `Session started for ${activeDay}.` : "Session paused.");
  };

  const handleLikeToggle = (): void => {
    if (likedPreview) {
      setLikedPreview(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
      return;
    }

    setLikedPreview(true);
    setLikesCount((prev) => prev + 1);
  };

  const handleWorkoutNoteChange = (value: string): void => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === activeWorkoutId ? { ...workout, note: value } : workout,
      ),
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 px-3 py-4 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -left-24 top-1/2 h-[340px] w-[340px] -translate-y-1/2 rounded-full bg-gradient-to-br from-orange-500/80 to-red-500/80 blur-2xl" />
      <div className="pointer-events-none absolute -right-28 top-16 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-blue-500/35 to-indigo-500/25 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-[1260px] overflow-hidden rounded-[34px] border border-white/15 bg-white/95 text-gray-900 shadow-[0_28px_90px_rgba(8,18,43,0.45)]">
        <aside className="hidden w-[88px] shrink-0 flex-col justify-between bg-gradient-to-b from-[#40273f] to-[#261828] p-3 text-white lg:flex">
          <div className="space-y-2">
            <div className="mb-3 flex justify-center">
              <Link
                to="/home"
                className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold tracking-[0.2em] text-white/90 transition-colors hover:bg-white/10"
              >
                FL
              </Link>
            </div>
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarItem === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSidebarAction(item)}
                  title={item.label}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 ${
                    isActive
                      ? "border-blue-300/50 bg-blue-500/30 text-white"
                      : "border-transparent text-white/75 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
          >
            Home
          </button>
        </aside>

        <div className="flex-1 p-4 sm:p-6 xl:p-8">
          <header className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#322538] sm:text-5xl">Workout editor</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">{statusMessage}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/home"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Back to Home
              </Link>
              <button
                type="button"
                onClick={handleCreateWorkout}
                className="inline-flex items-center gap-2 rounded-full border border-blue-400/70 bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-400/30 transition-all hover:from-blue-600 hover:to-cyan-600"
              >
                <Plus className="h-4 w-4" />
                Create workout
              </button>
            </div>
          </header>

          <div className="mb-5 flex flex-wrap gap-2 lg:hidden">
            {SIDEBAR_ITEMS.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarItem === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSidebarAction(item)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "border-blue-300 bg-blue-100 text-blue-700"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr_0.9fr]">
            <section className="space-y-4">
              <div className="overflow-hidden rounded-[24px] bg-slate-200">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Gym training"
                  className="h-[220px] w-full object-cover"
                />
              </div>

              <div className="rounded-[24px] bg-slate-200 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-[#332739]">Days</h2>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-colors hover:bg-blue-600"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {days.map((day) => {
                    const isActive = day === activeDay;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setActiveDay(day)}
                        className={`w-full rounded-xl border px-4 py-3 text-left font-semibold transition-colors ${
                          isActive
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-transparent bg-white/75 text-slate-600 hover:bg-white"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-[24px] bg-slate-200 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-4xl font-bold text-[#332739]">Activities</h2>
                <button
                  type="button"
                  onClick={handleAddActivity}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-colors hover:bg-blue-600"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[490px] space-y-2.5 overflow-auto pr-1">
                {activities.map((activity) => {
                  const Icon = activity.icon;
                  const isSelected = !!selectedActivities[activity.id];
                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => handleToggleActivity(activity)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition-all ${
                        isSelected
                          ? "border-blue-200 bg-white shadow-sm shadow-blue-100/80"
                          : "border-transparent bg-white/80 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-[#3a2e40]">{activity.name}</p>
                          <p className="text-sm text-slate-500">{activity.detail}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded border text-white transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-slate-300 bg-transparent text-transparent"
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-[24px] bg-slate-200 p-4 sm:p-5">
                <h2 className="mb-3 text-4xl font-bold text-[#332739]">{activeWorkout.name}</h2>
                <div className="overflow-hidden rounded-2xl">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                    alt="Gym bench training"
                    className="h-[205px] w-full object-cover"
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white p-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Volume</p>
                    <p className="text-sm font-semibold text-slate-700">{activeWorkout.volume}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Selected</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedActivityList.length} activities</p>
                  </div>
                </div>
                <textarea
                  value={activeWorkout.note}
                  onChange={(event) => handleWorkoutNoteChange(event.target.value)}
                  className="mt-3 h-24 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-400 transition focus:ring-2"
                  placeholder="Add note..."
                />
              </div>

              <div className="mx-auto w-full max-w-[345px] rounded-[34px] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-300/60">
                <div className="mb-3 overflow-hidden rounded-[22px]">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                    alt="Workout shoes"
                    className="h-[205px] w-full object-cover"
                  />
                </div>

                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleLikeToggle}
                    className="inline-flex items-center gap-2 text-3xl font-bold text-[#2f2634] transition-colors hover:text-red-500"
                  >
                    <Heart className={`h-6 w-6 ${likedPreview ? "fill-red-500 text-red-500" : "text-red-400"}`} />
                    {likesCount}
                  </button>
                  <button
                    type="button"
                    onClick={handleSessionToggle}
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-colors ${
                      isSessionLive ? "bg-emerald-500 hover:bg-emerald-600" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    <Play className="h-7 w-7" />
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedActivityList.slice(0, 2).map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between rounded-2xl bg-slate-100 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-white p-1.5 text-slate-600">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-[#3a2e40]">{activity.name}</p>
                            <p className="text-xs text-slate-500">{activity.detail}</p>
                          </div>
                        </div>
                        <Check className="h-4 w-4 text-emerald-500" />
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleApplySelectedActivities}
                  className="mt-4 w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:from-blue-600 hover:to-cyan-600"
                >
                  Add activity
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

