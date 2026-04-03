import {
  CalendarCheck2,
  Dumbbell,
  HelpCircle,
  Home,
  LogOut,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthUtils from "../utils/authUtils";

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: Home, path: "/home" },
  { label: "My Plans", icon: CalendarCheck2, path: "/plans" },
  { label: "Exercises", icon: Dumbbell, path: "/gym-plan" },
  { label: "Profile", icon: User, path: "/profile" },
  { label: "FAQ", icon: HelpCircle, path: "/faq" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthUtils.logout();
    navigate("/signin", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/10 bg-gray-950/95 backdrop-blur-md">
      {/* Logo */}
      <Link
        to="/home"
        className="flex items-center gap-3 px-6 py-7 transition-opacity hover:opacity-80"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
          <Dumbbell className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">FitLife</span>
      </Link>

      {/* Navigation */}
      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-400"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
