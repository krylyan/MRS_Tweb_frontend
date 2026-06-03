import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthUtils from "../utils/authUtils";
import { questionnaireApi, type QuestionDto } from "../services/questionnaireApi";

type AnswersMap = Record<string, string>; // questionId (string) → selected option

const STEP_PROGRESS_WIDTHS = [
  "w-[20%]", "w-[40%]", "w-[60%]", "w-[80%]", "w-full",
] as const;

export default function Questionnaire() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [loading, setLoading] = useState(true);

  // Fetch întrebările din backend la mount
  useEffect(() => {
    if (!AuthUtils.isQuestionnaireRequired()) {
      navigate("/home", { replace: true });
      return;
    }
    questionnaireApi.fetchQuestions().then((data) => {
      setQuestions(data);
      setLoading(false);
    });
  }, [navigate]);

  if (loading || questions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#111827_0%,#1f2937_52%,#111827_100%)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </main>
    );
  }

  const current = questions[step];
  const selectedValue = answers[String(current.id)] ?? "";
  const progressWidthClass =
    STEP_PROGRESS_WIDTHS[Math.min(step, STEP_PROGRESS_WIDTHS.length - 1)];

  const handleSelect = (value: string): void => {
    setAnswers((prev) => ({ ...prev, [String(current.id)]: value }));
  };

  const handleContinue = async (): Promise<void> => {
    if (!selectedValue) return;

    if (step === questions.length - 1) {
      // Ultimul pas — submit toate răspunsurile la backend
      await questionnaireApi.submitAll(questions, answers);
      AuthUtils.saveQuestionnaireAnswers();
      navigate("/home", { replace: true });
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleSkip = async (): Promise<void> => {
    await questionnaireApi.skipAll(questions);
    AuthUtils.skipQuestionnaire();
    navigate("/home", { replace: true });
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#111827_0%,#1f2937_52%,#111827_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-2 pb-[14px] pt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {step + 1}/{questions.length}
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
            {step === questions.length - 1 ? "FINISH" : "CONTINUE"}
          </button>
        </div>
      </div>
    </main>
  );
}
