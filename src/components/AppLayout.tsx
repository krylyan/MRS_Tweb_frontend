import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AuthUtils from "../utils/authUtils";

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
      <main className="ml-64 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
