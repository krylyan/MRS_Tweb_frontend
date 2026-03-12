import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthUtils from "../utils/authUtils";

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: string[];
}

type AnswersMap = Record<string, string>;

const QUESTIONS: Question[] = [
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

const STEP_PROGRESS_WIDTHS = ["w-[20%]", "w-[40%]", "w-[60%]", "w-[80%]", "w-full"] as const;

export default function Questionnaire() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});

  const current = QUESTIONS[step];
  const selectedValue = answers[current.id] ?? "";
  const progressWidthClass = STEP_PROGRESS_WIDTHS[step];

  useEffect(() => {
    if (!AuthUtils.isQuestionnaireRequired()) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleSelect = (value: string): void => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const handleContinue = (): void => {
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

  const handleSkip = (): void => {
    AuthUtils.skipQuestionnaire();
    navigate("/home", { replace: true });
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#111827_0%,#1f2937_52%,#111827_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-2 pb-[14px] pt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {step + 1}/{QUESTIONS.length}
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-gray-400 transition-colors duration-300 hover:text-white"
          >
            Skip
          </button>
        </div>

        <div className="mb-[10px] h-[5px] w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-200 ${progressWidthClass}`}
          />
        </div>

        <header className="mb-[10px] text-center">
          <h1 className="mb-2 text-[clamp(34px,5.2vh,44px)] font-bold leading-[1.02] tracking-[0.4px]">
            {current.title}
          </h1>
          <p className="text-[clamp(16px,2.6vh,20px)] leading-[1.2] text-gray-400">{current.subtitle}</p>
        </header>

        <section className="flex flex-col gap-[10px]">
          {current.options.map((option) => {
            const active = selectedValue === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full rounded-[13px] border px-[10px] py-3 text-[clamp(14px,2.2vh,17px)] font-bold leading-[1.18] tracking-[0.2px] text-gray-100 transition-all duration-300 ${
                  active
                    ? "border-emerald-500/85 bg-teal-700 shadow-[0_10px_20px_rgba(16,185,129,0.24)]"
                    : "border-white/10 bg-gray-800"
                } min-h-[clamp(66px,9vh,84px)]`}
              >
                {option}
              </button>
            );
          })}
        </section>

        <div className="mt-auto pt-3">
          {!selectedValue ? (
            <p className="mb-1.5 text-center text-xs text-gray-400">Select one answer to continue</p>
          ) : null}

          <button
            type="button"
            onClick={handleContinue}
            className={`h-[clamp(66px,9vh,86px)] w-full rounded-[13px] border text-[clamp(16px,2.4vh,18px)] font-bold tracking-[0.4px] text-white transition-all duration-300 ${
              selectedValue
                ? "cursor-pointer border-emerald-500/80 bg-gradient-to-r from-emerald-500 to-blue-600"
                : "cursor-not-allowed border-white/8 bg-slate-700"
            }`}
          >
            {step === QUESTIONS.length - 1 ? "FINISH" : "CONTINUE"}
          </button>
        </div>
      </div>
    </main>
  );
}

