import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Dumbbell,
  Flame,
  Pencil,
  Ruler,
  Scale,
  ShieldCheck,
  Target,
  Trophy,
  UserCircle2,
  UtensilsCrossed,
  Star,
  Clock,
} from "lucide-react";
import AuthUtils from "../utils/authUtils";
import { getThemeById, DEFAULT_THEME_IDS } from "./MyPlans";
import { profileApi } from "../services/profileApi";
import { workoutPlanApi, type WorkoutPlanApi } from "../services/workoutPlanApi";
import { mealPlanApi, type MealPlanApi } from "../services/mealPlanApi";
import { planActivationApi } from "../services/planActivationApi";
import { planCompletionApi, type PlanCompletionResponseDto } from "../services/planCompletionApi";
import { planPreferencesApi, toCustomizationMap, type PlanCustomizations } from "../services/planPreferencesApi";
import { mediaApi } from "../services/mediaApi";
import { normalizeMediaUrl } from "../utils/media";

/* ── Profile persistence ─────────────────────────────────────────────────── */

interface UserProfileData {
  weight: number;
  height: number;
  age: number;
  streak: number;
  lastActiveDate: string;
  avatarUrl: string;
}

const createEmptyProfile = (): UserProfileData => ({
  weight: 0,
  height: 0,
  age: 0,
  streak: 0,
  lastActiveDate: "",
  avatarUrl: "",
});

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getYesterdayKey = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return toDateStr(yesterday);
};

/* ── Stat helpers ─────────────────────────────────────────────────────────── */

const getPlanIdFromToken = (dayToken: string) => dayToken.split(":")[0] ?? "";

const getDayNumberFromToken = (dayToken: string) => {
  const dayPart = dayToken.split(":")[1] ?? "";
  const match = dayPart.match(/\d+/);
  return match ? Number(match[0]) : null;
};

const dateKeyToUtcTime = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
};

