import React, { useState } from "react";
import { Plus, Minus, RotateCcw, ChevronDown } from "lucide-react";

const zileSaptamana = ["Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata", "Duminica"];

const meniuri = {
  breakfast: [
    {
      name: "Omleta cu ovaz",
      ingredients: [
        { item: "Oua", grams: 180 },
        { item: "Fulgi de ovaz", grams: 70 },
        { item: "Banana", grams: 100 },
      ],
      steps: [
        "Bate ouale si gateste omleta la foc mediu.",
        "Fierbe ovazul 5-7 minute cu apa.",
        "Serveste cu banana feliata.",
      ],
    },
    {
      name: "Iaurt grecesc cu granola",
      ingredients: [
        { item: "Iaurt grecesc 2%", grams: 250 },
        { item: "Granola", grams: 60 },
        { item: "Fructe de padure", grams: 120 },
      ],
      steps: [
        "Pune iaurtul intr-un bol.",
        "Adauga granola si fructele de padure.",
        "Amesteca usor si consuma imediat.",
      ],
    },
    {
      name: "Toast proteic",
      ingredients: [
        { item: "Paine integrala", grams: 100 },
        { item: "Branza cottage", grams: 180 },
        { item: "Rosii", grams: 120 },
      ],
      steps: [
        "Prajeste painea 2-3 minute.",
        "Intinde branza cottage pe felii.",
        "Adauga rosii feliate deasupra.",
      ],
    },
    {
      name: "Terci cu lapte si mar",
      ingredients: [
        { item: "Fulgi de ovaz", grams: 75 },
        { item: "Lapte 1.5%", grams: 250 },
        { item: "Mar", grams: 140 },
      ],
      steps: [
        "Fierbe ovazul in lapte 6-8 minute.",
        "Rade marul si adauga-l peste terci.",
        "Amesteca si lasa 1 minut sa se lege.",
      ],
    },
    {
      name: "Clatite din ovaz",
      ingredients: [
        { item: "Faina de ovaz", grams: 80 },
        { item: "Oua", grams: 120 },
        { item: "Iaurt", grams: 120 },
      ],
      steps: [
        "Amesteca ingredientele pana devin aluat.",
        "Coace clatitele pe tigaie antiaderenta.",
        "Serveste cu iaurt deasupra.",
      ],
    },
    {
      name: "Budinca de chia",
      ingredients: [
        { item: "Seminte chia", grams: 35 },
        { item: "Lapte", grams: 260 },
        { item: "Mango", grams: 120 },
      ],
      steps: [
        "Lasa chia in lapte minim 4 ore.",
        "Taie mango cuburi.",
        "Serveste budinca cu mango deasupra.",
      ],
    },
    {
      name: "Sandwich cu ton",
      ingredients: [
        { item: "Paine integrala", grams: 110 },
        { item: "Ton in suc propriu", grams: 140 },
        { item: "Castravete", grams: 100 },
      ],
      steps: [
        "Scurge tonul si amesteca usor.",
        "Umple sandwich-ul cu ton si castravete.",
        "Taie in doua si serveste.",
      ],
    },
  ],
  lunch: [
    {
      name: "Pui cu orez si legume",
      ingredients: [
        { item: "Piept de pui", grams: 220 },
        { item: "Orez", grams: 120 },
        { item: "Legume mix", grams: 180 },
      ],
      steps: [
        "Fierbe orezul conform instructiunilor.",
        "Gateste puiul la grill 6-8 minute pe parte.",
        "Soteaza legumele 4-5 minute.",
      ],
    },
    {
      name: "Curcan cu cartof dulce",
      ingredients: [
        { item: "Piept de curcan", grams: 220 },
        { item: "Cartof dulce", grams: 280 },
        { item: "Salata verde", grams: 120 },
      ],
      steps: [
        "Coace cartoful dulce 30 minute la 200C.",
        "Frige curcanul pe tigaie grill.",
        "Serveste cu salata proaspata.",
      ],
    },
    {
      name: "Vita cu quinoa",
      ingredients: [
        { item: "Carne de vita slaba", grams: 200 },
        { item: "Quinoa", grams: 110 },
        { item: "Broccoli", grams: 180 },
      ],
      steps: [
        "Fierbe quinoa 12-15 minute.",
        "Frige vita la foc iute 4-5 minute.",
        "Fierbe broccoli la abur 5 minute.",
      ],
    },
    {
      name: "Somon cu couscous",
      ingredients: [
        { item: "Somon", grams: 210 },
        { item: "Couscous", grams: 110 },
        { item: "Dovlecel", grams: 180 },
      ],
      steps: [
        "Coace somonul 15 minute la 190C.",
        "Hidrateaza couscous-ul 5 minute.",
        "Soteaza dovlecelul cu putina sare.",
      ],
    },
    {
      name: "Pui cu paste integrale",
      ingredients: [
        { item: "Piept de pui", grams: 210 },
        { item: "Paste integrale", grams: 120 },
        { item: "Sos rosii", grams: 100 },
      ],
      steps: [
        "Fierbe pastele conform ambalajului.",
        "Gateste puiul cuburi pe tigaie.",
        "Amesteca pastele cu sosul si puiul.",
      ],
    },
    {
      name: "Bowl cu naut si ton",
      ingredients: [
        { item: "Ton in suc propriu", grams: 160 },
        { item: "Naut fiert", grams: 180 },
        { item: "Ardei gras", grams: 120 },
      ],
      steps: [
        "Scurge tonul si nautul.",
        "Taie ardeiul cuburi.",
        "Amesteca totul intr-un bol mare.",
      ],
    },
    {
      name: "Pulpa curcan cu bulgur",
      ingredients: [
        { item: "Pulpa de curcan dezosata", grams: 220 },
        { item: "Bulgur", grams: 120 },
        { item: "Morcov", grams: 130 },
      ],
      steps: [
        "Gateste curcanul la cuptor 30 minute.",
        "Fierbe bulgurul 12 minute.",
        "Soteaza morcovul feliat subtire.",
      ],
    },
  ],
  dinner: [
    {
      name: "Peste alb cu cartofi",
      ingredients: [
        { item: "File peste alb", grams: 220 },
        { item: "Cartofi", grams: 220 },
        { item: "Salata", grams: 120 },
      ],
      steps: [
        "Coace pestele 15 minute.",
        "Fierbe cartofii pana devin moi.",
        "Serveste cu salata simpla.",
      ],
    },
    {
      name: "Omleta cu legume",
      ingredients: [
        { item: "Oua", grams: 200 },
        { item: "Ardei", grams: 100 },
        { item: "Ciuperci", grams: 120 },
      ],
      steps: [
        "Soteaza legumele 3-4 minute.",
        "Adauga ouale batute.",
        "Gateste omleta pana se incheaga.",
      ],
    },
    {
      name: "Curcan cu fasole verde",
      ingredients: [
        { item: "Curcan", grams: 200 },
        { item: "Fasole verde", grams: 220 },
        { item: "Orez basmati", grams: 90 },
      ],
      steps: [
        "Fierbe orezul separat.",
        "Gateste curcanul pe grill.",
        "Soteaza fasolea verde 5 minute.",
      ],
    },
    {
      name: "Tofu cu orez si broccoli",
      ingredients: [
        { item: "Tofu", grams: 220 },
        { item: "Orez", grams: 100 },
        { item: "Broccoli", grams: 200 },
      ],
      steps: [
        "Rumeste tofu pe tigaie antiaderenta.",
        "Fierbe orezul separat.",
        "Gateste broccoli la abur.",
      ],
    },
    {
      name: "Somon cu sparanghel",
      ingredients: [
        { item: "Somon", grams: 200 },
        { item: "Sparanghel", grams: 180 },
        { item: "Cartof copt", grams: 200 },
      ],
      steps: [
        "Coace somonul si cartoful in cuptor.",
        "Trage sparanghelul la tigaie 3 minute.",
        "Asaza ingredientele in farfurie.",
      ],
    },
    {
      name: "Pui cu salata de quinoa",
      ingredients: [
        { item: "Pui", grams: 200 },
        { item: "Quinoa", grams: 90 },
        { item: "Rosii", grams: 130 },
      ],
      steps: [
        "Fierbe quinoa 12 minute.",
        "Gateste puiul cuburi pe grill.",
        "Amesteca quinoa cu rosii taiate.",
      ],
    },
    {
      name: "Vita cu legume wok",
      ingredients: [
        { item: "Vita slaba", grams: 190 },
        { item: "Mix legume wok", grams: 250 },
        { item: "Taitei orez", grams: 80 },
      ],
      steps: [
        "Fierbe taiteii conform instructiunilor.",
        "Gateste vita rapid la foc mare.",
        "Adauga legumele si amesteca 4 minute.",
      ],
    },
  ],
};

