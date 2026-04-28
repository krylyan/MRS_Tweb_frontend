import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  Timer,
  Trophy,
  UserCircle2,
  UtensilsCrossed,
} from "lucide-react";
import AuthUtils from "../utils/authUtils";
import { getActivePlan, getWorkoutPlans } from "../utils/planStorage";
import type { StoredWorkoutPlan } from "../utils/planStorage";
import { mealLibrary } from "../utils/mealLibrary";
import type { FoodItem } from "../types/meal";

/* ── Profile persistence ─────────────────────────────────────────────────── */

const PROFILE_KEY = "fitlife_user_profile";

interface UserProfileData {
  weight: number;
  height: number;
  age: number;
  streak: number;
  lastActiveDate: string;
}

const readProfile = (): UserProfileData => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { weight: 0, height: 0, age: 0, streak: 0, lastActiveDate: "" };
    const p = JSON.parse(raw) as Partial<UserProfileData>;
    return {
      weight: Number(p.weight) || 0,
      height: Number(p.height) || 0,
      age: Number(p.age) || 0,
      streak: Number(p.streak) || 0,
      lastActiveDate: p.lastActiveDate ?? "",
    };
  } catch {
    return { weight: 0, height: 0, age: 0, streak: 0, lastActiveDate: "" };
  }
};

const writeProfile = (d: UserProfileData) =>
  localStorage.setItem(PROFILE_KEY, JSON.stringify(d));

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const updateStreak = (p: UserProfileData): UserProfileData => {
  const today = toDateStr(new Date());
  if (p.lastActiveDate === today) return p;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = toDateStr(y);
  return { ...p, streak: p.lastActiveDate === yesterday ? p.streak + 1 : 1, lastActiveDate: today };
};

/* ── Stat helpers ─────────────────────────────────────────────────────────── */

const totalWeight = (plans: StoredWorkoutPlan[]) => {
  let t = 0;
  for (const p of plans) for (const s of p.workoutTracking.sets) t += s.weight * s.reps;
  return Math.round(t);
};

const uniqueExercises = (plans: StoredWorkoutPlan[]) => {
  const ids = new Set<string>();
  for (const p of plans) for (const d of p.days) for (const id of d.exerciseIds) ids.add(id);
  return ids.size;
};

