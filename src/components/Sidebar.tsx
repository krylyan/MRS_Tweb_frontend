import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarCheck2,
  ChevronDown,
  Dumbbell,
  HelpCircle,
  Home,
  LogOut,
  ShieldCheck,
  User,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthUtils from "../utils/authUtils";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnPlans = location.pathname === "/plans";
  const isAdminMode = AuthUtils.isAdminModeEnabled();
  const currentUser = AuthUtils.getCurrentUser();
  const isAdminAccount = currentUser?.role === "admin";

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

  const handleToggleAdminMode = () => {
    const enabled = AuthUtils.toggleAdminMode();
    navigate(enabled ? "/admin" : "/home", { replace: true });
  };

  const activeLinkClasses = isAdminMode
    ? "bg-amber-400/15 text-amber-200 shadow-lg shadow-amber-500/10"
    : "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10";

  const idleLinkClasses = "text-gray-400 hover:bg-white/5 hover:text-white";

  return (
    <aside
      className={`fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r backdrop-blur-md md:flex ${
        isAdminMode
          ? "border-amber-200/10 bg-[linear-gradient(180deg,rgba(41,37,36,0.98),rgba(17,24,39,0.98))]"
          : "border-white/10 bg-gray-950/95"
      }`}
    >
      <Link
        to="/home"
        className="flex items-center gap-3 px-6 py-7 transition-opacity hover:opacity-80"
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isAdminMode
              ? "bg-gradient-to-br from-amber-300 to-amber-500"
              : "bg-gradient-to-br from-emerald-400 to-emerald-600"
          }`}
        >
          <Dumbbell className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="block text-xl font-bold text-white">FitLife</span>
          {isAdminMode ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
              Admin mode
            </span>
          ) : null}
        </div>
      </Link>

      {isAdminAccount ? (
        <div className="px-3 pb-3">
          <div
            className={`rounded-2xl border px-4 py-4 ${
              isAdminMode
                ? "border-amber-300/20 bg-amber-300/10"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className={`h-4 w-4 ${isAdminMode ? "text-amber-200" : "text-emerald-300"}`} />
              <span className="text-sm font-semibold text-white">Special Admin Account</span>
            </div>
            <button
              type="button"
              onClick={handleToggleAdminMode}
              className={`flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all ${
                isAdminMode
                  ? "bg-amber-500 hover:bg-amber-400"
                  : "bg-emerald-500 hover:bg-emerald-400"
              }`}
            >
              {isAdminMode ? "Disable admin mode" : "Enable admin mode"}
            </button>
          </div>
        </div>
      ) : null}

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        <Link
          to="/home"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            location.pathname === "/home" ? activeLinkClasses : idleLinkClasses
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>

        {isAdminMode ? (
          <>
            <Link
              to="/admin"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                location.pathname === "/admin" ? activeLinkClasses : idleLinkClasses
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Admin Users</span>
            </Link>
            <Link
              to="/admin/exercises"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                location.pathname === "/admin/exercises" ? activeLinkClasses : idleLinkClasses
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>Admin Exercises</span>
            </Link>
            <Link
              to="/admin/meals"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                location.pathname === "/admin/meals" ? activeLinkClasses : idleLinkClasses
              }`}
            >
              <UtensilsCrossed className="h-5 w-5" />
              <span>Admin Meals</span>
            </Link>
          </>
        ) : (
          <div>
            <button
              type="button"
              onClick={handlePlansClick}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isOnPlans ? activeLinkClasses : idleLinkClasses
              }`}
            >
              <CalendarCheck2 className="h-5 w-5" />
              <span className="flex-1 text-left">My Plans</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${isPlansOpen ? "rotate-180" : ""}`}
              />
            </button>

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
                        ? isAdminMode
                          ? "bg-amber-400/10 text-amber-200"
                          : "bg-emerald-500/15 text-emerald-300"
                        : idleLinkClasses
                    }`}
                  >
                    <Dumbbell className="h-4 w-4" />
                    <span>Workout</span>
                  </Link>
                  <Link
                    to="/plans?tab=alimentation"
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isOnPlans && currentTab === "alimentation"
                        ? isAdminMode
                          ? "bg-amber-400/10 text-amber-200"
                          : "bg-emerald-500/15 text-emerald-300"
                        : idleLinkClasses
                    }`}
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    <span>Alimentation</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <Link
          to="/exercises"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            location.pathname === "/exercises" ? activeLinkClasses : idleLinkClasses
          }`}
        >
          <Dumbbell className="h-5 w-5" />
          <span>Exercises</span>
        </Link>

        <Link
          to="/meals"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            location.pathname === "/meals" ? activeLinkClasses : idleLinkClasses
          }`}
        >
          <UtensilsCrossed className="h-5 w-5" />
          <span>Meals</span>
        </Link>

        <Link
          to="/profile"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            location.pathname === "/profile" ? activeLinkClasses : idleLinkClasses
          }`}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Link>

        <Link
          to="/faq"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            location.pathname === "/faq" ? activeLinkClasses : idleLinkClasses
          }`}
        >
          <HelpCircle className="h-5 w-5" />
          <span>FAQ</span>
        </Link>
      </nav>

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
