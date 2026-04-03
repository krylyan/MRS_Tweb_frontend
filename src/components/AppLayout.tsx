import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
