import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthUtils from "../utils/authUtils";

const QUESTIONS = [
  {
    id: "goal",
    title: "WHAT IS YOUR MAIN FITNESS GOAL?",
    subtitle: "Select the option that matches you best",
    options: ["WEIGHT LOSS", "BUILD MUSCLE", "GET TONED", "IMPROVE ENDURANCE"],
  },
  {
    id: "training_days",
    title: "HOW MANY DAYS CAN YOU TRAIN WEEKLY?",
    subtitle: "Pick the most realistic schedule",
    options: ["2-3 DAYS", "4 DAYS", "5 DAYS", "6+ DAYS"],
  },
  {
    id: "experience",
    title: "WHAT IS YOUR TRAINING EXPERIENCE?",
    subtitle: "This helps us set the right intensity",
    options: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
  },
  {
    id: "diet_style",
    title: "WHAT EATING STYLE DO YOU PREFER?",
    subtitle: "Choose what you can follow consistently",
    options: ["3 MAIN MEALS", "SMALL FREQUENT MEALS", "LOW-CARB", "MEDITERRANEAN"],
  },
  {
    id: "meal_prep",
    title: "HOW MUCH TIME CAN YOU COOK DAILY?",
    subtitle: "We adapt plans to your available time",
    options: ["UNDER 20 MINUTES", "20-40 MINUTES", "OVER 40 MINUTES"],
  },
];

export default function Questionnaire() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = QUESTIONS[step];
  const selectedValue = answers[current.id];
  const progress = useMemo(() => ((step + 1) / QUESTIONS.length) * 100, [step]);

  useEffect(() => {
    if (!AuthUtils.isQuestionnaireRequired()) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleSelect = (value) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const handleContinue = () => {
    if (!selectedValue) {
      return;
    }

    if (step === QUESTIONS.length - 1) {
      AuthUtils.saveQuestionnaireAnswers(answers);
      navigate("/home", { replace: true });
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleSkip = () => {
    AuthUtils.skipQuestionnaire();
    navigate("/home", { replace: true });
  };

  return (
    <main
      className="min-h-screen text-white"
      style={{
        background: "linear-gradient(180deg, #23262d 0%, #1f2128 100%)",
      }}
    >
      <div
        className="mx-auto"
        style={{
          width: "100%",
          maxWidth: "420px",
          minHeight: "100vh",
          padding: "16px 8px 22px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
          <span className="text-gray-400" style={{ fontSize: "12px" }}>
            {step + 1}/{QUESTIONS.length}
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors duration-300"
            style={{ fontSize: "12px" }}
          >
            Skip
          </button>
        </div>

        <div
          className="w-full overflow-hidden"
          style={{ height: "5px", borderRadius: "999px", backgroundColor: "rgba(255,255,255,0.10)", marginBottom: "14px" }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: "999px",
              backgroundColor: "#2351f3",
              transition: "width 240ms ease",
            }}
          />
        </div>

        <header className="text-center" style={{ marginBottom: "14px" }}>
          <h1
            className="font-bold"
            style={{
              fontSize: "44px",
              lineHeight: "1.04",
              letterSpacing: "0.4px",
              marginBottom: "8px",
            }}
          >
            {current.title}
          </h1>
          <p className="text-gray-400" style={{ fontSize: "20px", lineHeight: "1.2" }}>
            {current.subtitle}
          </p>
        </header>

        <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {current.options.map((option) => {
            const active = selectedValue === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full font-bold transition-all duration-300"
                style={{
                  minHeight: "84px",
                  padding: "14px 10px",
                  borderRadius: "13px",
                  fontSize: "17px",
                  lineHeight: "1.18",
                  letterSpacing: "0.2px",
                  border: active ? "1px solid rgba(70,120,255,0.9)" : "1px solid rgba(255,255,255,0.08)",
                  backgroundColor: active ? "#2351f3" : "#343740",
                  color: "#f3f4f6",
                  boxShadow: active ? "0 10px 20px rgba(35, 81, 243, 0.28)" : "none",
                }}
              >
                {option}
              </button>
            );
          })}
        </section>

        <div style={{ marginTop: "auto", paddingTop: "16px" }}>
          {!selectedValue && (
            <p className="text-gray-400 text-center" style={{ fontSize: "12px", marginBottom: "8px" }}>
              Select one answer to continue
            </p>
          )}

          <button
            type="button"
            onClick={handleContinue}
            className="w-full font-bold transition-all duration-300"
            style={{
              height: "86px",
              borderRadius: "13px",
              fontSize: "18px",
              letterSpacing: "0.4px",
              border: selectedValue ? "1px solid rgba(70,120,255,0.85)" : "1px solid rgba(255,255,255,0.08)",
              backgroundColor: selectedValue ? "#2351f3" : "#3a3d45",
              color: "#ffffff",
              cursor: selectedValue ? "pointer" : "not-allowed",
            }}
          >
            {step === QUESTIONS.length - 1 ? "FINISH" : "CONTINUE"}
          </button>
        </div>
      </div>
    </main>
  );
}
