import React, { useState } from "react";
import { ChefHat, Clock } from "lucide-react";

export default function NutritionPlanner() {
  const [goal, setGoal] = useState("bulking"); // bulking sau cutting
  const [selectedDay, setSelectedDay] = useState("monday");

  const days = [
    { id: "monday", label: "Luni" },
    { id: "tuesday", label: "Marți" },
    { id: "wednesday", label: "Miercuri" },
    { id: "thursday", label: "Joi" },
    { id: "friday", label: "Vineri" },
    { id: "saturday", label: "Sâmbătă" },
    { id: "sunday", label: "Duminică" },
  ];

  const meals = {
    bulking: {
      breakfast: {
        name: "Mic Dejun",
        time: "07:00",
        content: "Omletă (3 ouă) + Toast integral + Zmeură",
        calories: 450,
        protein: 25,
        recipe: "1. Bate ouăle cu sare și piper\n2. Prăjește în tigaie\n3. Servi cu brânz",
      },
      lunch: {
        name: "Prânz",
        time: "13:00",
        content: "Piept de pui + Orez + Broccoli",
        calories: 650,
        protein: 45,
        recipe: "1. Gătește orezul 45 min\n2. Prăjește pieptul 20 min\n3. Cumpune farfuria",
      },
      dinner: {
        name: "Cină",
        time: "19:00",
        content: "Pește (somon) + Cartofi dulci + verdeață",
        calories: 550,
        protein: 35,
        recipe: "1. Coacă pești 25 min la 180°C\n2. Fierbe cartofii 25 min\n3. Servi cu ulei de măsline",
      },
    },
    cutting: {
      breakfast: {
        name: "Mic Dejun",
        time: "07:00",
        content: "Iaurt grecesc + Muesli + Afine",
        calories: 280,
        protein: 20,
        recipe: "1. Pune iaurtul în bol\n2. Adaugă muesli și fructe\n3. Servește imediat",
      },
      lunch: {
        name: "Prânz",
        time: "13:00",
        content: "Piept de pui + Salată + Lâtă",
        calories: 380,
        protein: 40,
        recipe: "1. Gătește pieptul pe grătar\n2. Taie legumele proaspete\n3. Condimentează ușor",
      },
      dinner: {
        name: "Cină",
        time: "19:00",
        content: "Pește: cod + Broccoli + Sfeclă",
        calories: 320,
        protein: 35,
        recipe: "1. Fierbe peștele 15 min\n2. Coacă broccoli-ul 20 min\n3. Asezonează cu lămâie",
      },
    },
  };

  const currentMeals = meals[goal];

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span>🍽️</span> Planificarea Nutriției
        </h2>
        <p className="text-gray-400 text-sm">Alimentație pe săptămână - Mic dejun, Prânz, Cină</p>
      </div>

      {/* Obiectiv - Bulking / Cutting */}
      <div className="mb-8 pb-8 border-b border-white/10">
        <p className="text-sm text-gray-400 mb-3">Obiectiv Nutrițional:</p>
        <div className="flex gap-3">
          <button
            onClick={() => setGoal("bulking")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              goal === "bulking"
                ? "bg-green-500/30 text-green-300 border border-green-500"
                : "bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50"
            }`}
          >
            💪 Creștere Masă (↑ Calorii)
          </button>
          <button
            onClick={() => setGoal("cutting")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              goal === "cutting"
                ? "bg-red-500/30 text-red-300 border border-red-500"
                : "bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50"
            }`}
          >
            🔥 Uscare (↓ Calorii)
          </button>
        </div>
      </div>

      {/* Zilele săptămânii */}
      <div className="mb-8 pb-8 border-b border-white/10">
        <p className="text-sm text-gray-400 mb-3">Selectează Ziua:</p>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {days.map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`px-2 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedDay === day.id
                  ? "bg-blue-500/40 text-blue-300 border border-blue-500"
                  : "bg-gray-700/50 text-gray-400 border border-gray-600 hover:bg-gray-600/50"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mese pe ziua selectată */}
      <div className="space-y-6">
        {/* Mic Dejun */}
        <div className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 rounded-xl p-6 border border-orange-600/30 hover:border-orange-500/60 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌅</span>
              <div>
                <h3 className="text-lg font-bold">{currentMeals.breakfast.name}</h3>
                <div className="flex items-center gap-2 text-orange-300 text-sm">
                  <Clock className="w-4 h-4" />
                  {currentMeals.breakfast.time}
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-200 mb-4 font-semibold">{currentMeals.breakfast.content}</p>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-orange-300 text-sm">Calorii</p>
              <p className="font-bold text-xl">{currentMeals.breakfast.calories}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-orange-300 text-sm">Proteină</p>
              <p className="font-bold text-xl">{currentMeals.breakfast.protein}g</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-orange-300 text-sm">Tip</p>
              <p className="font-bold text-sm">Mic Dejun</p>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4 mb-4 border border-gray-600">
            <p className="text-sm text-gray-400 font-semibold mb-2">Rețetă:</p>
            <p className="text-gray-300 whitespace-pre-line text-sm">{currentMeals.breakfast.recipe}</p>
          </div>

          <button className="w-full py-2 bg-orange-500/30 hover:bg-orange-500/50 text-orange-300 rounded-lg font-semibold transition-all">
            Adaugă la Cumpărături
          </button>
        </div>

        {/* Prânz */}
        <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-blue-600/30 hover:border-blue-500/60 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">☀️</span>
              <div>
                <h3 className="text-lg font-bold">{currentMeals.lunch.name}</h3>
                <div className="flex items-center gap-2 text-blue-300 text-sm">
                  <Clock className="w-4 h-4" />
                  {currentMeals.lunch.time}
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-200 mb-4 font-semibold">{currentMeals.lunch.content}</p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-blue-300 text-sm">Calorii</p>
              <p className="font-bold text-xl">{currentMeals.lunch.calories}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-blue-300 text-sm">Proteină</p>
              <p className="font-bold text-xl">{currentMeals.lunch.protein}g</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-blue-300 text-sm">Tip</p>
              <p className="font-bold text-sm">Principal</p>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4 mb-4 border border-gray-600">
            <p className="text-sm text-gray-400 font-semibold mb-2">Rețetă:</p>
            <p className="text-gray-300 whitespace-pre-line text-sm">{currentMeals.lunch.recipe}</p>
          </div>

          <button className="w-full py-2 bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 rounded-lg font-semibold transition-all">
            Adaugă la Cumpărături
          </button>
        </div>

        {/* Cină */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-600/30 hover:border-purple-500/60 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌙</span>
              <div>
                <h3 className="text-lg font-bold">{currentMeals.dinner.name}</h3>
                <div className="flex items-center gap-2 text-purple-300 text-sm">
                  <Clock className="w-4 h-4" />
                  {currentMeals.dinner.time}
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-200 mb-4 font-semibold">{currentMeals.dinner.content}</p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-purple-300 text-sm">Calorii</p>
              <p className="font-bold text-xl">{currentMeals.dinner.calories}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-purple-300 text-sm">Proteină</p>
              <p className="font-bold text-xl">{currentMeals.dinner.protein}g</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-purple-300 text-sm">Tip</p>
              <p className="font-bold text-sm">Seara</p>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4 mb-4 border border-gray-600">
            <p className="text-sm text-gray-400 font-semibold mb-2">Rețetă:</p>
            <p className="text-gray-300 whitespace-pre-line text-sm">{currentMeals.dinner.recipe}</p>
          </div>

          <button className="w-full py-2 bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 rounded-lg font-semibold transition-all">
            Adaugă la Cumpărături
          </button>
        </div>
      </div>

      {/* Rezumat zilei */}
      <div className="mt-8 pt-6 border-t border-white/10 bg-gray-700/20 rounded-xl p-6">
        <h3 className="font-bold mb-4">📊 Rezumat Nutrițional - {days.find(d => d.id === selectedDay)?.label}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Total Calorii</p>
            <p className="text-2xl font-bold text-orange-300">
              {currentMeals.breakfast.calories + currentMeals.lunch.calories + currentMeals.dinner.calories}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Total Proteină</p>
            <p className="text-2xl font-bold text-blue-300">
              {currentMeals.breakfast.protein + currentMeals.lunch.protein + currentMeals.dinner.protein}g
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Rație</p>
            <p className="text-2xl font-bold text-green-300">3 mese</p>
          </div>
        </div>
      </div>

      {/* Buton salvare */}
      <div className="mt-6">
        <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-semibold transition-all">
          Salvează Planul Nutrițional
        </button>
      </div>
    </div>
  );
}
