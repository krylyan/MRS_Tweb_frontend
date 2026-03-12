import {
  CalendarCheck2,
  Check,
  ClipboardCheck,
  Grid3X3,
  Heart,
  Plus,
  Search,
  Trash2,
  Trophy,
  UserRoundPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

interface ActivitiesPanelProps {
  activities: ActivityItem[];
  selectedActivities: Record<string, boolean>;
  onAddActivity: () => void;
  onToggleActivity: (activity: ActivityItem) => void;
  onDeleteActivity: (activityId: string) => void;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "search", label: "Search", icon: Search },
  { id: "dashboard", label: "Dashboard", icon: Grid3X3 },
  { id: "community", label: "Community", icon: Users },
  { id: "coach", label: "Coach", icon: UserRoundPlus },
  { id: "calendar", label: "Calendar", icon: CalendarCheck2 },
  { id: "tasks", label: "Tasks", icon: ClipboardCheck },
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

function ActivitiesPanel({
  activities,
  selectedActivities,
  onAddActivity,
  onToggleActivity,
  onDeleteActivity,
}: ActivitiesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return activities;
    }
    return activities.filter((activity) => activity.name.toLowerCase().includes(query));
  }, [activities, searchQuery]);

  return (
    <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-50">Activities</h2>
        <button
          type="button"
          onClick={onAddActivity}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border-0 bg-gradient-to-r from-emerald-500 to-blue-500 text-white transition-all duration-300 hover:from-emerald-600 hover:to-blue-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search exercises..."
          className="h-10 w-full rounded-[10px] border border-white/20 bg-white/[0.03] pl-10 pr-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.2)]"
        />
      </div>

      <div className="max-h-[620px] space-y-2.5 overflow-auto pr-1">
        {filteredActivities.length ? (
          filteredActivities.map((activity) => {
            const Icon = activity.icon;
            const isSelected = !!selectedActivities[activity.id];

            return (
              <div
                key={activity.id}
                className={`flex items-center justify-between rounded-[10px] border px-3 py-2.5 transition-all ${
                  isSelected
                    ? "border-emerald-400/40 bg-emerald-500/12"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.08]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleActivity(activity)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div className="rounded-[8px] border border-white/10 bg-white/10 p-2 text-slate-200">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-100">{activity.name}</p>
                    <p className="text-xs text-slate-300">{activity.detail}</p>
                  </div>
                </button>

                <div className="ml-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleActivity(activity)}
                    className={`inline-flex h-5 w-5 items-center justify-center rounded border text-white transition-colors ${
                      isSelected
                        ? "border-emerald-400/60 bg-emerald-500 text-white"
                        : "border-white/30 bg-transparent text-transparent hover:border-white/50"
                    }`}
                    aria-label={`Toggle ${activity.name}`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteActivity(activity.id)}
                    className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[8px] text-slate-300 transition-all hover:bg-rose-500/15 hover:text-rose-300"
                    aria-label={`Delete ${activity.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-[10px] border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
            No exercises match your search.
          </p>
        )}
      </div>
    </section>
  );
}

export default function GymPlanMenu() {
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>("search");
  const [statusMessage, setStatusMessage] = useState<string>("Ready to build your gym workout.");
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
  const primarySelectedActivity = selectedActivityList[0];

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

  const handleDeleteActivity = (activityId: string): void => {
    const deletedActivity = activities.find((activity) => activity.id === activityId);
    if (!deletedActivity) {
      return;
    }

    setActivities((prev) => prev.filter((activity) => activity.id !== activityId));
    setSelectedActivities((prev) => {
      const next = { ...prev };
      delete next[activityId];
      return next;
    });
    setStatusMessage(`${deletedActivity.name} removed from activities.`);
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

  const handleWorkoutVolumeChange = (value: string): void => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === activeWorkoutId ? { ...workout, volume: value } : workout,
      ),
    );
  };

  const handleWorkoutNoteChange = (value: string): void => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === activeWorkoutId ? { ...workout, note: value } : workout,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-8">
        <div className="flex gap-4 lg:gap-5">
          <aside className="hidden w-[78px] shrink-0 rounded-[14px] border border-white/12 bg-white/4 p-2.5 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px] lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-1.5">
              <div className="mb-3 flex justify-center">
                <Link
                  to="/home"
                  className="rounded-[10px] border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold tracking-[0.2em] text-white transition-colors hover:bg-white/10"
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
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-[10px] border transition-all duration-200 ${
                      isActive
                        ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
                        : "border-transparent bg-transparent text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </button>
                );
              })}
            </div>
            <Link
              to="/home"
              className="mx-auto inline-flex rounded-[10px] border border-white/20 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-white/14"
            >
              Home
            </Link>
          </aside>

          <div className="w-full">
            <header className="mb-4 rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px] md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold leading-tight text-slate-50 md:text-4xl">Workout editor</h1>
                  <p className="mt-1 text-sm text-slate-300">{statusMessage}</p>
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
                    onClick={handleCreateWorkout}
                    className="inline-flex items-center gap-2 rounded-[10px] border-0 bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-blue-600"
                  >
                    <Plus className="h-4 w-4" />
                    Create workout
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSidebarItem === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSidebarAction(item)}
                      className={`inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
                          : "border-white/20 bg-white/6 text-slate-200 hover:bg-white/12"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </header>

            <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <section className="space-y-4">
                <article className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
                  <h2 className="mb-3 text-lg font-semibold text-slate-50">Workout image</h2>
                  <div className="overflow-hidden rounded-[10px] border border-white/10">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                      alt="Gym training"
                      className="h-[250px] w-full object-cover md:h-[280px]"
                    />
                  </div>
                </article>

                <article className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-50">Days</h2>
                    <button
                      type="button"
                      onClick={handleAddDay}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border-0 bg-gradient-to-r from-emerald-500 to-blue-500 text-white transition-all duration-300 hover:from-emerald-600 hover:to-blue-600"
                    >
                      <Plus className="h-4 w-4" />
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
                          className={`w-full rounded-[10px] border px-3.5 py-3 text-left text-sm font-semibold transition-colors ${
                            isActive
                              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                              : "border-white/10 bg-white/[0.02] text-slate-200 hover:bg-white/[0.08]"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </article>
              </section>

              <ActivitiesPanel
                activities={activities}
                selectedActivities={selectedActivities}
                onAddActivity={handleAddActivity}
                onToggleActivity={handleToggleActivity}
                onDeleteActivity={handleDeleteActivity}
              />

              <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
                <h2 className="mb-3 text-lg font-semibold text-slate-50">Activity details</h2>

                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Active day</p>
                    <p className="text-sm font-semibold text-slate-100">{activeDay}</p>
                  </div>
                  <div className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Selected activities</p>
                    <p className="text-sm font-semibold text-slate-100">{selectedActivityList.length}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Workout title</label>
                    <p className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100">
                      {activeWorkout.name}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Volume</label>
                    <input
                      type="text"
                      value={activeWorkout.volume}
                      onChange={(event) => handleWorkoutVolumeChange(event.target.value)}
                      className="h-10 w-full rounded-[10px] border border-white/20 bg-white/[0.03] px-3 text-sm text-slate-100 outline-none transition-all focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.2)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Primary activity</label>
                    <p className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100">
                      {primarySelectedActivity?.name ?? "No activity selected"}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Notes</label>
                    <textarea
                      value={activeWorkout.note}
                      onChange={(event) => handleWorkoutNoteChange(event.target.value)}
                      className="h-28 w-full resize-none rounded-[10px] border border-white/20 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 outline-none transition-all focus:border-emerald-500/60 focus:shadow-[0_0_16px_rgba(16,185,129,0.2)]"
                      placeholder="Add workout notes..."
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplySelectedActivities}
                  className="mt-4 w-full rounded-[10px] border-0 bg-gradient-to-r from-emerald-500 to-blue-500 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-blue-600"
                >
                  Update workout details
                </button>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