const calculateStreaks = (completions: PlanCompletionResponseDto[]) => {
  const dates = [...new Set(completions.map((completion) => completion.dateKey))].sort();
  if (dates.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;

  for (let i = 1; i < dates.length; i += 1) {
    const diffDays = (dateKeyToUtcTime(dates[i]) - dateKeyToUtcTime(dates[i - 1])) / 86_400_000;
    run = diffDays === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const latest = dates[dates.length - 1];
  const current = latest === toDateStr(new Date()) || latest === getYesterdayKey() ? run : 0;
  return { current, best };
};

const totalCompletedWeight = (plans: WorkoutPlanApi[], completions: PlanCompletionResponseDto[]) => {
  let t = 0;
  for (const completion of completions.filter((item) => item.planType === "Workout")) {
    const planId = getPlanIdFromToken(completion.dayToken);
    const dayNumber = getDayNumberFromToken(completion.dayToken);
    const plan = plans.find((item) => item.id.toString() === planId);
    const day = plan?.days.find((item) => item.dayNumber === dayNumber);
    if (!day) continue;

    for (const exercise of day.dayExercises ?? []) {
      for (const set of exercise.sets) {
        t += set.weight * set.reps;
      }
    }
  }
  return Math.round(t);
};

const mealKcalPerDay = (mealPlan: MealPlanApi | null) => {
  if (!mealPlan || mealPlan.days.length === 0) return 0;
  const total = mealPlan.days.reduce(
    (planSum, day) =>
      planSum +
      day.categories.reduce(
        (daySum, category) => daySum + category.items.reduce((sum, item) => sum + item.kcal, 0),
        0,
      ),
    0,
  );
  return Math.round(total / mealPlan.days.length);
};

const fmtWeight = (kg: number) => `${kg.toLocaleString()} kg`;



/* ── Sub-components ───────────────────────────────────────────────────────── */

const accentMap: Record<string, string> = {
  amber: "bg-amber-500/20",
  orange: "bg-orange-500/20",
  emerald: "bg-emerald-500/20",
  blue: "bg-blue-500/20",
  purple: "bg-purple-500/20",
};

function StatCard({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accentMap[accent] ?? "bg-white/10"}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

function InfoCard({
  icon, label, value, editing, inputVal, onChange, placeholder, unit,
}: {
  icon: ReactNode; label: string; value: string; editing: boolean;
  inputVal: string; onChange: (v: string) => void; placeholder: string; unit: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {editing ? (
        <div className="relative">
          <input
            type="number"
            value={inputVal}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="input-no-spinner h-11 w-full rounded-xl border border-white/20 bg-white/[0.06] px-3 pr-12 text-lg font-bold text-white outline-none transition-all focus:border-emerald-500/60"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">{unit}</span>
        </div>
      ) : (
        <p className="text-2xl font-bold text-white">{value}</p>
      )}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export default function Profile() {
  const currentUser = AuthUtils.getCurrentUser();
  const isAdmin = currentUser?.role === "Admin";
  const isAdminMode = AuthUtils.isAdminModeEnabled();

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(currentUser?.fullName ?? "User");
  const [formEmail, setFormEmail] = useState(currentUser?.username ?? "user@example.com");
  const [editError, setEditError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [isEditingBody, setIsEditingBody] = useState(false);
  const [profile, setProfile] = useState<UserProfileData>(() => createEmptyProfile());
  const [bodyForm, setBodyForm] = useState({ weight: String(profile.weight), height: String(profile.height), age: String(profile.age) });
  const [plans, setPlans] = useState<WorkoutPlanApi[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlanApi[]>([]);
  const [completions, setCompletions] = useState<PlanCompletionResponseDto[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activeMealPlanId, setActiveMealPlanId] = useState<string | null>(null);
  const [customizations, setCustomizations] = useState<PlanCustomizations>({});
  const [mealCustomizations, setMealCustomizations] = useState<PlanCustomizations>({});

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileData() {
      if (isAdminMode) {
        const account = await profileApi.getMe();
        if (!cancelled && account) {
          setFormName(account.fullName);
          setFormEmail(account.username);
        }
        return;
      }

      const [account, dbProfile, workoutPlans, userMealPlans, workoutActivation, mealActivation, preferences, completionHistory] = await Promise.all([
        profileApi.getMe(),
        profileApi.getProfile(),
        workoutPlanApi.getMyPlans(),
        mealPlanApi.getMyPlans(),
        planActivationApi.getActive("Workout"),
        planActivationApi.getActive("Meal"),
        planPreferencesApi.getCustomizations(),
        planCompletionApi.getByUser(),
      ]);

      if (cancelled) return;

      if (account) {
        setFormName(account.fullName);
        setFormEmail(account.username);
      }

      const streaks = calculateStreaks(completionHistory);
      const updated = {
        ...createEmptyProfile(),
        weight: dbProfile?.weight ?? 0,
        height: dbProfile?.height ?? 0,
        age: dbProfile?.age ?? 0,
        streak: streaks.current,
        avatarUrl: normalizeMediaUrl(dbProfile?.avatarUrl),
      };

      setProfile(updated);
      setBodyForm({
        weight: String(updated.weight),
        height: String(updated.height),
        age: String(updated.age),
      });
      setPlans(workoutPlans);
      setMealPlans(userMealPlans);
      setCompletions(completionHistory);
      setActivePlanId(workoutActivation?.planIdentifier ?? null);
      setActiveMealPlanId(mealActivation?.planIdentifier ?? null);
      setCustomizations(toCustomizationMap(preferences, "Workout"));
      setMealCustomizations(toCustomizationMap(preferences, "Meal"));
    }

    loadProfileData();
    return () => {
      cancelled = true;
    };
  }, [isAdminMode]);

  useEffect(() => {
    const f = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(f);
  }, []);

  useEffect(() => {
    const u = AuthUtils.getCurrentUser();
    setFormName(u?.fullName ?? "User");
    setFormEmail(u?.username ?? "user@example.com");
  }, []);

  const streaks = useMemo(() => calculateStreaks(completions), [completions]);
  const tw = useMemo(() => totalCompletedWeight(plans, completions), [plans, completions]);
  const activePlan = useMemo(
    () => plans.find((plan) => plan.id.toString() === activePlanId) ?? null,
    [activePlanId, plans],
  );
  const activeMealPlan = useMemo(
    () => mealPlans.find((plan) => plan.id.toString() === activeMealPlanId) ?? null,
    [activeMealPlanId, mealPlans],
  );
  const activeMealKcalPerDay = useMemo(() => mealKcalPerDay(activeMealPlan), [activeMealPlan]);

  const displayName = formName || currentUser?.fullName || "User";
  const displayEmail = formEmail || currentUser?.username || "user@example.com";
  const avatarUrl = normalizeMediaUrl(profile.avatarUrl);

  const handleSave = async () => {
    const n = formName.trim();
    if (!n) { setEditError("Please fill in your name."); return; }
    const updated = await profileApi.updateMe({ fullName: n, username: formEmail });
    if (!updated) { setEditError("Unable to update profile."); return; }
    setEditError("");
    setIsEditing(false);
  };

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return;
    setAvatarError("");
    setIsUploadingAvatar(true);

    const uploaded = await mediaApi.uploadImage(file, "profiles");
    setIsUploadingAvatar(false);

    if (!uploaded) {
      setAvatarError("Could not upload the image. Try a smaller JPG, PNG, WebP, or GIF file.");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    const next = { ...profile, avatarUrl: uploaded.imageUrl };
    const saved = await profileApi.updateProfile({
      weight: next.weight,
      height: next.height,
      age: next.age,
      streak: streaks.current,
      avatarUrl: next.avatarUrl,
    });

    if (saved) {
      setProfile(next);
    } else {
      setAvatarError("Image uploaded, but profile could not be updated.");
    }

    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleSaveBody = async () => {
    const next: UserProfileData = {
      ...profile,
      weight: Math.max(0, Number(bodyForm.weight) || 0),
      height: Math.max(0, Number(bodyForm.height) || 0),
      age: Math.max(0, Math.floor(Number(bodyForm.age) || 0)),
      streak: streaks.current,
    };
    const saved = await profileApi.updateProfile({
      weight: next.weight,
      height: next.height,
      age: next.age,
      streak: next.streak,
      avatarUrl: next.avatarUrl,
    });
    if (saved) {
      setProfile(next);
      setIsEditingBody(false);
    }
  };

  const handleCancelBody = () => {
    setBodyForm({ weight: String(profile.weight), height: String(profile.height), age: String(profile.age) });
    setIsEditingBody(false);
  };

  return (
    <div className="min-h-screen text-slate-200">
      <div className={`mx-auto max-w-[1200px] px-4 pb-10 pt-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] sm:px-6 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>

        {/* ── Profile Header ── */}
        <section className="reveal-up mb-6 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="relative h-20 w-20 shrink-0">
              <button
                type="button"
                disabled={!isEditing || isUploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className={`group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 transition-all ${
                  isEditing ? "cursor-pointer hover:border-emerald-400/60 hover:bg-white/15" : "cursor-default"
                }`}
                aria-label="Choose profile image"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle2 className="h-12 w-12 text-slate-400" />
                )}
                {isEditing ? (
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {isUploadingAvatar ? "Uploading..." : "Change"}
                  </span>
                ) : null}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(event) => handleAvatarChange(event.target.files?.[0])}
              />
            </div>
            <div className="min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="block w-full rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-lg font-bold text-white outline-none focus:border-emerald-500/60" />
                  <p className="break-all text-sm text-gray-400 sm:break-normal">{displayEmail}</p>
                  {editError ? <p className="text-xs text-rose-400">{editError}</p> : null}
                  {avatarError ? <p className="text-xs text-rose-400">{avatarError}</p> : null}
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
                  <p className="break-all text-sm text-gray-400 sm:break-normal">{displayEmail}</p>
                </>
              )}
              <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${isAdmin ? "border border-amber-400/40 bg-amber-500/15 text-amber-200" : "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400"}`}>
                {isAdmin ? "Special administrator account" : "Standard user account"}
              </span>
            </div>
          </div>
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <button type="button" onClick={handleSave} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600">Save</button>
                <button type="button" onClick={() => { setIsEditing(false); setFormName(currentUser?.fullName ?? "User"); setFormEmail(currentUser?.username ?? "user@example.com"); setEditError(""); setAvatarError(""); }} className="rounded-xl border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/12">Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => { setIsEditing(true); setEditError(""); setAvatarError(""); }} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/12">
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </section>

        {/* ── Personal Info ── */}
        {isAdminMode ? (
          <section className="reveal-up reveal-delay-1 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-6 backdrop-blur-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/15">
                <ShieldCheck className="h-5 w-5 text-amber-200" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Mode Profile</h2>
                <p className="text-sm text-amber-100/70">This view is reserved for managing FitLife content and users.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <UserCircle2 className="h-6 w-6 text-amber-200" />
                <p className="mt-4 text-lg font-bold text-white">User administration</p>
                <p className="mt-1 text-sm text-slate-400">Manage accounts, roles, and access from the Users area.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <Dumbbell className="h-6 w-6 text-amber-200" />
                <p className="mt-4 text-lg font-bold text-white">Library control</p>
                <p className="mt-1 text-sm text-slate-400">Edit exercises and meals while admin mode is enabled.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <Star className="h-6 w-6 text-amber-200" />
                <p className="mt-4 text-lg font-bold text-white">FAQ management</p>
                <p className="mt-1 text-sm text-slate-400">Create categories, questions, answers, and icons on the FAQ page.</p>
              </div>
            </div>
          </section>
        ) : (
          <>
        <section className="reveal-up reveal-delay-1 mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Personal Info</h2>
            {isEditingBody ? (
              <div className="flex gap-2">
                <button type="button" onClick={handleSaveBody} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600">Save</button>
                <button type="button" onClick={handleCancelBody} className="rounded-xl border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/12">Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => setIsEditingBody(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/12">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InfoCard icon={<Scale className="h-5 w-5 text-blue-400" />} label="Weight" value={profile.weight > 0 ? `${profile.weight} kg` : "—"} editing={isEditingBody} inputVal={bodyForm.weight} onChange={(v) => setBodyForm((p) => ({ ...p, weight: v }))} placeholder="75" unit="kg" />
            <InfoCard icon={<Ruler className="h-5 w-5 text-purple-400" />} label="Height" value={profile.height > 0 ? `${profile.height} cm` : "—"} editing={isEditingBody} inputVal={bodyForm.height} onChange={(v) => setBodyForm((p) => ({ ...p, height: v }))} placeholder="175" unit="cm" />
            <InfoCard icon={<Calendar className="h-5 w-5 text-emerald-400" />} label="Age" value={profile.age > 0 ? `${profile.age} years` : "—"} editing={isEditingBody} inputVal={bodyForm.age} onChange={(v) => setBodyForm((p) => ({ ...p, age: v }))} placeholder="25" unit="years" />
          </div>
        </section>

        {/* ── Stats ── */}
        <div className="reveal-up reveal-delay-2 mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard icon={<Trophy className="h-5 w-5 text-amber-400" />} label="Total Weight Lifted" value={fmtWeight(tw)} accent="amber" />
          <StatCard icon={<Flame className="h-5 w-5 text-orange-400" />} label="Day Streak" value={String(streaks.current)} accent="orange" />
          <StatCard icon={<Star className="h-5 w-5 text-emerald-400" />} label="Best Streak" value={String(streaks.best)} accent="emerald" />
          <StatCard icon={<Target className="h-5 w-5 text-blue-400" />} label="Kcal per day" value={activeMealKcalPerDay ? activeMealKcalPerDay.toLocaleString() : "—"} accent="blue" />
        </div>

        {/* ── Active Plans Row ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Workout Plan */}
          <section className="reveal-up reveal-delay-3 flex flex-col">
            <div className="mb-4 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Active Workout Plan</h2>
            </div>
            {activePlan ? (() => {
              // Same styling logic as MyPlans
              const planIndex = plans.findIndex(p => p.id === activePlan.id);
              const custom = customizations[activePlan.id];
              const accent = custom?.colorId ? getThemeById(custom.colorId) : getThemeById(DEFAULT_THEME_IDS[Math.max(0, planIndex) % 4]);
              const customImg = custom?.imageUrl;
              const estMinutes = activePlan.days.length * 45;

              return (
                <article className={`flex flex-1 flex-col overflow-hidden rounded-2xl border shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${accent.card}`}>
                  {/* Image Area */}
                  <div className={`relative flex h-48 items-center justify-center bg-gradient-to-br ${accent.imgBg}`}>
                    {customImg ? (
                      <img src={customImg} alt={activePlan.name} className="h-full w-full object-contain p-2" />
                    ) : (
                      <Dumbbell className="h-16 w-16 text-white/20" />
                    )}
                    <span className={`absolute bottom-3 left-3 rounded-lg ${accent.badge} px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm`}>
                      {activePlan.days.length} days
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{activePlan.days.length} training days</span>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{activePlan.days.reduce((s, d) => s + (d.dayExercises?.length ?? d.exercises.length), 0)} exercises</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />~{estMinutes} min</span>
                    </div>
                    <h3 className="mb-5 break-words text-xl font-bold leading-snug text-slate-50">{activePlan.name}</h3>
                    <Link to={`/gym-plan?planId=${activePlan.id}`} className={`mt-auto inline-flex w-max items-center justify-center rounded-[10px] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 ${accent.btn}`}>
                      Open Plan
                    </Link>
                  </div>
                </article>
              );
            })() : (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center">
                <p className="mb-3 text-sm text-slate-400">No active workout plan</p>
                <Link to="/plans?tab=workout" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-400">Go to My Plans</Link>
              </div>
            )}
          </section>

          {/* Meal Plan */}
          <section className="reveal-up reveal-delay-4 flex flex-col">
            <div className="mb-4 flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-orange-400" />
              <h2 className="text-lg font-bold text-white">Active Alimentation Plan</h2>
            </div>
            {activeMealPlan ? (() => {
              const planIndex = mealPlans.findIndex(p => p.id === activeMealPlan.id);
              const custom = mealCustomizations[activeMealPlan.id];
              const accent = custom?.colorId ? getThemeById(custom.colorId) : getThemeById(DEFAULT_THEME_IDS[Math.max(0, planIndex) % 4]);
              const customImg = normalizeMediaUrl(custom?.imageUrl);
              const dayCount = activeMealPlan.days.length;

              return (
                <article className={`flex flex-1 flex-col overflow-hidden rounded-2xl border shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${accent.card}`}>
                  <div className={`relative flex h-48 items-center justify-center bg-gradient-to-br ${accent.imgBg}`}>
                    {customImg ? (
                      <img src={customImg} alt={activeMealPlan.name} className="h-full w-full object-contain p-2" />
                    ) : (
                      <UtensilsCrossed className="h-16 w-16 text-white/20" />
                    )}
                    <span className={`absolute bottom-3 left-3 rounded-lg ${accent.badge} px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm`}>
                      {dayCount} days
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {dayCount} meal days
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <UtensilsCrossed className="h-4 w-4" />
                        {activeMealPlan.meals} meals
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-orange-400" />
                        {activeMealKcalPerDay.toLocaleString()} kcal/day
                      </span>
                    </div>

                    <h3 className="mb-5 break-words text-xl font-bold leading-snug text-slate-50">{activeMealPlan.name}</h3>
                    <Link to={`/meal-plan?planId=${activeMealPlan.id}`} className={`mt-auto inline-flex w-max items-center justify-center rounded-[10px] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 ${accent.btn}`}>
                      Open Plan
                    </Link>
                  </div>
                </article>
              );
            })() : (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center">
                <p className="mb-3 text-sm text-slate-400">No active alimentation plan</p>
                <Link to="/plans?tab=alimentation" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400">Go to My Plans</Link>
              </div>
            )}
          </section>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
