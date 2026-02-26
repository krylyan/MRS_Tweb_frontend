import React, { useState } from "react";
import { ChevronRight, Edit2 } from "lucide-react";

export default function ExercisePlanner() {
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [goal, setGoal] = useState("bulking"); // bulking sau cutting

  const muscleGroups = [
    { id: "back", label: "Spate", icon: "🔙" },
    { id: "chest", label: "Piept", icon: "💪" },
    { id: "arms", label: "Mâini", icon: "✋" },
    { id: "legs", label: "Picioare", icon: "🦵" },
    { id: "shoulders", label: "Șolduri", icon: "🤸" },
  ];

  const exercises = {
    back: {
      primary: { name: "Trageri Larg", sets: 4, reps: "8-10", difficulty: "Bază" },
      secondary: { name: "Trageri Îngust", sets: 3, reps: "12-15", difficulty: "Secundar" },
      tertiary: { name: "Întindere Spate", sets: 3, reps: "30 sec", difficulty: "Stretching" },
    },
    chest: {
      primary: { name: "Banca Plată", sets: 4, reps: "6-8", difficulty: "Bază" },
      secondary: { name: "Banca Înclinată", sets: 3, reps: "10-12", difficulty: "Secundar" },
      tertiary: { name: "Întindere Piept", sets: 3, reps: "30 sec", difficulty: "Stretching" },
    },
    arms: {
      primary: { name: "Flexiuni Ghioare", sets: 4, reps: "10-12", difficulty: "Bază" },
      secondary: { name: "Extensii Tricep", sets: 3, reps: "12-15", difficulty: "Secundar" },
      tertiary: { name: "Întindere Brațe", sets: 3, reps: "30 sec", difficulty: "Stretching" },
    },
    legs: {
      primary: { name: "Genuflexiuni", sets: 4, reps: "6-8", difficulty: "Bază" },
      secondary: { name: "Presa de Picioare", sets: 3, reps: "10-12", difficulty: "Secundar" },
      tertiary: { name: "Întindere Picioare", sets: 3, reps: "30 sec", difficulty: "Stretching" },
    },
    shoulders: {
      primary: { name: "Ridicări Orizontale", sets: 4, reps: "8-10", difficulty: "Bază" },
      secondary: { name: "Ridicări Laterale", sets: 3, reps: "12-15", difficulty: "Secundar" },
      tertiary: { name: "Întindere Umeri", sets: 3, reps: "30 sec", difficulty: "Stretching" },
    },
  };

  const currentExercises = selectedMuscle ? exercises[selectedMuscle] : null;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span>🏋️</span> Antrenamente
        </h2>
        <p className="text-gray-400 text-sm">Selectează grupul muscular pe care dorești să-l antrenezi</p>
      </div>

      {/* Obiectiv - Bulking / Cutting */}
      <div className="mb-8 pb-8 border-b border-white/10">
        <p className="text-sm text-gray-400 mb-3">Obiectiv:</p>
        <div className="flex gap-3">
          <button
            onClick={() => setGoal("bulking")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              goal === "bulking"
                ? "bg-green-500/30 text-green-300 border border-green-500"
                : "bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50"
            }`}
          >
            💪 Creștere Masă
          </button>
          <button
            onClick={() => setGoal("cutting")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              goal === "cutting"
                ? "bg-red-500/30 text-red-300 border border-red-500"
                : "bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50"
            }`}
          >
            🔥 Uscare
          </button>
        </div>
      </div>

      {/* Grupuri musculare */}
      {!selectedMuscle ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {muscleGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedMuscle(group.id)}
              className="p-6 bg-gray-700/50 rounded-xl border border-gray-600 hover:border-blue-500 hover:bg-gray-700/80 transition-all group"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{group.icon}</span>
                <div className="text-left flex-1">
                  <p className="font-semibold text-lg">{group.label}</p>
                  <p className="text-gray-400 text-sm">Apasă pentru a selecta</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-all" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          {/* Header cu buton back */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div>
              <button
                onClick={() => setSelectedMuscle(null)}
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2 mb-2"
              >
                ← Înapoi
              </button>
              <h3 className="text-2xl font-bold">
                {muscleGroups.find((g) => g.id === selectedMuscle)?.label}
              </h3>
              <p className="text-gray-400 text-sm">Exerciții pentru {goal === "bulking" ? "creștere" : "uscare"}</p>
            </div>
            <button className="p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-all">
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          {/* Exerciții în 4 cadrane */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exercițiu de Bază */}
            <div className="bg-gray-700/30 rounded-xl p-6 border-l-4 border-green-500">
              <p className="text-green-400 text-sm font-semibold mb-2">EXERCIȚIU DE BAZĂ</p>
              <h4 className="text-xl font-bold mb-4">{currentExercises.primary.name}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Serii:</span>
                  <span className="font-semibold">{currentExercises.primary.sets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Repetiții:</span>
                  <span className="font-semibold">{currentExercises.primary.reps}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Intensitate:</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">
                    {currentExercises.primary.difficulty}
                  </span>
                </div>
              </div>
              <button className="mt-4 w-full py-2 bg-green-500/30 hover:bg-green-500/50 text-green-300 rounded-lg font-semibold transition-all">
                Detalii
              </button>
            </div>

            {/* Exercițiu Secundar */}
            <div className="bg-gray-700/30 rounded-xl p-6 border-l-4 border-blue-500">
              <p className="text-blue-400 text-sm font-semibold mb-2">EXERCIȚIU SECUNDAR</p>
              <h4 className="text-xl font-bold mb-4">{currentExercises.secondary.name}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Serii:</span>
                  <span className="font-semibold">{currentExercises.secondary.sets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Repetiții:</span>
                  <span className="font-semibold">{currentExercises.secondary.reps}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Intensitate:</span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold">
                    {currentExercises.secondary.difficulty}
                  </span>
                </div>
              </div>
              <button className="mt-4 w-full py-2 bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 rounded-lg font-semibold transition-all">
                Detalii
              </button>
            </div>

            {/* Întindere - Stretching */}
            <div className="bg-gray-700/30 rounded-xl p-6 border-l-4 border-purple-500 md:col-span-2">
              <p className="text-purple-400 text-sm font-semibold mb-2">ÎNTINDERE ȘI FLEXIBILITATE</p>
              <h4 className="text-xl font-bold mb-4">{currentExercises.tertiary.name}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Serii:</span>
                  <span className="font-semibold">{currentExercises.tertiary.sets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Durată:</span>
                  <span className="font-semibold">{currentExercises.tertiary.reps}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tip:</span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
                    {currentExercises.tertiary.difficulty}
                  </span>
                </div>
              </div>
              <button className="mt-4 w-full py-2 bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 rounded-lg font-semibold transition-all">
                Detalii
              </button>
            </div>
          </div>

          {/* Buton de salvare */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold transition-all">
              Salvează Planul de Antrenament
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
