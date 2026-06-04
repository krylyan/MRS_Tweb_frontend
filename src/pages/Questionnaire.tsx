import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthUtils from "../utils/authUtils";
import { questionnaireApi, type QuestionDto, type QuestionnaireSubmitDto } from "../services/questionnaireApi";

type AnswersMap = Record<string, Record<string, string>>;

const PERSONAL_QUESTION_ID = 6;

export default function Questionnaire() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!AuthUtils.isQuestionnaireRequired()) {
      navigate("/home", { replace: true });
      return;
    }

    questionnaireApi.fetchQuestions().then((data) => {
      setQuestions(data.slice(0, 10));
      setLoading(false);
    });
  }, [navigate]);

  const current = questions[step];
  const currentAnswer = current ? answers[String(current.id)] ?? {} : {};
  const progress = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0;
  const isPersonalStep = current?.id === PERSONAL_QUESTION_ID || current?.options.length === 0;

  const canContinue = useMemo(() => {
    if (!current) return false;
    if (!isPersonalStep) return Boolean(currentAnswer.value);

    const age = Number(currentAnswer.age);
    const height = Number(currentAnswer.height);
    const weight = Number(currentAnswer.weight);
    return age > 0 && height > 0 && weight > 0 && Boolean(currentAnswer.gender);
  }, [current, currentAnswer, isPersonalStep]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#111827_0%,#1f2937_52%,#111827_100%)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </main>
    );
  }

  if (!current || questions.length < 10) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#111827_0%,#1f2937_52%,#111827_100%)] px-6 text-white">
        <section className="w-full max-w-md rounded-[12px] border border-red-400/30 bg-red-500/10 p-5 text-center">
          <h1 className="text-2xl font-semibold">Questionnaire unavailable</h1>
          <p className="mt-2 text-sm text-red-100/80">The onboarding questionnaire must contain exactly 10 questions.</p>
        </section>
      </main>
    );
  }

  const setAnswer = (questionId: number, value: Record<string, string>): void => {
    setAnswers((prev) => ({ ...prev, [String(questionId)]: { ...prev[String(questionId)], ...value } }));
  };

  const submitQuestionnaire = async (): Promise<void> => {
    setSubmitting(true);
    setError("");

    const entries: QuestionnaireSubmitDto[] = questions.map((question) => ({
      questionId: question.id,
      skipped: false,
      answers: answers[String(question.id)] ?? {},
    }));

    const result = await questionnaireApi.complete(entries);
    setSubmitting(false);

    if (!result?.completed) {
      setError("Could not generate your plans. Please try again.");
      return;
    }

    AuthUtils.saveQuestionnaireAnswers();
    navigate("/plans", { replace: true });
  };

  const handleContinue = async (): Promise<void> => {
    if (!canContinue || submitting) return;
    if (step === questions.length - 1) {
      await submitQuestionnaire();
      return;
    }
    setStep((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#101827_0%,#172235_48%,#0d1420_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col px-4 pb-5 pt-4">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <span>{step + 1}/{questions.length}</span>
          <span>Onboarding</span>
        </div>

        <div className="mb-5 h-[6px] w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <header className="mb-5 text-center">
          <h1 className="text-[clamp(30px,5vh,42px)] font-bold leading-[1.04] tracking-[0.2px]">
            {current.title}
          </h1>
          <p className="mx-auto mt-3 max-w-[360px] text-[15px] leading-6 text-slate-300">{current.subtitle}</p>
        </header>

        {isPersonalStep ? (
          <section className="grid gap-3">
            <Field label="Age" value={currentAnswer.age ?? ""} onChange={(value) => setAnswer(current.id, { age: value })} placeholder="28" />
            <Field label="Height (cm)" value={currentAnswer.height ?? ""} onChange={(value) => setAnswer(current.id, { height: value })} placeholder="178" />
            <Field label="Weight (kg)" value={currentAnswer.weight ?? ""} onChange={(value) => setAnswer(current.id, { weight: value })} placeholder="76" />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {["Male", "Female"].map((gender) => {
                  const active = currentAnswer.gender === gender;
                  return (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setAnswer(current.id, { gender })}
                      className={`min-h-[54px] rounded-[10px] border px-3 text-sm font-semibold transition ${
                        active ? "border-emerald-400 bg-emerald-500/25 text-white" : "border-white/10 bg-slate-800 text-slate-200"
                      }`}
                    >
                      {gender}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          <section className="flex flex-col gap-3">
            {current.options.map((option) => {
              const active = currentAnswer.value === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAnswer(current.id, { value: option })}
                  className={`min-h-[64px] w-full rounded-[12px] border px-4 py-3 text-left text-[15px] font-bold leading-[1.25] text-gray-100 transition-all duration-200 ${
                    active
                      ? "border-emerald-400 bg-emerald-500/25 shadow-[0_12px_28px_rgba(16,185,129,0.2)]"
                      : "border-white/10 bg-slate-800 hover:border-white/20"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </section>
        )}

        <div className="mt-auto pt-5">
          {error ? <p className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-100">{error}</p> : null}
          {!canContinue ? <p className="mb-2 text-center text-xs text-slate-400">Complete this step to continue</p> : null}

          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue || submitting}
            className={`h-[62px] w-full rounded-[12px] border text-[15px] font-bold tracking-[0.3px] text-white transition ${
              canContinue && !submitting
                ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500 to-blue-600"
                : "cursor-not-allowed border-white/8 bg-slate-700"
            }`}
          >
            {submitting ? "GENERATING PLANS..." : step === questions.length - 1 ? "GENERATE MY PLANS" : "CONTINUE"}
          </button>
        </div>
      </div>
    </main>
  );
}

interface FieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

function Field({ label, value, placeholder, onChange }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      <input
        type="number"
        min="1"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-[56px] w-full rounded-[10px] border border-white/10 bg-slate-800 px-4 text-base font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
      />
    </label>
  );
}
