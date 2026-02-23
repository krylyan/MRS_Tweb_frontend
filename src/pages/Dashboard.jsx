import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

/**
 * Dashboard Page - Accessible after successful authentication
 */
export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/signin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <nav className="flex items-center justify-between px-6 md:px-12 py-8 border-b border-white/10">
        <div className="text-2xl font-bold">Dashboard</div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-300 text-white font-semibold"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </nav>

      <section className="px-6 md:px-12 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">Welcome back!</h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          You have successfully signed in to FitLife. Your personalized fitness and nutrition dashboard will be available here soon.
        </p>
      </section>
    </div>
  );
}
