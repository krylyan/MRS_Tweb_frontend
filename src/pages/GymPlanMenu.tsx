import {
  CalendarCheck2,
  ClipboardCheck,
  Grid3X3,
  Heart,
  Plus,
  Search,
  Trophy,
  UserRoundPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ActivityItem from "../components/ActivityItem";
import ExerciseSearch from "../components/ExerciseSearch";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { exercises as exerciseDatabase, type Exercise, type ExerciseType } from "../data/exercises";

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface WorkoutItem {
  id: string;
  name: string;
  volume: string;
  note: string;
}

interface ActivitiesPanelProps {
  activities: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  onDeleteActivity: (exerciseId: number) => void;
  getIconForType: (type: ExerciseType) => LucideIcon;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "search", label: "Search", icon: Search },
  { id: "dashboard", label: "Dashboard", icon: Grid3X3 },
  { id: "community", label: "Community", icon: Users },
  { id: "coach", label: "Coach", icon: UserRoundPlus },
  { id: "calendar", label: "Calendar", icon: CalendarCheck2 },
  { id: "tasks", label: "Tasks", icon: ClipboardCheck },
];

const EXERCISE_ICON_BY_TYPE: Record<ExerciseType, LucideIcon> = {
  strength: Trophy,
  cardio: CalendarCheck2,
  core: Grid3X3,
  mobility: ClipboardCheck,
  plyometric: Users,
  recovery: Heart,
};

const INITIAL_ACTIVITY_IDS = [2, 5, 17];

function ActivitiesPanel({
  activities,
  onSelectExercise,
  onDeleteActivity,
  getIconForType,
}: ActivitiesPanelProps) {
  return (
    <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <h2 className="mb-3 text-lg font-semibold text-slate-50">Activities</h2>

      <ExerciseSearch
        exercises={exerciseDatabase}
        addedExerciseIds={activities.map((activity) => activity.id)}
        getIconForType={getIconForType}
        onSelectExercise={onSelectExercise}
      />

      <div className="max-h-[620px] space-y-2.5 overflow-auto pr-1">
        {activities.length ? (
          activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              exercise={activity}
              Icon={getIconForType(activity.type)}
              onDelete={onDeleteActivity}
            />
          ))
        ) : (
          <p className="rounded-[10px] border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
            No activities selected yet. Search and add exercises above.
          </p>
        )}
      </div>
    </section>
  );
}

export default function GymPlanMenu() {
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>("search");
  const [statusMessage, setStatusMessage] = useState<string>(
    "Search from the exercise database and build your workout list.",
  );
  const [days, setDays] = useState<string[]>(["Day 1", "Day 2", "Day 3"]);
  const [activeDay, setActiveDay] = useState<string>("Day 1");
  const [activities, setActivities] = useState<Exercise[]>(
    exerciseDatabase.filter((exercise) => INITIAL_ACTIVITY_IDS.includes(exercise.id)),
  );
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

  const primarySelectedActivity = activities[0];

  const getIconForType = (type: ExerciseType): LucideIcon => EXERCISE_ICON_BY_TYPE[type];

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

  const handleSelectExercise = (exercise: Exercise): void => {
    const alreadyAdded = activities.some((activity) => activity.id === exercise.id);
    if (alreadyAdded) {
      setStatusMessage(`${exercise.name} is already in the activities list.`);
      return;
    }

    setActivities((prev) => [...prev, exercise]);
    setStatusMessage(`${exercise.name} added to activities.`);
  };

  const handleDeleteActivity = (exerciseId: number): void => {
    const deletedActivity = activities.find((activity) => activity.id === exerciseId);
    if (!deletedActivity) {
      return;
    }

    setActivities((prev) => prev.filter((activity) => activity.id !== exerciseId));
    setStatusMessage(`${deletedActivity.name} removed from activities.`);
  };

  const handleApplySelectedActivities = (): void => {
    if (!activities.length) {
      setStatusMessage("Add at least one exercise first.");
      return;
    }

    const primaryActivity = activities[0];
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === activeWorkoutId
          ? {
              ...workout,
              name: primaryActivity.name,
              volume: `${activities.length} selected exercises`,
            }
          : workout,
      ),
    );
    setStatusMessage(`${activities.length} activities linked to ${activeDay}.`);
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
                onSelectExercise={handleSelectExercise}
                onDeleteActivity={handleDeleteActivity}
                getIconForType={getIconForType}
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
                    <p className="text-sm font-semibold text-slate-100">{activities.length}</p>
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

