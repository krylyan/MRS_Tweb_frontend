import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function NutritionCalculator() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [proteine, setProteine] = useState(150);
  const [carbohidrati, setCarbohidrati] = useState(200);
  const [greutate, setGreutate] = useState(80);
  const [plan, setPlan] = useState(null);

  // Calculeaza caloriile: Proteine (4 cal/g) + Carbohidrați (4 cal/g)
  const calculeazaCalorii = (p, c) => {
    return Math.round(p * 4 + c * 4);
  };

  const caloriiTotale = calculeazaCalorii(proteine, carbohidrati);

  const genereazaPlan = () => {
    if (proteine < 50 || carbohidrati < 50) {
      alert("Proteina și carbohidrații trebuie să fie minim 50g");
      return;
    }

    setIsCalculating(true);

    // Genereaza plan nutrițional pe 7 zile
    const zile = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
    const mese = {
      breakfast: {
        name: "Mic Dejun",
        time: "07:00",
        icon: "🌅",
      },
      lunch: {
        name: "Prânz",
        time: "13:00",
        icon: "☀️",
      },
      dinner: {
        name: "Cină",
        time: "19:00",
        icon: "🌙",
      },
    };

    const planZile = zile.map((zi) => ({
      zi,
      mese: [
        {
          ...mese.breakfast,
          proteine: Math.round(proteine / 3),
          carbohidrati: Math.round(carbohidrati / 3),
          calorii: calculeazaCalorii(Math.round(proteine / 3), Math.round(carbohidrati / 3)),
          continut: "Omletă + Orez + Struguri",
        },
        {
          ...mese.lunch,
          proteine: Math.round(proteine / 3),
          carbohidrati: Math.round(carbohidrati / 3),
          calorii: calculeazaCalorii(Math.round(proteine / 3), Math.round(carbohidrati / 3)),
          continut: "Piept de pui + Cartofi + Verdeață",
        },
        {
          ...mese.dinner,
          proteine: Math.round(proteine / 3),
          carbohidrati: Math.round(carbohidrati / 3),
          calorii: calculeazaCalorii(Math.round(proteine / 3), Math.round(carbohidrati / 3)),
          continut: "Pește + Broccoli + Orez integral",
        },
      ],
    }));

    setTimeout(() => {
      setPlan(planZile);
      setIsCalculating(false);
    }, 600);
  };

  if (plan) {
    const totalProt = plan[0].mese.reduce((a, m) => a + m.proteine, 0) * 3;
    const totalCarb = plan[0].mese.reduce((a, m) => a + m.carbohidrati, 0) * 3;
    const totalCal = plan[0].mese.reduce((a, m) => a + m.calorii, 0) * 3;

    return (
      <div className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-2xl p-8 border border-green-600/30 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span>📋</span> Plan Nutrițional 7 Zile
          </h2>
          <button
            onClick={() => setPlan(null)}
            className="text-gray-400 hover:text-white text-2xl rounded-lg hover:bg-gray-700 p-1 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Info General */}
        <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-green-600/30 text-center text-sm">
          <div>
            <p className="text-gray-400">Total Proteine</p>
            <p className="font-bold text-blue-300">{totalProt}g</p>
          </div>
          <div>
            <p className="text-gray-400">Total Carbohidrați</p>
            <p className="font-bold text-orange-300">{totalCarb}g</p>
          </div>
          <div>
            <p className="text-gray-400">Total Calorii</p>
            <p className="font-bold text-green-300">{totalCal}</p>
          </div>
        </div>

        {/* Grid Orizontal - 7 ZILE */}
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="grid grid-cols-7 gap-3 min-w-max lg:min-w-full">
            {plan.map((ziPlan, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-b from-gray-700/40 to-gray-800/30 rounded-lg p-4 border border-green-600/30 hover:border-green-500/60 transition-all min-w-[160px]"
              >
                {/* Header Zi */}
                <h3 className="font-bold text-green-300 mb-4 text-center text-sm pb-2 border-b border-green-600/30">
                  {ziPlan.zi}
                </h3>

                {/* Mese */}
                <div className="space-y-3">
                  {ziPlan.mese.map((masa, mIdx) => (
                    <div key={mIdx} className="bg-gray-800/50 rounded p-2 border-l-2 border-green-500 text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-lg">{masa.icon}</span>
                        <span className="font-semibold text-white truncate text-xs">{masa.name}</span>
                      </div>
                      <p className="text-gray-300 mb-2 text-xs leading-tight">{masa.continut}</p>
                      <div className="space-y-1">
                        <div className="flex gap-1 text-xs">
                          <span className="bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded">
                            P: {masa.proteine}g
                          </span>
                        </div>
                        <div className="flex gap-1 text-xs">
                          <span className="bg-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded">
                            C: {masa.carbohidrati}g
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rezumat Zi */}
                <div className="mt-3 pt-3 border-t border-gray-600 text-xs font-semibold space-y-1">
                  <div className="text-green-300">Total: {ziPlan.mese.reduce((a, m) => a + m.calorii, 0)} cal</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Butoane */}
        <div className="flex gap-3 pt-6 border-t border-green-600/30">
          <button
            onClick={() => setPlan(null)}
            className="flex-1 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg font-semibold transition-all"
          >
            ← Modifică
          </button>
          <button className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg font-semibold transition-all">
            ✅ Salvează
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-2xl p-8 border border-green-600/30 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
        <span>🍎</span> Calculator Nutriție
      </h2>
      <p className="text-gray-400 text-sm mb-8">Setează macronutrienții zilnici</p>

      {/* Greutate utilizator */}
      <div className="mb-6 pb-6 border-b border-green-600/30">
        <label className="text-sm text-gray-400 font-semibold mb-2 block">
          Greutatea (kg)
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGreutate(Math.max(40, greutate - 5))}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={greutate}
            onChange={(e) => setGreutate(Math.max(40, parseInt(e.target.value) || 0))}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-center font-bold text-white"
          />
          <button
            onClick={() => setGreutate(greutate + 5)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Proteine */}
      <div className="mb-6 pb-6 border-b border-green-600/30">
        <label className="text-sm text-gray-400 font-semibold mb-2 block">
          Proteine (g/zi)
        </label>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setProteine(Math.max(50, proteine - 10))}
            className="p-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 transition-all"
          >
            <Minus className="w-4 h-4 text-blue-300" />
          </button>
          <input
            type="number"
            value={proteine}
            onChange={(e) => setProteine(Math.max(50, parseInt(e.target.value) || 0))}
            className="flex-1 bg-gray-700 border border-blue-600 rounded-lg px-4 py-2 text-center font-bold text-white"
          />
          <button
            onClick={() => setProteine(proteine + 10)}
            className="p-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 transition-all"
          >
            <Plus className="w-4 h-4 text-blue-300" />
          </button>
        </div>
        <p className="text-blue-300 text-xs">
          Recomandare: {Math.round(greutate * 1.6)} - {Math.round(greutate * 2.2)}g
        </p>
      </div>

      {/* Carbohidrați */}
      <div className="mb-8 pb-8 border-b border-green-600/30">
        <label className="text-sm text-gray-400 font-semibold mb-2 block">
          Carbohidrați (g/zi)
        </label>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setCarbohidrati(Math.max(50, carbohidrati - 10))}
            className="p-2 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 transition-all"
          >
            <Minus className="w-4 h-4 text-orange-300" />
          </button>
          <input
            type="number"
            value={carbohidrati}
            onChange={(e) => setCarbohidrati(Math.max(50, parseInt(e.target.value) || 0))}
            className="flex-1 bg-gray-700 border border-orange-600 rounded-lg px-4 py-2 text-center font-bold text-white"
          />
          <button
            onClick={() => setCarbohidrati(carbohidrati + 10)}
            className="p-2 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 transition-all"
          >
            <Plus className="w-4 h-4 text-orange-300" />
          </button>
        </div>
        <p className="text-orange-300 text-xs">
          Recomandare: {Math.round(greutate * 3)} - {Math.round(greutate * 5)}g
        </p>
      </div>

      {/* Rezumat */}
      <div className="bg-gradient-to-r from-blue-900/30 to-orange-900/30 rounded-lg p-4 mb-6 border border-green-600/30">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-gray-400 text-xs mb-1">Proteine</p>
            <p className="font-bold text-blue-300 text-lg">{proteine}g</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Carbohidrați</p>
            <p className="font-bold text-orange-300 text-lg">{carbohidrati}g</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Calorii</p>
            <p className="font-bold text-green-300 text-lg">{caloriiTotale}</p>
          </div>
        </div>
      </div>

      {/* Buton Creează */}
      <button
        onClick={genereazaPlan}
        disabled={isCalculating}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 rounded-lg font-bold transition-all transform hover:scale-105"
      >
        {isCalculating ? "Se generează..." : "🎯 Creează Plan"}
      </button>
    </div>
  );
}
