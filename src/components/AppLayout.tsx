import {
  BookOpen,
  CalendarCheck2,
  Dumbbell,
  HelpCircle,
  Home,
  LogOut,
  User,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import AuthUtils from "../utils/authUtils";

interface MobileNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  activeOn?: string[];
}

function MobileNavigation({ isAdminMode }: { isAdminMode: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = AuthUtils.getCurrentUser();
  const isAdminAccount = currentUser?.role === "admin";

  const commonItems: MobileNavItem[] = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/faq", label: "FAQ", icon: HelpCircle },
  ];

  const userItems: MobileNavItem[] = [
    { to: "/plans", label: "Plans", icon: CalendarCheck2, activeOn: ["/plans", "/gym-plan", "/meal-plan"] },
    { to: "/exercises", label: "Exercises", icon: Dumbbell },
    { to: "/meals", label: "Meals", icon: UtensilsCrossed },
  ];

  const adminItems: MobileNavItem[] = isAdminAccount
    ? [
        { to: "/admin", label: "Users", icon: Users },
        { to: "/admin/exercises", label: "Exercises", icon: BookOpen },
        { to: "/admin/meals", label: "Meals", icon: UtensilsCrossed },
      ]
    : [];

  const navItems = isAdminMode ? [...commonItems, ...adminItems] : [commonItems[0], ...userItems, ...commonItems.slice(1)];

  const handleLogout = () => {
    AuthUtils.logout();
    navigate("/signin", { replace: true });
  };

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 rounded-2xl border border-white/10 bg-slate-950/[0.92] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.to || item.activeOn?.includes(location.pathname);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex min-w-[68px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-all ${
                isActive
                  ? isAdminMode
                    ? "bg-amber-400/15 text-amber-200"
                    : "bg-emerald-500/[0.18] text-emerald-200"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex min-w-[68px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default function AppLayout() {
  const isAdminMode = AuthUtils.isAdminModeEnabled();

  return (
    <div
      className={`flex min-h-screen text-white ${
        isAdminMode
          ? "bg-[linear-gradient(135deg,#1f2937_0%,#111827_45%,#2d1b05_100%)]"
          : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      }`}
    >
      <Sidebar />
      <main className="min-w-0 flex-1 pb-24 md:ml-64 md:pb-0">
        <Outlet />
      </main>
      <MobileNavigation isAdminMode={isAdminMode} />
    </div>
  );
}
