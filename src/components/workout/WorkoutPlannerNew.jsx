import React, { useState } from "react";
import { Plus, X, Save, Download, Share2, Apple, Dumbbell, Sparkles } from "lucide-react";
import NutritionCalculator from "./NutritionCalculator";
import ExerciseSimplePlannerFixed from "./ExerciseSimplePlannerFixed";

const panel = {
  background: "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(30,41,59,0.92))",
  border: "1px solid rgba(148,163,184,0.2)",
  borderRadius: "1rem",
  backdropFilter: "blur(6px)",
};

export default function WorkoutPlanner() {
  const [isPlanCreated, setIsPlanCreated] = useState(false);

  return (
    <div className="w-full text-white">
      {!isPlanCreated ? (
        <div className="flex items-center justify-center min-h-96 px-4">
          <div className="w-full max-w-5xl p-8 md:p-10" style={{ ...panel, border: "1px solid rgba(59,130,246,0.35)" }}>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.35)" }}>
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-blue-200">Start rapid</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">Creeaza-ti planul personalizat</h2>
            <p className="text-lg mb-8" style={{ color: "#d1d5db" }}>
              Nutritie + antrenamente intr-un singur ecran, cu pasi simpli si rezumat clar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              <div className="rounded-lg p-4 text-sm font-semibold" style={{ border: "1px solid rgba(249,115,22,0.4)", background: "rgba(249,115,22,0.16)" }}>Nutritie calibrata pe target</div>
              <div className="rounded-lg p-4 text-sm font-semibold" style={{ border: "1px solid rgba(59,130,246,0.4)", background: "rgba(59,130,246,0.16)" }}>Selectie antrenamente pe grupe</div>
              <div className="rounded-lg p-4 text-sm font-semibold" style={{ border: "1px solid rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.16)" }}>Rezumat usor de salvat</div>
            </div>

            <button
              onClick={() => setIsPlanCreated(true)}
              className="px-10 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3"
              style={{ background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 55%, #16a34a 100%)", color: "#fff" }}
            >
              <Plus className="w-6 h-6" />
              Creeaza planul meu
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Planul tau de fitness</h1>
              <p style={{ color: "#d1d5db" }}>Totul este aranjat pe doua coloane: nutritie la stanga, antrenament la dreapta.</p>
            </div>
            <button
              onClick={() => setIsPlanCreated(false)}
              className="p-3 rounded-lg transition-all"
              style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.35)" }}
              title="Inchide planul"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
            <div className="xl:col-span-7 p-4" style={panel}>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)" }}>
                <Apple className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-semibold text-emerald-200">Nutritie</span>
              </div>
              <NutritionCalculator />
            </div>

            <div className="xl:col-span-5 p-4" style={panel}>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.35)" }}>
                <Dumbbell className="w-4 h-4 text-blue-300" />
                <span className="text-xs font-semibold text-blue-200">Antrenament</span>
              </div>
              <ExerciseSimplePlannerFixed />
            </div>
          </div>

          <div className="p-6 md:p-8" style={panel}>
            <h2 className="text-2xl font-bold mb-5">Rezumatul planului tau</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg p-4" style={{ border: "1px solid rgba(59,130,246,0.35)", background: "rgba(59,130,246,0.14)" }}>
                <p className="text-sm mb-1" style={{ color: "#d1d5db" }}>Plan nutritional</p>
                <p className="text-3xl font-bold" style={{ color: "#93c5fd" }}>7 zile</p>
              </div>
              <div className="rounded-lg p-4" style={{ border: "1px solid rgba(249,115,22,0.35)", background: "rgba(249,115,22,0.14)" }}>
                <p className="text-sm mb-1" style={{ color: "#d1d5db" }}>Calorii zilnice</p>
                <p className="text-3xl font-bold" style={{ color: "#fdba74" }}>~1400</p>
              </div>
              <div className="rounded-lg p-4" style={{ border: "1px solid rgba(16,185,129,0.35)", background: "rgba(16,185,129,0.14)" }}>
                <p className="text-sm mb-1" style={{ color: "#d1d5db" }}>Antrenamente</p>
                <p className="text-3xl font-bold" style={{ color: "#6ee7b7" }}>6x/sapt</p>
              </div>
              <div className="rounded-lg p-4" style={{ border: "1px solid rgba(168,85,247,0.35)", background: "rgba(168,85,247,0.14)" }}>
                <p className="text-sm mb-1" style={{ color: "#d1d5db" }}>Intensitate</p>
                <p className="text-3xl font-bold" style={{ color: "#c4b5fd" }}>Mediu+</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <button className="flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(90deg,#16a34a,#059669)" }}>
                <Save className="w-4 h-4" />
                Salveaza planul
              </button>
              <button className="flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(90deg,#3b82f6,#2563eb)" }}>
                <Download className="w-4 h-4" />
                Descarca PDF
              </button>
              <button className="flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(90deg,#a855f7,#7c3aed)" }}>
                <Share2 className="w-4 h-4" />
                Partajeaza
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
