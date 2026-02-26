import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutGrid } from "lucide-react";
import WorkoutPlanner from "../components/workout/WorkoutPlannerNew";

/**
 * Dashboard Page - Accessible after successful authentication
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const handleLogout = () => {
    // Curăță informațiile de login
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
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

      {activeSection === "overview" ? (
        <section className="px-6 md:px-12 py-24">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Welcome back!</h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
              Bine ai venit în FitLife! Selectează o secțiune pentru a continua cu planul tău de fitness și nutriție.
            </p>
          </div>

          {/* Secțiuni disponibile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Cardul pentru Antrenamente în Sala */}
            <button
              onClick={() => setActiveSection("gym")}
              className="group relative bg-gradient-to-br from-blue-900/30 to-blue-800/20 hover:from-blue-800/50 hover:to-blue-700/30 rounded-2xl p-8 border border-blue-600/30 hover:border-blue-500/60 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-blue-600/5 transition-all"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🏋️</div>
                <h2 className="text-2xl font-bold mb-2">Antrenamente în Sala</h2>
                <p className="text-gray-400 text-sm">Creează planul tău personalizat de antrenament</p>
                <div className="mt-4 inline-flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-3 transition-all">
                  Continuă <span>→</span>
                </div>
              </div>
            </button>

            {/* Carduri Pentru alte funcționalități (future) */}
            <button
              disabled
              className="group relative bg-gradient-to-br from-gray-700/30 to-gray-600/20 rounded-2xl p-8 border border-gray-600/30 text-left opacity-50 cursor-not-allowed"
            >
              <div className="relative z-10">
                <div className="text-5xl mb-4">📊</div>
                <h2 className="text-2xl font-bold mb-2">Progresul Tău</h2>
                <p className="text-gray-400 text-sm">Urmărește evoluția și performances</p>
                <div className="mt-4 inline-flex items-center gap-2 text-gray-500 font-semibold">
                  Curând <span>🔒</span>
                </div>
              </div>
            </button>
          </div>
        </section>
      ) : activeSection === "gym" ? (
        <section className="px-6 md:px-12 py-12">
          {/* Buton înapoi */}
          <button
            onClick={() => setActiveSection("overview")}
            className="mb-8 px-4 py-2 text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2 transition-all"
          >
            ← Înapoi la Dashboard
          </button>

          {/* Componenta WorkoutPlanner */}
          <WorkoutPlanner />
        </section>
      ) : null}
    </div>
  );
}
