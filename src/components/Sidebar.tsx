import { useEffect, useState } from "react";
import {
  CalendarCheck2,
  ChevronDown,
  Dumbbell,
  HelpCircle,
  Home,
  LogOut,
  UtensilsCrossed,
  User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthUtils from "../utils/authUtils";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnPlans = location.pathname === "/plans";

  const [isPlansOpen, setIsPlansOpen] = useState(isOnPlans);

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") ?? "workout";

  useEffect(() => {
    if (!isOnPlans) {
      setIsPlansOpen(false);
    } else {
      setIsPlansOpen(true);
    }
  }, [isOnPlans]);

  const handlePlansClick = () => {
    setIsPlansOpen((prev) => !prev);
  };

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
        {/* Dashboard */}
        <Link
          to="/home"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            location.pathname === "/home"
              ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>

        {/* My Plans with expandable sub-menu */}
        <div>
          <button
            type="button"
            onClick={handlePlansClick}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              isOnPlans
                ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <CalendarCheck2 className="h-5 w-5" />
            <span className="flex-1 text-left">My Plans</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${isPlansOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Smooth expand/collapse using CSS grid trick */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isPlansOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="py-1 pl-3">
                <Link
                  to="/plans?tab=workout"
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isOnPlans && currentTab === "workout"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Dumbbell className="h-4 w-4" />
                  <span>Workout</span>
                </Link>
                <Link
                  to="/plans?tab=alimentation"
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isOnPlans && currentTab === "alimentation"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>Alimentation</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Exercises */}
        <Link
          to="/exercises"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            location.pathname === "/exercises"
              ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Dumbbell className="h-5 w-5" />
          <span>Exercises</span>
        </Link>

        <Link
          to="/meals"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            location.pathname === "/meals"
              ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <UtensilsCrossed className="h-5 w-5" />
          <span>Meals</span>
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            location.pathname === "/profile"
              ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Link>

        {/* FAQ */}
        <Link
          to="/faq"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            location.pathname === "/faq"
              ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <HelpCircle className="h-5 w-5" />
          <span>FAQ</span>
        </Link>
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
