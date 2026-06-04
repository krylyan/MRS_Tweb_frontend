import apiClient from "../utils/apiClient";
import AuthUtils from "../utils/authUtils";

export interface QuestionDto {
  id: number;
  title: string;
  subtitle: string;
  options: string[];
}

export interface QuestionnaireSubmitDto {
  questionId: number;
  skipped: boolean;
  answers: Record<string, string>;
}

export interface QuestionnaireEntryDto {
  id: number;
  skipped: boolean;
  answers: Record<string, string> | null;
  completedAt: string;
  question?: QuestionDto | null;
}

export interface QuestionnaireCompleteResponseDto {
  completed: boolean;
  workoutPlanId: number;
  mealPlanId: number;
  bmi: number;
  bmr: number;
  tdee: number;
  calories: number;
}

export const questionnaireApi = {
  async fetchQuestions(): Promise<QuestionDto[]> {
    const result = await apiClient.get<QuestionDto[]>("/questionnaire/questions");
    return result.ok ? result.data : [];
  },

  async submit(dto: QuestionnaireSubmitDto): Promise<boolean> {
    const session = AuthUtils.getSession();
    if (!session) return false;
    const result = await apiClient.post<unknown>(
      `/questionnaire/submit?userId=${session.userId}`,
      dto,
    );
    return result.ok;
  },

  async submitAll(
    questions: QuestionDto[],
    answers: Record<string, string>,
  ): Promise<void> {
    const session = AuthUtils.getSession();
    if (!session) return;

    const submissions = questions.map((q) => ({
      questionId: q.id,
      skipped: false,
      answers: answers[String(q.id)] ? { value: answers[String(q.id)] } : {},
    }));

    await Promise.allSettled(
      submissions.map((dto) =>
        apiClient.post<unknown>(`/questionnaire/submit?userId=${session.userId}`, dto),
      ),
    );
  },

  async complete(entries: QuestionnaireSubmitDto[]): Promise<QuestionnaireCompleteResponseDto | null> {
    const session = AuthUtils.getSession();
    if (!session) return null;
    const result = await apiClient.post<QuestionnaireCompleteResponseDto>(
      `/questionnaire/complete?userId=${session.userId}`,
      { entries },
    );
    return result.ok ? result.data : null;
  },

  async hasCompleted(): Promise<boolean> {
    const session = AuthUtils.getSession();
    if (!session) return false;
    const result = await apiClient.get<QuestionnaireEntryDto[]>(
      `/questionnaire/entries?userId=${session.userId}`,
    );
    if (!result.ok) return false;
    const answeredQuestions = new Set(result.data.map((entry) => entry.question?.id ?? entry.id));
    return result.data.length >= 10 || answeredQuestions.size >= 10;
  },

  async skipAll(questions: QuestionDto[]): Promise<void> {
    const session = AuthUtils.getSession();
    if (!session) return;

    await Promise.allSettled(
      questions.map((q) =>
        apiClient.post<unknown>(`/questionnaire/submit?userId=${session.userId}`, {
          questionId: q.id,
          skipped: true,
          answers: {},
        }),
      ),
    );
  },
};
