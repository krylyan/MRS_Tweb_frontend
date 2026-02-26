import React, { useState } from "react";
import { ChevronRight, Check } from "lucide-react";

export default function ExerciseSimplePlanner() {
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState({
    primary: null,
    secondary: null,
    finalization: null,
  });

  const muscleGroups = [
    { id: "spate", label: "🔙 Spate", emoji: "🔙" },
    { id: "piept", label: "💪 Piept", emoji: "💪" },
    { id: "mini", label: "✋ Mâini", emoji: "✋" },
    { id: "picioare", label: "🦵 Picioare", emoji: "🦵" },
    { id: "solduri", label: "🤸 Șolduri", emoji: "🤸" },
  ];

  const exerciseDatabase = {
    spate: {
      primary: [
        { name: "Trageri Larg", sets: 4, reps: 15, restSec: 60 },
        { name: "Deadlift Romainian", sets: 4, reps: 15, restSec: 75 },
        { name: "Flotări pe Bare", sets: 4, reps: 15, restSec: 60 },
        { name: "Trageri Verticale", sets: 4, reps: 15, restSec: 60 },
        { name: "Ridicări Pesi", sets: 4, reps: 15, restSec: 60 },
      ],
      secondary: [
        { name: "Trageri Îngust", sets: 4, reps: 15, restSec: 45 },
        { name: "Flotări Supalatine", sets: 4, reps: 15, restSec: 45 },
        { name: "Trageri Orizontale", sets: 4, reps: 15, restSec: 45 },
        { name: "Ridicări Greutăți", sets: 4, reps: 15, restSec: 45 },
        { name: "Trageri Suspendate", sets: 4, reps: 15, restSec: 45 },
      ],
      finalization: [
        { name: "Întindere Spate", sets: 3, reps: "30s", restSec: 20 },
        { name: "Stretching Larg", sets: 3, reps: "30s", restSec: 20 },
        { name: "Rotații Spate", sets: 3, reps: "15 rep", restSec: 20 },
      ],
    },
    piept: {
      primary: [
        { name: "Banca Plată", sets: 4, reps: 15, restSec: 75 },
        { name: "Banca Înclinată", sets: 4, reps: 15, restSec: 75 },
        { name: "Apărări cu Halterul", sets: 4, reps: 15, restSec: 60 },
        { name: "Presă pe Mașină", sets: 4, reps: 15, restSec: 60 },
        { name: "Push-ups Ponderate", sets: 4, reps: 15, restSec: 60 },
      ],
      secondary: [
        { name: "Fluturi Perineu", sets: 4, reps: 15, restSec: 45 },
        { name: "Apărări pe Mașină", sets: 4, reps: 15, restSec: 45 },
        { name: "Cable Flies", sets: 4, reps: 15, restSec: 45 },
        { name: "Presă Declinată", sets: 4, reps: 15, restSec: 45 },
        { name: "Smith Machine", sets: 4, reps: 15, restSec: 45 },
      ],
      finalization: [
        { name: "Întindere Piept", sets: 3, reps: "30s", restSec: 20 },
        { name: "Stretching Pectorali", sets: 3, reps: "30s", restSec: 20 },
        { name: "Relaxare Piept", sets: 3, reps: "30s", restSec: 20 },
      ],
    },
    mini: {
      primary: [
        { name: "Flexiuni cu Halterul", sets: 4, reps: 15, restSec: 45 },
        { name: "Extensii Tricep", sets: 4, reps: 15, restSec: 45 },
        { name: "Apare Dumbbell", sets: 4, reps: 15, restSec: 45 },
        { name: "Curl Barbell", sets: 4, reps: 15, restSec: 45 },
        { name: "Tricep Dips", sets: 4, reps: 15, restSec: 45 },
      ],
      secondary: [
        { name: "Flexiuni Cabluri", sets: 4, reps: 15, restSec: 30 },
        { name: "Hammer Curl", sets: 4, reps: 15, restSec: 30 },
        { name: "Extensii Cabluri", sets: 4, reps: 15, restSec: 30 },
        { name: "Bicep Machine", sets: 4, reps: 15, restSec: 30 },
        { name: "Tricep Rope", sets: 4, reps: 15, restSec: 30 },
      ],
      finalization: [
        { name: "Stretching Brațe", sets: 3, reps: "30s", restSec: 15 },
        { name: "Întindere Flexori", sets: 3, reps: "30s", restSec: 15 },
        { name: "Relaxare Brațe", sets: 3, reps: "30s", restSec: 15 },
      ],
    },
    picioare: {
      primary: [
        { name: "Genuflexiuni", sets: 4, reps: 15, restSec: 90 },
        { name: "Presa de Picioare", sets: 4, reps: 15, restSec: 90 },
        { name: "Leg Hack", sets: 4, reps: 15, restSec: 75 },
        { name: "Smucitură Deficit", sets: 4, reps: 15, restSec: 75 },
        { name: "Bulgarian Split", sets: 4, reps: 15, restSec: 60 },
      ],
      secondary: [
        { name: "Extensii Picioare", sets: 4, reps: 15, restSec: 45 },
        { name: "Flexiuni Picioare", sets: 4, reps: 15, restSec: 45 },
        { name: "Leg Curl Machine", sets: 4, reps: 15, restSec: 45 },
        { name: "Leg Press", sets: 4, reps: 15, restSec: 45 },
        { name: "V-Squat", sets: 4, reps: 15, restSec: 45 },
      ],
      finalization: [
        { name: "Întindere Picioare", sets: 3, reps: "30s", restSec: 25 },
        { name: "Stretching Genunchi", sets: 3, reps: "30s", restSec: 25 },
        { name: "Relaxare Gambe", sets: 3, reps: "30s", restSec: 25 },
      ],
    },
    solduri: {
      primary: [
        { name: "Ridicări Orizontale", sets: 4, reps: 15, restSec: 60 },
        { name: "Presă Umeri", sets: 4, reps: 15, restSec: 60 },
        { name: "Ridicări Laterale", sets: 4, reps: 15, restSec: 60 },
        { name: "Machine Shoulder", sets: 4, reps: 15, restSec: 60 },
        { name: "Upright Rows", sets: 4, reps: 15, restSec: 60 },
      ],
      secondary: [
        { name: "Ridicări Frontale", sets: 4, reps: 15, restSec: 45 },
        { name: "Dumbbell Press", sets: 4, reps: 15, restSec: 45 },
        { name: "Cable Raises", sets: 4, reps: 15, restSec: 45 },
        { name: "Shrug Machine", sets: 4, reps: 15, restSec: 45 },
        { name: "Lateral Flies", sets: 4, reps: 15, restSec: 45 },
      ],
      finalization: [
        { name: "Întindere Umeri", sets: 3, reps: "30s", restSec: 20 },
        { name: "Stretching Trapez", sets: 3, reps: "30s", restSec: 20 },
        { name: "Relaxare Umeri", sets: 3, reps: "30s", restSec: 20 },
      ],
    },
  };

  const handleSelectExercise = (type, exercise) => {
    setSelectedExercises((prev) => ({
      ...prev,
      [type]: prev[type]?.name === exercise.name ? null : exercise,
    }));
  };

  const resetMuscle = () => {
    setSelectedMuscle(null);
    setSelectedExercises({ primary: null, secondary: null, finalization: null });
  };

  if (selectedMuscle) {
    const muscleData = exerciseDatabase[selectedMuscle];
    const currentMuscle = muscleGroups.find((m) => m.id === selectedMuscle);

    return (
      <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-2xl p-8 border border-blue-600/30 h-full flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{currentMuscle.label}</h2>
          <button
            onClick={resetMuscle}
            className="px-3 py-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">Selectează câte un exercițiu din fiecare categorie</p>

        {/* EXERCIȚII DE BAZĂ */}
        <div className="mb-8 pb-8 border-b border-blue-600/30">
          <h3 className="text-lg font-bold text-green-300 mb-4">💚 Exerciții de Bază (4-5 opțiuni)</h3>
          <div className="space-y-2">
            {muscleData.primary.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectExercise("primary", ex)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedExercises.primary?.name === ex.name
                    ? "bg-green-500/30 border-green-500"
                    : "bg-gray-700/30 border-gray-600 hover:border-green-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{ex.name}</p>
                    <p className="text-gray-400 text-sm">
                      {ex.sets}x{ex.reps} • {ex.restSec}s pauză
                    </p>
                  </div>
                  {selectedExercises.primary?.name === ex.name && <Check className="w-5 h-5 text-green-300" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* EXERCIȚII SECUNDARE */}
        <div className="mb-8 pb-8 border-b border-blue-600/30">
          <h3 className="text-lg font-bold text-blue-300 mb-4">💙 Exerciții Secundare (4-5 opțiuni)</h3>
          <div className="space-y-2">
            {muscleData.secondary.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectExercise("secondary", ex)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedExercises.secondary?.name === ex.name
                    ? "bg-blue-500/30 border-blue-500"
                    : "bg-gray-700/30 border-gray-600 hover:border-blue-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{ex.name}</p>
                    <p className="text-gray-400 text-sm">
                      {ex.sets}x{ex.reps} • {ex.restSec}s pauză
                    </p>
                  </div>
                  {selectedExercises.secondary?.name === ex.name && <Check className="w-5 h-5 text-blue-300" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FINALIZARE/STRETCHING */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-purple-300 mb-4">💜 Finalizare & Stretching</h3>
          <div className="space-y-2">
            {muscleData.finalization.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectExercise("finalization", ex)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedExercises.finalization?.name === ex.name
                    ? "bg-purple-500/30 border-purple-500"
                    : "bg-gray-700/30 border-gray-600 hover:border-purple-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{ex.name}</p>
                    <p className="text-gray-400 text-sm">
                      {ex.sets}x{ex.reps} • {ex.restSec}s pauză
                    </p>
                  </div>
                  {selectedExercises.finalization?.name === ex.name && (
                    <Check className="w-5 h-5 text-purple-300" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Rezumat */}
        <div className="mt-auto pt-6 border-t border-blue-600/30 bg-gray-700/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-400 mb-2">Workout-ul tău astazi:</p>
          <div className="space-y-1 text-sm">
            {selectedExercises.primary && (
              <p className="text-green-300">
                ✓ <strong>{selectedExercises.primary.name}</strong>
              </p>
            )}
            {selectedExercises.secondary && (
              <p className="text-blue-300">
                ✓ <strong>{selectedExercises.secondary.name}</strong>
              </p>
            )}
            {selectedExercises.finalization && (
              <p className="text-purple-300">
                ✓ <strong>{selectedExercises.finalization.name}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Butoane */}
        <div className="flex gap-3">
          <button
            onClick={resetMuscle}
            className="flex-1 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg font-semibold transition-all"
          >
            ← Înapoi
          </button>
          <button className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold transition-all">
            ✅ Salvează
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-2xl p-8 border border-blue-600/30 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
        <span>💪</span> Selectează Grup Muscular
      </h2>
      <p className="text-gray-400 text-sm mb-8">Ce grupă dorești să antrenezi astazi?</p>

      {/* Selectare Grup Muscular */}
      <div className="grid grid-cols-1 gap-3 mb-8 flex-1 overflow-y-auto">
        {muscleGroups.map((muscle) => (
          <button
            key={muscle.id}
            onClick={() => setSelectedMuscle(muscle.id)}
            className="p-4 rounded-lg border-2 bg-gray-700/30 border-gray-600 hover:border-blue-500 hover:bg-gray-700/50 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">{muscle.label}</h3>
                <p className="text-gray-400 text-sm">Alege și selectează exercițiile</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-all" />
            </div>
          </button>
        ))}
      </div>

      {/* Info Bonus */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 text-sm text-gray-300">
        <p className="mb-2">
          💡 <strong>Cum funcționează?</strong>
        </p>
        <p className="text-xs text-gray-400">
          Selectează o grupă musculară, apoi alege exercițiile pe care vrei să le faci astazi din fiecare
          categorie (bază, secundar, finalizare).
        </p>
      </div>
    </div>
  );
}
