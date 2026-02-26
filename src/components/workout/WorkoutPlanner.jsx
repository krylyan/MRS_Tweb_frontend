import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import NutritionPlanner from "./NutritionPlanner";
import ExercisePlanner from "./ExercisePlanner";

export default function WorkoutPlanner() {
  const [isPlanCreated, setIsPlanCreated] = useState(false);

  return (
    <div className="w-full">
      {!isPlanCreated ? (
        // Vizualizare inițială - Butonul "Creaza Plan"
        <div className="flex items-center justify-center min-h-96 px-4">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-8xl mb-4">🎯</div>
              <h2 className="text-4xl font-bold mb-2">Creează-ți Planul de Antrenament</h2>
              <p className="text-gray-400 mb-6 text-lg">
                Construiește-ți propriul program personalizat cu nutriție și antrenamente
              </p>
            </div>
            <button
              onClick={() => setIsPlanCreated(true)}
              className="px-10 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
            >
              <Plus className="w-6 h-6" />
              Creează Planul Meu
            </button>
          </div>
        </div>
      ) : (
        // Vizualizare după apăsarea butonului - 2 Cadrane
        <div>
          {/* Header cu buton înapoi */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold">Planul Tău de Fitness</h1>
            <button
              onClick={() => setIsPlanCreated(false)}
              className="p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
              title="Închide planul"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 2 Cadrane principale */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cadranul 1 - Nutriție */}
            <div>
              <NutritionPlanner />
            </div>

            {/* Cadranul 2 - Antrenamente */}
            <div>
              <ExercisePlanner />
            </div>
          </div>

          {/* Sumar și Actiuni Finale */}
          <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-6">📋 Rezumatul Planului Tău</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <p className="text-gray-400 text-sm mb-2">Frecvență Antrenament</p>
                <p className="text-2xl font-bold text-blue-300">5x/săpt</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <p className="text-gray-400 text-sm mb-2">Calorii Zilnice</p>
                <p className="text-2xl font-bold text-orange-300">~1500</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <p className="text-gray-400 text-sm mb-2">Proteină Zilnică</p>
                <p className="text-2xl font-bold text-green-300">~100g</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <p className="text-gray-400 text-sm mb-2">Durata Antrenament</p>
                <p className="text-2xl font-bold text-purple-300">~60 min</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-semibold transition-all text-white">
                ✅ Salvează Planul
              </button>
              <button className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold transition-all text-white">
                📥 Descarcă ca PDF
              </button>
              <button className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg font-semibold transition-all text-white">
                📤 Partajează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
