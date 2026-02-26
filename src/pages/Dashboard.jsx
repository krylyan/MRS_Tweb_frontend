import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Dumbbell, ChartColumn, ArrowRight, ChevronLeft } from "lucide-react";
import WorkoutPlanner from "../components/workout/WorkoutPlannerNew";

const pageStyle = {
  minHeight: "100vh",
  background: "#0b1220",
  color: "#ffffff",
  position: "relative",
  overflow: "hidden",
};

const overlayStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 1,
  pointerEvents: "none",
  background:
    "linear-gradient(135deg, rgba(2,6,23,0.42), rgba(15,23,42,0.5)), radial-gradient(circle at 20% 15%, rgba(255,255,255,0.08), rgba(255,255,255,0) 45%)",
};

const quadrantBase = {
  position: "absolute",
  zIndex: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  filter: "saturate(1.02) brightness(0.9) contrast(1.05)",
};

const cardPrimaryStyle = {
  background: "linear-gradient(145deg, rgba(30,58,138,0.32), rgba(15,23,42,0.78))",
  border: "1px solid rgba(59,130,246,0.55)",
  borderRadius: "1rem",
};

const cardSecondaryStyle = {
  background: "linear-gradient(145deg, rgba(30,41,59,0.74), rgba(15,23,42,0.78))",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "1rem",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [visualMode, setVisualMode] = useState("balanced");

  const isDarkMode = visualMode === "dark";

  const dynamicOverlayStyle = {
    ...overlayStyle,
    background: isDarkMode
      ? "linear-gradient(135deg, rgba(2,6,23,0.62), rgba(15,23,42,0.68))"
      : "linear-gradient(135deg, rgba(2,6,23,0.42), rgba(15,23,42,0.5)), radial-gradient(circle at 20% 15%, rgba(255,255,255,0.08), rgba(255,255,255,0) 45%)",
  };

  const dynamicQuadrantStyle = {
    ...quadrantBase,
    filter: isDarkMode
      ? "saturate(0.95) brightness(0.78) contrast(1.03)"
      : "saturate(1.02) brightness(0.9) contrast(1.05)",
  };

  const dynamicCardPrimaryStyle = {
    ...cardPrimaryStyle,
    background: isDarkMode
      ? "linear-gradient(145deg, rgba(30,58,138,0.42), rgba(15,23,42,0.88))"
      : "linear-gradient(145deg, rgba(30,58,138,0.32), rgba(15,23,42,0.78))",
  };

  const dynamicCardSecondaryStyle = {
    ...cardSecondaryStyle,
    background: isDarkMode
      ? "linear-gradient(145deg, rgba(30,41,59,0.84), rgba(15,23,42,0.86))"
      : "linear-gradient(145deg, rgba(30,41,59,0.74), rgba(15,23,42,0.78))",
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    navigate("/signin", { replace: true });
  };

  return (
    <div style={pageStyle}>
      <div
        aria-hidden
        style={{
          ...dynamicQuadrantStyle,
          top: 0,
          left: 0,
          width: "50%",
          height: "50%",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1571019613914-85f342c55f6b?auto=format&fit=crop&w=1400&q=80')",
        }}
      />
      <div
        aria-hidden
        style={{
          ...dynamicQuadrantStyle,
          top: 0,
          left: "50%",
          width: "50%",
          height: "50%",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1558611848-73f7eb4001ab?auto=format&fit=crop&w=1400&q=80')",
        }}
      />
      <div
        aria-hidden
        style={{
          ...dynamicQuadrantStyle,
          top: "50%",
          left: 0,
          width: "50%",
          height: "50%",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80')",
        }}
      />
      <div
        aria-hidden
        style={{
          ...dynamicQuadrantStyle,
          top: "50%",
          left: "50%",
          width: "50%",
          height: "50%",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&w=1400&q=80')",
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: "100%",
          height: "1px",
          background: "rgba(148,163,184,0.28)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: "1px",
          height: "100%",
          background: "rgba(148,163,184,0.28)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div aria-hidden style={dynamicOverlayStyle} />

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-8 border-b border-white/10">
        <div>
          <p style={{ color: "#93c5fd", marginBottom: 4 }}>FitLife Dashboard</p>
          <h1 className="text-2xl font-bold">Planul tau de fitness</h1>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="inline-flex rounded-lg p-1"
            style={{ background: "rgba(15,23,42,0.55)", border: "1px solid rgba(148,163,184,0.35)" }}
          >
            <button
              onClick={() => setVisualMode("balanced")}
              className="px-3 py-1.5 rounded-md text-sm font-semibold"
              style={{
                background: visualMode === "balanced" ? "rgba(59,130,246,0.35)" : "transparent",
                color: "#dbeafe",
              }}
            >
              Balanced
            </button>
            <button
              onClick={() => setVisualMode("dark")}
              className="px-3 py-1.5 rounded-md text-sm font-semibold"
              style={{
                background: visualMode === "dark" ? "rgba(59,130,246,0.35)" : "transparent",
                color: "#dbeafe",
              }}
            >
              Dark
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold"
            style={{ border: "1px solid rgba(239,68,68,0.45)", background: "rgba(239,68,68,0.2)", color: "#fff" }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </nav>

      {activeSection === "overview" ? (
        <section className="relative z-10 px-6 md:px-12 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl mb-12 mx-auto text-center">
              <h2 className="text-4xl md:text-7xl font-bold mb-6">Bine ai revenit!</h2>
              <p className="text-lg md:text-2xl" style={{ color: "#d1d5db" }}>
                Alege o sectiune ca sa continui cu planul tau personalizat de antrenament si nutritie.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              <button onClick={() => setActiveSection("gym")} className="p-8 text-left" style={dynamicCardPrimaryStyle}>
                <div className="mb-6 inline-flex p-3 rounded-lg" style={{ background: "rgba(59,130,246,0.22)", color: "#93c5fd" }}>
                  <Dumbbell className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold mb-3">Antrenamente in sala</h3>
                <p className="mb-6" style={{ color: "#d1d5db" }}>Creeaza planul tau personalizat de exercitii si nutritie.</p>
                <div className="inline-flex items-center gap-2 font-semibold" style={{ color: "#93c5fd" }}>
                  Continua
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              <div className="p-8 text-left" style={dynamicCardSecondaryStyle}>
                <div className="mb-6 inline-flex p-3 rounded-lg" style={{ background: "rgba(55,65,81,0.9)", color: "#d1d5db" }}>
                  <ChartColumn className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold mb-3">Progresul tau</h3>
                <p className="mb-6" style={{ color: "#9ca3af" }}>Urmareste evolutia, graficele si rezultatele saptamanale.</p>
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full" style={{ border: "1px solid rgba(156,163,175,0.7)", color: "#9ca3af" }}>
                  Curand disponibil
                </span>
              </div>
            </div>
          </div>
        </section>
      ) : activeSection === "gym" ? (
        <section className="relative z-10 px-6 md:px-12 py-12">
          <button onClick={() => setActiveSection("overview")} className="mb-8 px-4 py-2 font-semibold flex items-center gap-2" style={{ color: "#93c5fd" }}>
            <ChevronLeft className="w-4 h-4" />
            Inapoi la dashboard
          </button>

          <WorkoutPlanner />
        </section>
      ) : null}
    </div>
  );
}
