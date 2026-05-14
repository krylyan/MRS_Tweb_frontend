// ─── Storage keys ─────────────────────────────────────────────────────────────
// Sesiunea se pastreaza in sessionStorage (se sterge la inchiderea tab-ului)
// Nu se mai salveaza niciun cont sau parola in localStorage
const SESSION_KEY              = "fitlife_session";
const ADMIN_MODE_KEY           = "fitlife_admin_mode";
const QUESTIONNAIRE_KEY        = "fitlife_questionnaire";
const QUESTIONNAIRE_PENDING_KEY = "fitlife_questionnaire_pending";

// ─── Tipuri ───────────────────────────────────────────────────────────────────
type AnswersMap = Record<string, string>;

// Rolul vine din backend ca string: "Admin" | "User"
export type UserRole = "Admin" | "User";

export interface SessionData {
  userId:   number;
  fullName: string;
  role:     UserRole;
  token:    string;
}

// Compatibil cu componentele care il folosesc (AdminUsers, Sidebar, etc.)
export interface ManagedUser {
  username: string;
  fullName: string;
  role:     UserRole;
  blocked:  boolean;
}

interface QuestionnaireEntry {
  skipped:     boolean;
  answers:     AnswersMap | null;
  completedAt: string;
}

type QuestionnaireData = Record<string, QuestionnaireEntry>;

// ─── Session helpers ──────────────────────────────────────────────────────────
const readSession = (): SessionData | null => {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
};

const writeSession = (data: SessionData): void => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

const clearSession = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ADMIN_MODE_KEY);
  sessionStorage.removeItem(QUESTIONNAIRE_PENDING_KEY);
};

// ─── Questionnaire helpers ────────────────────────────────────────────────────
const readQuestionnaireData = (): QuestionnaireData => {
  const raw = localStorage.getItem(QUESTIONNAIRE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as QuestionnaireData;
  } catch {
    return {};
  }
};

const writeQuestionnaireData = (data: QuestionnaireData): void => {
  localStorage.setItem(QUESTIONNAIRE_KEY, JSON.stringify(data));
};

// ─── AuthUtils ────────────────────────────────────────────────────────────────
const AuthUtils = {
  // ─── Stare autentificare ─────────────────────────────────────────────────────
  isAuthenticated: (): boolean => readSession() !== null,

  getToken: (): string | null => readSession()?.token ?? null,

  getCurrentUser: (): ManagedUser | null => {
    const session = readSession();
    if (!session) return null;
    return {
      username: session.fullName,   // compatibilitate cu componentele existente
      fullName: session.fullName,
      role:     session.role,
      blocked:  false,
    };
  },

  getCurrentUsername: (): string | null => readSession()?.fullName ?? null,

  getCurrentUserEmail: (): string | null => readSession()?.fullName ?? null,

  isCurrentUserAdmin: (): boolean => readSession()?.role === "Admin",

  // ─── Gestionare sesiune ──────────────────────────────────────────────────────

  // Apelat din SignIn dupa login reusit cu datele complete din API
  setSession: (data: SessionData): void => {
    writeSession(data);
    sessionStorage.setItem(ADMIN_MODE_KEY, "false");
  },

  // Compatibilitate cu codul vechi (unele componente apeleaza setLoginInfo)
  setLoginInfo: (fullName: string): void => {
    const session = readSession();
    if (session) {
      writeSession({ ...session, fullName });
    }
  },

  logout: (): void => {
    clearSession();
    // Curata si orice resturi din sesiunile vechi
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("fitlife_users");   // sterge si conturile mock vechi
  },

  // ─── Admin mode ──────────────────────────────────────────────────────────────
  isAdminModeEnabled: (): boolean =>
    AuthUtils.isCurrentUserAdmin() &&
    sessionStorage.getItem(ADMIN_MODE_KEY) === "true",

  setAdminModeEnabled: (value: boolean): void => {
    if (!AuthUtils.isCurrentUserAdmin()) {
      sessionStorage.setItem(ADMIN_MODE_KEY, "false");
      return;
    }
    sessionStorage.setItem(ADMIN_MODE_KEY, value ? "true" : "false");
  },

  toggleAdminMode: (): boolean => {
    const next = !AuthUtils.isAdminModeEnabled();
    AuthUtils.setAdminModeEnabled(next);
    return next;
  },

  // ─── Questionnaire ───────────────────────────────────────────────────────────
  isQuestionnaireRequired: (): boolean =>
    sessionStorage.getItem(QUESTIONNAIRE_PENDING_KEY) === "true",

  saveQuestionnaireAnswers: (answers: AnswersMap): void => {
    const session = readSession();
    if (!session) return;
    const data = readQuestionnaireData();
    data[String(session.userId)] = {
      skipped: false,
      answers,
      completedAt: new Date().toISOString(),
    };
    writeQuestionnaireData(data);
    sessionStorage.removeItem(QUESTIONNAIRE_PENDING_KEY);
  },

  skipQuestionnaire: (): void => {
    const session = readSession();
    if (!session) return;
    const data = readQuestionnaireData();
    data[String(session.userId)] = {
      skipped: true,
      answers: null,
      completedAt: new Date().toISOString(),
    };
    writeQuestionnaireData(data);
    sessionStorage.removeItem(QUESTIONNAIRE_PENDING_KEY);
  },

  // ─── Admin user management — stubs (vor fi inlocuite cu API calls) ───────────
  getAllUsers: (): ManagedUser[] => [],

  updateUserRole: (_username: string, _role: UserRole): { ok: boolean; message?: string } =>
    ({ ok: false, message: "Not implemented — use API" }),

  toggleUserBlocked: (_username: string): { ok: boolean; message?: string } =>
    ({ ok: false, message: "Not implemented — use API" }),

  deleteUser: (_username: string): { ok: boolean; message?: string } =>
    ({ ok: false, message: "Not implemented — use API" }),

  // ─── Profile update — stub ────────────────────────────────────────────────────
  updateCurrentProfile: (_fullName: string, _username: string): { ok: boolean; message?: string } =>
    ({ ok: false, message: "Not implemented — use API" }),

  checkAuthStatus: (): { isLoggedIn: boolean; userEmail: string | null } => {
    const session = readSession();
    return {
      isLoggedIn: session !== null,
      userEmail:  session?.fullName ?? null,
    };
  },
};

export default AuthUtils;