function StepInput({ label, value, setValue, step, min, hint, tone }) {
  return (
    <div
      className="p-4"
      style={{
        borderRadius: "0.75rem",
        border: `1px solid ${tone.border}`,
        background: tone.bg,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold">{label}</p>
        <p className="text-sm" style={{ color: "#cbd5e1" }}>{hint}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setValue(Math.max(min, value - step))}
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.35)",
            background: "rgba(15,23,42,0.7)",
          }}
        >
          <Minus className="w-4 h-4 mx-auto" />
        </button>

        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Math.max(min, parseInt(e.target.value, 10) || 0))}
          className="flex-1 text-center font-bold"
          style={{
            height: 42,
            borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.35)",
            background: "rgba(15,23,42,0.8)",
            color: "#ffffff",
          }}
        />

        <button
          onClick={() => setValue(value + step)}
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.35)",
            background: "rgba(15,23,42,0.7)",
          }}
        >
          <Plus className="w-4 h-4 mx-auto" />
        </button>
      </div>
    </div>
  );
}

export default function NutritionCalculator() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [proteine, setProteine] = useState(150);
  const [carbohidrati, setCarbohidrati] = useState(200);
  const [greutate, setGreutate] = useState(80);
  const [plan, setPlan] = useState(null);
  const [openRecipe, setOpenRecipe] = useState({});

  const calculeazaCalorii = (p, c) => Math.round(p * 4 + c * 4);
  const caloriiTotale = calculeazaCalorii(proteine, carbohidrati);

  const toggleRecipe = (key) => {
    setOpenRecipe((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const genereazaPlan = () => {
    if (proteine < 50 || carbohidrati < 50) {
      alert("Proteina si carbohidratii trebuie sa fie minim 50g");
      return;
    }

    setIsCalculating(true);

    const distributie = {
      breakfast: { p: 0.3, c: 0.3 },
      lunch: { p: 0.4, c: 0.4 },
      dinner: { p: 0.3, c: 0.3 },
    };

    const planZile = zileSaptamana.map((zi, indexZi) => {
      const breakfastData = meniuri.breakfast[indexZi];
      const lunchData = meniuri.lunch[indexZi];
      const dinnerData = meniuri.dinner[indexZi];

      const meals = [
        {
          name: "Mic dejun",
          dish: breakfastData.name,
          proteine: Math.round(proteine * distributie.breakfast.p),
          carbohidrati: Math.round(carbohidrati * distributie.breakfast.c),
          ingredients: breakfastData.ingredients,
          steps: breakfastData.steps,
        },
        {
          name: "Pranz",
          dish: lunchData.name,
          proteine: Math.round(proteine * distributie.lunch.p),
          carbohidrati: Math.round(carbohidrati * distributie.lunch.c),
          ingredients: lunchData.ingredients,
          steps: lunchData.steps,
        },
        {
          name: "Cina",
          dish: dinnerData.name,
          proteine: Math.round(proteine * distributie.dinner.p),
          carbohidrati: Math.round(carbohidrati * distributie.dinner.c),
          ingredients: dinnerData.ingredients,
          steps: dinnerData.steps,
        },
      ].map((meal) => ({
        ...meal,
        calorii: calculeazaCalorii(meal.proteine, meal.carbohidrati),
      }));

      return { zi, mese: meals };
    });

    setTimeout(() => {
      setPlan(planZile);
      setOpenRecipe({});
      setIsCalculating(false);
    }, 500);
  };

  if (plan) {
    return (
      <div
        className="p-5"
        style={{
          borderRadius: "1rem",
          background: "rgba(2,6,23,0.58)",
          border: "1px solid rgba(16,185,129,0.35)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold">Plan nutritional 7 zile</h2>
          <button
            onClick={() => setPlan(null)}
            className="inline-flex items-center gap-2 px-3 py-2"
            style={{
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.35)",
              background: "rgba(30,41,59,0.68)",
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Refa
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plan.map((ziPlan, ziIdx) => (
            <div
              key={ziPlan.zi}
              className="p-4"
              style={{
                borderRadius: "0.75rem",
                border: "1px solid rgba(16,185,129,0.3)",
                background: "rgba(15,23,42,0.7)",
              }}
            >
              <p className="font-bold mb-2 text-emerald-300">{ziPlan.zi}</p>
              <div className="space-y-2">
                {ziPlan.mese.map((masa, mealIdx) => {
                  const key = `${ziIdx}-${mealIdx}`;
                  const isOpen = !!openRecipe[key];
                  return (
                    <div
                      key={masa.name}
                      className="p-3"
                      style={{
                        borderRadius: 10,
                        border: "1px solid rgba(148,163,184,0.25)",
                        background: "rgba(30,41,59,0.72)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm">{masa.name}</p>
                          <p className="text-sm mb-1" style={{ color: "#e2e8f0" }}>{masa.dish}</p>
                          <p className="text-xs" style={{ color: "#93c5fd" }}>P: {masa.proteine}g</p>
                          <p className="text-xs" style={{ color: "#fdba74" }}>C: {masa.carbohidrati}g</p>
                          <p className="text-xs" style={{ color: "#86efac" }}>Cal: {masa.calorii}</p>
                        </div>

                        <button
                          onClick={() => toggleRecipe(key)}
                          title="Vezi reteta"
                          className="p-1.5 rounded-md"
                          style={{
                            border: "1px solid rgba(148,163,184,0.35)",
                            background: "rgba(15,23,42,0.65)",
                          }}
                        >
                          <ChevronDown
                            className="w-4 h-4"
                            style={{
                              color: "#cbd5e1",
                              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          />
                        </button>
                      </div>

                      <p className="text-xs mt-2" style={{ color: "#cbd5e1" }}>
                        Ingrediente principale: {masa.ingredients.map((i) => `${i.item} ${i.grams}g`).join(", ")}
                      </p>

                      {isOpen ? (
                        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(148,163,184,0.25)" }}>
                          <p className="text-xs font-semibold mb-1" style={{ color: "#e2e8f0" }}>Ingrediente</p>
                          <ul className="text-xs mb-2" style={{ color: "#cbd5e1" }}>
                            {masa.ingredients.map((ing) => (
                              <li key={ing.item}>- {ing.item}: {ing.grams}g</li>
                            ))}
                          </ul>

                          <p className="text-xs font-semibold mb-1" style={{ color: "#e2e8f0" }}>Preparare</p>
                          <ol className="text-xs" style={{ color: "#cbd5e1" }}>
                            {masa.steps.map((step, idx) => (
                              <li key={idx}>{idx + 1}. {step}</li>
                            ))}
                          </ol>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-5"
      style={{
        borderRadius: "1rem",
        background: "rgba(2,6,23,0.58)",
        border: "1px solid rgba(16,185,129,0.35)",
      }}
    >
      <h2 className="text-2xl font-bold mb-1">Calculator nutritie</h2>
      <p className="text-sm mb-5" style={{ color: "#cbd5e1" }}>
        Seteaza macronutrientii zilnici intr-un mod simplu.
      </p>

      <StepInput
        label="Greutate (kg)"
        value={greutate}
        setValue={setGreutate}
        step={5}
        min={40}
        hint="Baza de calcul"
        tone={{ border: "rgba(148,163,184,0.35)", bg: "rgba(30,41,59,0.45)" }}
      />

      <div className="h-3" />

      <StepInput
        label="Proteine (g/zi)"
        value={proteine}
        setValue={setProteine}
        step={10}
        min={50}
        hint={`Recomandat: ${Math.round(greutate * 1.6)} - ${Math.round(greutate * 2.2)}g`}
        tone={{ border: "rgba(59,130,246,0.35)", bg: "rgba(59,130,246,0.12)" }}
      />

      <div className="h-3" />

      <StepInput
        label="Carbohidrati (g/zi)"
        value={carbohidrati}
        setValue={setCarbohidrati}
        step={10}
        min={50}
        hint={`Recomandat: ${Math.round(greutate * 3)} - ${Math.round(greutate * 5)}g`}
        tone={{ border: "rgba(249,115,22,0.35)", bg: "rgba(249,115,22,0.12)" }}
      />

      <div className="grid grid-cols-3 gap-3 my-5">
        <div className="p-3 text-center" style={{ borderRadius: 10, border: "1px solid rgba(59,130,246,0.35)", background: "rgba(59,130,246,0.12)" }}>
          <p className="text-xs" style={{ color: "#cbd5e1" }}>Proteine</p>
          <p className="text-xl font-bold text-blue-300">{proteine}g</p>
        </div>
        <div className="p-3 text-center" style={{ borderRadius: 10, border: "1px solid rgba(249,115,22,0.35)", background: "rgba(249,115,22,0.12)" }}>
          <p className="text-xs" style={{ color: "#cbd5e1" }}>Carbohidrati</p>
          <p className="text-xl font-bold text-orange-300">{carbohidrati}g</p>
        </div>
        <div className="p-3 text-center" style={{ borderRadius: 10, border: "1px solid rgba(16,185,129,0.35)", background: "rgba(16,185,129,0.12)" }}>
          <p className="text-xs" style={{ color: "#cbd5e1" }}>Calorii</p>
          <p className="text-xl font-bold text-emerald-300">{caloriiTotale}</p>
        </div>
      </div>

      <button
        onClick={genereazaPlan}
        disabled={isCalculating}
        className="w-full py-3 rounded-lg font-bold"
        style={{
          background: "linear-gradient(90deg, #16a34a, #059669)",
          color: "#fff",
          opacity: isCalculating ? 0.6 : 1,
        }}
      >
        {isCalculating ? "Se genereaza..." : "Creeaza plan nutritional"}
      </button>
    </div>
  );
}
