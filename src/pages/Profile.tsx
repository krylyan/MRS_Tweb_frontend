import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Dumbbell,
  Heart,
  Mail,
  ShieldCheck,
  User,
  UserCircle2,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";
import AuthUtils from "../utils/authUtils";

const USERS_KEY = "fitlife_users";
const SESSION_USER_KEY = "fitlife_session_user";

interface StatItem {
  label: string;
  value: number;
  widthClass: string;
}

const NUTRITION_STATS: StatItem[] = [
  { label: "Daily calories", value: 78, widthClass: "w-[78%]" },
  { label: "Protein intake", value: 86, widthClass: "w-[86%]" },
  { label: "Hydration", value: 64, widthClass: "w-[64%]" },
  { label: "Meal consistency", value: 72, widthClass: "w-[72%]" },
  { label: "Nutrition quality", value: 58, widthClass: "w-[58%]" },
];

const WORKOUT_STATS: StatItem[] = [
  { label: "Weekly sessions", value: 82, widthClass: "w-[82%]" },
  { label: "Cardio (minute)", value: 67, widthClass: "w-[67%]" },
  { label: "Strength progress", value: 74, widthClass: "w-[74%]" },
  { label: "Recovery", value: 61, widthClass: "w-[61%]" },
  { label: "Mobility", value: 55, widthClass: "w-[55%]" },
];

interface StatsCardProps {
  title: string;
  icon: LucideIcon;
  items: StatItem[];
}

function StatsCard({ title, icon: Icon, items }: StatsCardProps) {
  return (
    <section className="rounded-[14px] border border-white/12 bg-white/4 p-4 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
      <div className="mb-[10px] inline-flex items-center gap-2 text-emerald-300">
        <Icon size={18} />
        <p className="text-lg text-slate-50">{title}</p>
      </div>

      <div className="grid gap-[10px]">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs text-slate-200">{item.label}</p>
              <p className="text-xs font-semibold text-blue-300">{item.value}%</p>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/16">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 ${item.widthClass}`}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface UserRecord {
  fullName: string;
  password: string;
}

type UsersMap = Record<string, UserRecord>;

export default function Profile() {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [currentUser, setCurrentUser] = useState(AuthUtils.getCurrentUserEmail() ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [editError, setEditError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  let fullName = "";
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) ?? "{}") as UsersMap;
    fullName = users[currentUser]?.fullName ?? "";
  } catch {
    fullName = "";
  }

  const displayName = fullName || "John Doe";
  const displayEmail = currentUser || "fip@jukmuh.al";
  const role = currentUser === "admin" ? "Administrator" : "Full Stack Developer";
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`;

  useEffect(() => {
    setFormName(displayName);
    setFormEmail(displayEmail);
  }, [displayName, displayEmail]);

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

    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) ?? "{}") as UsersMap;
      const existing = users[currentUser];

      if (!existing) {
        setEditError("Current user was not found.");
        return;
      }

      if (nextEmail !== currentUser && users[nextEmail]) {
        setEditError("Email is already in use.");
        return;
      }

      if (nextEmail === currentUser) {
        users[currentUser] = { ...existing, fullName: nextName };
      } else {
        users[nextEmail] = { ...existing, fullName: nextName };
        delete users[currentUser];
        sessionStorage.setItem(SESSION_USER_KEY, nextEmail);
        setCurrentUser(nextEmail);
      }

      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      setEditError("");
      setIsEditing(false);
    } catch {
      setEditError("An error occurred while saving.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-slate-200">
      <nav className="flex items-center justify-between border-b border-white/10 px-[18px] py-6">
        <Link to="/home" className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-85">
          <div className="rounded-[10px] bg-gradient-to-br from-emerald-400 to-blue-500 p-2">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="text-[32px] font-bold leading-none text-white">FitLife</span>
        </Link>
      </nav>

      <div
        className={`mx-auto max-w-[1200px] px-[18px] pb-8 pt-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isLoaded ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.98] opacity-0"
        }`}
      >
        <h1 className="mb-[18px] text-[28px] font-bold text-slate-50">My Profile</h1>

        <div className="grid items-stretch gap-[18px] lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex">
            <section className="w-full rounded-[14px] border border-white/12 bg-white/4 p-6 text-center shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
              <div className="mx-auto mb-[14px] flex h-[130px] w-[130px] items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10">
                {avatarFailed ? (
                  <UserCircle2 className="h-[72px] w-[72px] text-slate-300" />
                ) : (
                  <img
                    src={avatarUrl}
                    alt={`${displayName} avatar`}
                    onError={() => setAvatarFailed(true)}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <p className="mb-1.5 text-[30px] leading-none text-slate-50">{displayName}</p>
              <p className="text-[15px] text-blue-300">{role}</p>
            </section>
          </aside>

          <div className="grid gap-[18px]">
            <section className="rounded-[14px] border border-white/12 bg-white/4 pb-3 pt-2 shadow-[0_14px_28px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
              <div className="grid items-center gap-[10px] border-b border-white/10 px-4 py-[14px] md:grid-cols-[165px_minmax(0,1fr)]">
                <p className="inline-flex items-center gap-2 font-semibold text-slate-50">
                  <User size={16} />
                  Full Name
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
                    className="w-full rounded-[10px] border border-white/20 bg-white/8 px-[10px] py-2 text-slate-50 outline-none"
                  />
                ) : (
                  <p className="break-words text-slate-300">{displayName}</p>
                )}
              </div>

              <div className="grid items-center gap-[10px] border-b border-white/10 px-4 py-[14px] md:grid-cols-[165px_minmax(0,1fr)]">
                <p className="inline-flex items-center gap-2 font-semibold text-slate-50">
                  <Mail size={16} />
                  Email
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formEmail}
                    onChange={(event) => setFormEmail(event.target.value)}
                    className="w-full rounded-[10px] border border-white/20 bg-white/8 px-[10px] py-2 text-slate-50 outline-none"
                  />
                ) : (
                  <p className="break-words text-slate-300">{displayEmail}</p>
                )}
              </div>

              <div className="grid items-center gap-[10px] px-4 py-[14px] md:grid-cols-[165px_minmax(0,1fr)]">
                <p className="inline-flex items-center gap-2 font-semibold text-slate-50">
                  <ShieldCheck size={16} />
                  Account Type
                </p>
                <p className="break-words text-slate-300">{role}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="rounded-[10px] border border-teal-600 bg-teal-500 px-3 py-[7px] text-[13px] leading-none text-white transition-colors duration-200 hover:bg-teal-600"
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
                      className="rounded-[10px] border border-white/25 bg-white/8 px-3 py-[7px] text-[13px] leading-none text-slate-300"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setEditError("");
                    }}
                    className="rounded-[10px] border border-teal-600 bg-teal-500 px-3 py-[7px] text-[13px] leading-none text-white transition-colors duration-200 hover:bg-teal-600"
                  >
                    Edit
                  </button>
                )}
                {editError ? <p className="w-full text-xs text-rose-300">{editError}</p> : null}
              </div>
            </section>

            <div className="grid gap-[18px] lg:grid-cols-2">
              <StatsCard title="Nutrition" icon={UtensilsCrossed} items={NUTRITION_STATS} />
              <StatsCard title="Workouts" icon={Dumbbell} items={WORKOUT_STATS} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

