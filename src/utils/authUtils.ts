const SESSION_KEY = "fitlife_session";
const ADMIN_MODE_KEY = "fitlife_admin_mode";
const QUESTIONNAIRE_PENDING_KEY = "fitlife_questionnaire_pending";

export type UserRole = "Admin" | "User";

export interface SessionData {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface ManagedUser {
  email: string;
  fullName: string;
  role: UserRole;
  blocked: boolean;
}

const readSession = (): SessionData | null => {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Partial<SessionData>;
    if (
      typeof session.userId !== "number" ||
      typeof session.fullName !== "string" ||
      typeof session.email !== "string" ||
      typeof session.role !== "string" ||
      typeof session.token !== "string"
    ) {
      clearSession();
      return null;
    }
    return session as SessionData;
  } catch {
    clearSession();
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

const AuthUtils = {
  isAuthenticated: (): boolean => readSession() !== null,

  getToken: (): string | null => readSession()?.token ?? null,

  getCurrentUser: (): ManagedUser | null => {
    const session = readSession();
    if (!session) return null;
    return {
      email: session.email,
      fullName: session.fullName,
      role: session.role,
      blocked: false,
    };
  },

  getSession: (): SessionData | null => readSession(),

  getCurrentUserEmail: (): string | null => readSession()?.email ?? null,

  isCurrentUserAdmin: (): boolean => readSession()?.role === "Admin",

  setSession: (data: SessionData): void => {
    writeSession(data);
    sessionStorage.setItem(ADMIN_MODE_KEY, "false");
  },

  setLoginInfo: (fullName: string): void => {
    const session = readSession();
    if (session) {
      writeSession({ ...session, fullName });
    }
  },

  logout: (): void => {
    clearSession();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("fitlife_users");
  },

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

  isQuestionnaireRequired: (): boolean =>
    sessionStorage.getItem(QUESTIONNAIRE_PENDING_KEY) === "true",

  setQuestionnaireRequired: (value: boolean): void => {
    if (value) {
      sessionStorage.setItem(QUESTIONNAIRE_PENDING_KEY, "true");
      return;
    }
    sessionStorage.removeItem(QUESTIONNAIRE_PENDING_KEY);
  },

  saveQuestionnaireAnswers: (): void => {
    const session = readSession();
    if (!session) return;
    sessionStorage.removeItem(QUESTIONNAIRE_PENDING_KEY);
  },

  skipQuestionnaire: (): void => {
    const session = readSession();
    if (!session) return;
    sessionStorage.removeItem(QUESTIONNAIRE_PENDING_KEY);
  },

  getAllUsers: (): ManagedUser[] => [],

  updateUserRole: (_email: string, _role: UserRole): { ok: boolean; message?: string } =>
    ({ ok: false, message: "Not implemented - use API" }),

  toggleUserBlocked: (_email: string): { ok: boolean; message?: string } =>
    ({ ok: false, message: "Not implemented - use API" }),

  deleteUser: (_email: string): { ok: boolean; message?: string } =>
    ({ ok: false, message: "Not implemented - use API" }),

  updateCurrentProfile: (_fullName: string, _email: string): { ok: boolean; message?: string } =>
    ({ ok: false, message: "Not implemented - use API" }),

  checkAuthStatus: (): { isLoggedIn: boolean; userEmail: string | null } => {
    const session = readSession();
    return {
      isLoggedIn: session !== null,
      userEmail: session?.email ?? null,
    };
  },
};

export default AuthUtils;