const fmtWeight = (kg: number) => (kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg} kg`);

/* ── Meal plan summary (default Day 1) ────────────────────────────────────── */

const DAY1: Record<string, string[]> = {
  breakfast: ["bread", "egg", "yogurt"],
  lunch: ["lettuce", "tomato", "chicken", "rice"],
  snacks: ["apple", "hummus", "carrot"],
  dinner: ["salmon", "sweet-potato", "almonds"],
};

const getMealSummary = (catalogue: FoodItem[]) => {
  const byId = new Map(catalogue.map((f) => [f.id, f]));
  const foods: FoodItem[] = [];
  for (const ids of Object.values(DAY1))
    for (const id of ids) {
      const f = byId.get(id);
      if (f) foods.push(f);
    }
  return {
    kcal: foods.reduce((s, f) => s + f.kcal, 0),
    protein: foods.reduce((s, f) => s + f.protein, 0),
    carbs: foods.reduce((s, f) => s + f.carbs, 0),
    fats: foods.reduce((s, f) => s + f.fats, 0),
    count: foods.length,
  };
};

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

function MacroRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export default function Profile() {
  const currentUser = AuthUtils.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(currentUser?.fullName ?? "User");
  const [formEmail, setFormEmail] = useState(currentUser?.username ?? "user@example.com");
  const [editError, setEditError] = useState("");

  const [isEditingBody, setIsEditingBody] = useState(false);
  const [profile, setProfile] = useState<UserProfileData>(() => updateStreak(readProfile()));
  const [bodyForm, setBodyForm] = useState({ weight: String(profile.weight), height: String(profile.height), age: String(profile.age) });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const updated = updateStreak(readProfile());
    writeProfile(updated);
    setProfile(updated);
  }, []);

  useEffect(() => {
    const f = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(f);
  }, []);

  useEffect(() => {
    const u = AuthUtils.getCurrentUser();
    setFormName(u?.fullName ?? "User");
    setFormEmail(u?.username ?? "user@example.com");
  }, []);

  const plans = useMemo(() => getWorkoutPlans(), []);
  const tw = useMemo(() => totalWeight(plans), [plans]);
  const te = useMemo(() => uniqueExercises(plans), [plans]);
  const activePlan = useMemo(() => getActivePlan(), []);

  const catalogue = useMemo(() => mealLibrary.getVisibleMeals("priority"), []);
  const meal = useMemo(() => getMealSummary(catalogue), [catalogue]);
  const mealKcal = meal.kcal;
  const protPct = mealKcal > 0 ? Math.round((meal.protein * 4 / mealKcal) * 100) : 0;
  const fatPct = mealKcal > 0 ? Math.round((meal.fats * 9 / mealKcal) * 100) : 0;
  const carbPct = mealKcal > 0 ? Math.round((meal.carbs * 4 / mealKcal) * 100) : 0;

  const displayName = formName || currentUser?.fullName || "User";
  const displayEmail = formEmail || currentUser?.username || "user@example.com";

  const handleSave = () => {
    const n = formName.trim(), e = formEmail.trim();
    if (!n || !e) { setEditError("Please fill in your name and email."); return; }
    const r = AuthUtils.updateCurrentProfile(n, e);
    if (!r.ok) { setEditError(r.message ?? "Unable to update profile."); return; }
    setEditError("");
    setIsEditing(false);
  };

  const handleSaveBody = () => {
    const next: UserProfileData = {
      ...profile,
      weight: Math.max(0, Number(bodyForm.weight) || 0),
      height: Math.max(0, Number(bodyForm.height) || 0),
      age: Math.max(0, Math.floor(Number(bodyForm.age) || 0)),
    };
    writeProfile(next);
    setProfile(next);
    setIsEditingBody(false);
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
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10">
              <UserCircle2 className="h-12 w-12 text-slate-400" />
            </div>
            <div className="min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="block w-full rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-lg font-bold text-white outline-none focus:border-emerald-500/60" />
                  <input type="text" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="block w-full rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-emerald-500/60" />
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
                <button type="button" onClick={() => { setIsEditing(false); setFormName(currentUser?.fullName ?? "User"); setFormEmail(currentUser?.username ?? "user@example.com"); setEditError(""); }} className="rounded-xl border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/12">Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => { setIsEditing(true); setEditError(""); }} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/12">
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </section>

        {/* ── Personal Info ── */}
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
          <StatCard icon={<Flame className="h-5 w-5 text-orange-400" />} label="Day Streak" value={String(profile.streak)} accent="orange" />
          <StatCard icon={<Dumbbell className="h-5 w-5 text-emerald-400" />} label="Total Exercises" value={String(te)} accent="emerald" />
          <StatCard icon={<Target className="h-5 w-5 text-blue-400" />} label="Active Plans" value={String(plans.length)} accent="blue" />
        </div>

        {/* ── Active Plans Row ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Workout Plan */}
          <section className="reveal-up reveal-delay-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Active Workout Plan</h2>
            </div>
            {activePlan ? (
              <div>
                <h3 className="mb-2 text-xl font-bold text-white">{activePlan.name}</h3>
                <div className="mb-4 flex flex-wrap gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{activePlan.days.length} {activePlan.days.length === 1 ? "day" : "days"}</span>
                  <span className="flex items-center gap-1.5"><Dumbbell className="h-3.5 w-3.5" />{activePlan.days.reduce((s, d) => s + d.exerciseIds.length, 0)} exercises</span>
                  <span className="flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" />{activePlan.workoutTracking.sets.length} sets tracked</span>
                </div>
                <Link to={`/gym-plan?planId=${activePlan.id}`} className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition-all hover:bg-emerald-500/25">
                  Open Plan
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center">
                <p className="mb-3 text-sm text-slate-400">No workout plans yet</p>
                <Link to="/gym-plan?new=1" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-400">Create Workout</Link>
              </div>
            )}
          </section>

          {/* Meal Plan */}
          <section className="reveal-up reveal-delay-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-orange-400" />
              <h2 className="text-lg font-bold text-white">Meal Plan Summary</h2>
            </div>
            {meal.count > 0 ? (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  <span className="text-2xl font-bold text-white">{mealKcal.toLocaleString()}</span>
                  <span className="text-sm text-slate-400">kcal / day</span>
                </div>
                <div className="mb-4 space-y-2.5">
                  <MacroRow label="Protein" value={`${meal.protein}g`} color="bg-emerald-500" />
                  <MacroRow label="Fats" value={`${meal.fats}g`} color="bg-amber-400" />
                  <MacroRow label="Carbs" value={`${meal.carbs}g`} color="bg-blue-400" />
                </div>
                {mealKcal > 0 ? (
                  <div className="mb-4">
                    <div className="flex h-2.5 overflow-hidden rounded-full">
                      <div className="bg-emerald-500 transition-all" style={{ width: `${protPct}%` }} />
                      <div className="bg-amber-400 transition-all" style={{ width: `${fatPct}%` }} />
                      <div className="bg-blue-400 transition-all" style={{ width: `${carbPct}%` }} />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
                      <span className="text-emerald-400">Protein {protPct}%</span>
                      <span className="text-amber-400">Fats {fatPct}%</span>
                      <span className="text-blue-400">Carbs {carbPct}%</span>
                    </div>
                  </div>
                ) : null}
                <Link to="/meal-plan" className="inline-flex items-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/15 px-4 py-2.5 text-sm font-semibold text-orange-200 transition-all hover:bg-orange-500/25">
                  Open Meal Plan
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center">
                <p className="mb-3 text-sm text-slate-400">No meal plan data</p>
                <Link to="/meal-plan" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400">Start Meal Plan</Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
