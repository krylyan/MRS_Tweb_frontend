import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

// ─── Tipuri ───────────────────────────────────────────────────────────────────

export interface QuestionDto {
  id: number;
  title: string;
  subtitle: string;
  options: string[];
}

export interface QuestionnaireSubmitDto {
  questionId: number;
  skipped: boolean;
  answers: string[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const questionnaireApi = {
  /**
   * GET /api/questionnaire/questions
   * Returnează lista de întrebări din DB.
   */
  async fetchQuestions(): Promise<QuestionDto[]> {
    const result = await apiClient.get<QuestionDto[]>("/questionnaire/questions");
    return result.ok ? result.data : [];
  },

  /**
   * POST /api/questionnaire/submit?userId=X
   * Salvează un răspuns la o întrebare.
   */
  async submit(dto: QuestionnaireSubmitDto): Promise<boolean> {
    const session = AuthUtils.getSession();
    if (!session) return false;
    const result = await apiClient.post<unknown>(
      `/questionnaire/submit?userId=${session.userId}`,
      dto,
    );
    return result.ok;
  },

  /**
   * Trimite toate răspunsurile unui chestionar completat.
   * answers: Record<questionId_number, selectedOption>
   */
  async submitAll(
    questions: QuestionDto[],
    answers: Record<string, string>,
  ): Promise<void> {
    const session = AuthUtils.getSession();
    if (!session) return;

    const submissions = questions.map((q) => ({
      questionId: q.id,
      skipped: false,
      answers: answers[String(q.id)] ? [answers[String(q.id)]] : [],
    }));

    await Promise.allSettled(
      submissions.map((dto) =>
        apiClient.post<unknown>(`/questionnaire/submit?userId=${session.userId}`, dto),
      ),
    );
  },

  /**
   * Marchează toate întrebările ca skip-uite.
   */
  async skipAll(questions: QuestionDto[]): Promise<void> {
    const session = AuthUtils.getSession();
    if (!session) return;

    await Promise.allSettled(
      questions.map((q) =>
        apiClient.post<unknown>(`/questionnaire/submit?userId=${session.userId}`, {
          questionId: q.id,
          skipped: true,
          answers: [],
        }),
      ),
    );
  },
};
