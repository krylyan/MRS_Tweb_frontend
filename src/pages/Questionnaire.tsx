import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Dumbbell } from "lucide-react";
import AuthUtils from "../utils/authUtils";
import { questionnaireApi, type QuestionDto, type QuestionnaireSubmitDto } from "../services/questionnaireApi";

type AnswersMap = Record<string, Record<string, string>>;

const PERSONAL_QUESTION_ID = 6;
const PERSONAL_QUESTION_SUBTITLE = "Tell us the basics so we can tailor your plans.";

export default function Questionnaire() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [touchedQuestionIds, setTouchedQuestionIds] = useState<Set<number>>(() => new Set());
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
  const subtitle = isPersonalStep ? PERSONAL_QUESTION_SUBTITLE : current?.subtitle;

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
    setTouchedQuestionIds((prev) => new Set(prev).add(questionId));
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

    const nextQuestion = questions[step + 1];
    if (nextQuestion && !touchedQuestionIds.has(nextQuestion.id)) {
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[String(nextQuestion.id)];
        return next;
      });
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = (): void => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#101827_0%,#172235_48%,#0d1420_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[960px] flex-col px-4 py-8">
        <header className="mb-10 text-center">
          <div className="mb-6 inline-flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-[14px] bg-emerald-500 text-white shadow-[0_14px_34px_rgba(16,185,129,0.24)]">
              <Dumbbell className="h-6 w-6" />
            </span>
            <span className="text-[30px] font-bold leading-none tracking-[0.2px] text-white">FitLife</span>
          </div>

          <h1 className="text-[clamp(32px,4.6vw,40px)] font-bold leading-tight text-white">
            Let&apos;s personalize your experience
          </h1>
          <p className="mt-2 text-lg text-slate-300">Help us understand your fitness journey</p>
        </header>

        <div className="mb-7">
          <div className="mb-3 flex items-center justify-between text-sm font-medium text-cyan-200/80">
            <span>Step {step + 1} of {questions.length}</span>
            <span className="text-emerald-300">{Math.round(progress)}%</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <section className="rounded-[18px] border border-white/12 bg-slate-900/50 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-[8px] sm:p-8">
          <header className="mb-7 text-center">
            <h1 className="text-[clamp(30px,5vh,42px)] font-bold leading-[1.04] tracking-[0.2px]">
              {current.title}
            </h1>
            <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-6 text-slate-300">{subtitle}</p>
          </header>

          {isPersonalStep ? (
            <section className="mx-auto grid max-w-[640px] gap-4">
              <Field label="Age" value={currentAnswer.age ?? ""} onChange={(value) => setAnswer(current.id, { age: value })} placeholder="Your age" />
              <Field label="Height (cm)" value={currentAnswer.height ?? ""} onChange={(value) => setAnswer(current.id, { height: value })} placeholder="Your height" />
              <Field label="Weight (kg)" value={currentAnswer.weight ?? ""} onChange={(value) => setAnswer(current.id, { weight: value })} placeholder="Your weight" />

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
                        className={`min-h-[58px] rounded-[12px] border px-3 text-sm font-semibold transition ${
                          active ? "border-emerald-400 bg-emerald-500/25 text-white shadow-[0_0_24px_rgba(16,185,129,0.18)]" : "border-white/10 bg-slate-800 text-slate-200 hover:border-white/20"
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
            <section className="grid gap-4 md:grid-cols-2">
              {current.options.map((option) => {
                const active = currentAnswer.value === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswer(current.id, { value: option })}
                    className={`flex min-h-[92px] w-full items-center justify-between rounded-[14px] border px-5 py-4 text-left text-[17px] font-bold leading-[1.25] text-gray-100 transition-all duration-200 ${
                      active
                        ? "border-emerald-400 bg-emerald-500/18 shadow-[0_16px_34px_rgba(16,185,129,0.18)]"
                        : "border-white/10 bg-slate-800/80 hover:border-white/20 hover:bg-slate-800"
                    }`}
                  >
                    <span>{option}</span>
                    <span className={`h-6 w-6 rounded-full border ${active ? "border-emerald-300 bg-emerald-400 shadow-[inset_0_0_0_7px_rgba(15,23,42,0.7)]" : "border-slate-500"}`} />
                  </button>
                );
              })}
            </section>
          )}
        </section>

        <div className="mt-6 grid grid-cols-3 items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || submitting}
            className={`inline-flex h-[52px] items-center justify-start gap-2 rounded-[12px] px-3 text-sm font-semibold transition ${
              step === 0 ? "cursor-not-allowed text-slate-600" : "text-cyan-200/75 hover:text-cyan-100"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="text-center">
            {error ? <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}
            {!canContinue && !error ? <p className="text-xs text-slate-400">Complete this step to continue</p> : null}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue || submitting}
            className={`ml-auto inline-flex h-[52px] min-w-[128px] items-center justify-center gap-2 rounded-[12px] border px-5 text-sm font-bold text-white transition ${
              canContinue && !submitting
                ? "border-emerald-400/80 bg-emerald-500 hover:bg-emerald-400"
                : "cursor-not-allowed border-white/8 bg-slate-700 text-slate-400"
            }`}
          >
            {submitting ? "Generating..." : step === questions.length - 1 ? "Generate" : "Next"}
            <ArrowRight className="h-4 w-4" />
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
  const stepValue = (delta: number): void => {
    const current = Math.max(0, Math.floor(Number(value) || 0));
    onChange(String(Math.max(1, current + delta)));
  };

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
          className="h-[60px] w-full rounded-[12px] border border-white/12 bg-slate-800 px-4 pr-12 text-base font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:shadow-[0_0_18px_rgba(16,185,129,0.18)]"
        />
        <div className="absolute inset-y-0 right-0 flex w-10 flex-col overflow-hidden rounded-r-[12px] border-l border-white/12">
          <button
            type="button"
            onClick={() => stepValue(1)}
            className="flex flex-1 items-center justify-center bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
            aria-label={`Increase ${label}`}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => stepValue(-1)}
            className="flex flex-1 items-center justify-center border-t border-white/12 bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
            aria-label={`Decrease ${label}`}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </label>
  );
}
