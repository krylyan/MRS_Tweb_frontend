import apiClient from "../utils/apiClient";

export type FaqIconKey = "help" | "sparkles" | "calendar" | "search" | "user" | "settings" | "dumbbell" | "message";

export interface FaqItem {
  id: number;
  faqCategoryId: number;
  q: string;
  a: string;
  icon: FaqIconKey;
  order: number;
}

export interface FaqSection {
  id: number;
  title: string;
  icon: FaqIconKey;
  order: number;
  items: FaqItem[];
}

interface ApiFaqQuestion {
  id: number;
  faqCategoryId: number;
  question: string;
  answer: string;
  icon: string;
  order: number;
}

interface ApiFaqCategory {
  id: number;
  title: string;
  icon: string;
  order: number;
  questions: ApiFaqQuestion[];
}

const toIcon = (icon: string): FaqIconKey => {
  const allowed: FaqIconKey[] = ["help", "sparkles", "calendar", "search", "user", "settings", "dumbbell", "message"];
  return allowed.includes(icon as FaqIconKey) ? (icon as FaqIconKey) : "help";
};

const mapQuestion = (question: ApiFaqQuestion): FaqItem => ({
  id: question.id,
  faqCategoryId: question.faqCategoryId,
  q: question.question,
  a: question.answer,
  icon: toIcon(question.icon),
  order: question.order,
});

const mapCategory = (category: ApiFaqCategory): FaqSection => ({
  id: category.id,
  title: category.title,
  icon: toIcon(category.icon),
  order: category.order,
  items: category.questions.map(mapQuestion),
});

export const faqService = {
  async getAll(): Promise<FaqSection[]> {
    const result = await apiClient.get<ApiFaqCategory[]>("/faq");
    return result.ok ? result.data.map(mapCategory) : [];
  },

  async createCategory(dto: { title: string; icon: FaqIconKey; order: number }): Promise<FaqSection | null> {
    const result = await apiClient.post<ApiFaqCategory>("/faq/categories", dto);
    return result.ok ? mapCategory(result.data) : null;
  },

  async updateCategory(id: number, dto: { title: string; icon: FaqIconKey; order: number }): Promise<FaqSection | null> {
    const result = await apiClient.put<ApiFaqCategory>(`/faq/categories/${id}`, dto);
    return result.ok ? mapCategory(result.data) : null;
  },

  async deleteCategory(id: number): Promise<boolean> {
    const result = await apiClient.delete<void>(`/faq/categories/${id}`);
    return result.ok;
  },

  async createQuestion(dto: { faqCategoryId: number; question: string; answer: string; icon: FaqIconKey; order: number }): Promise<FaqItem | null> {
    const result = await apiClient.post<ApiFaqQuestion>("/faq/questions", dto);
    return result.ok ? mapQuestion(result.data) : null;
  },

  async updateQuestion(id: number, dto: { faqCategoryId: number; question: string; answer: string; icon: FaqIconKey; order: number }): Promise<FaqItem | null> {
    const result = await apiClient.put<ApiFaqQuestion>(`/faq/questions/${id}`, dto);
    return result.ok ? mapQuestion(result.data) : null;
  },

  async deleteQuestion(id: number): Promise<boolean> {
    const result = await apiClient.delete<void>(`/faq/questions/${id}`);
    return result.ok;
  },
};
