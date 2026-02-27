const LOGIN_KEY = "fitlife_session_logged_in";
const USER_KEY = "fitlife_session_user";
const USERS_KEY = "fitlife_users";
const QUESTIONNAIRE_KEY = "fitlife_questionnaire";
const QUESTIONNAIRE_PENDING_KEY = "fitlife_questionnaire_pending";

type AnswersMap = Record<string, string>;

interface UserRecord {
  fullName: string;
  password: string;
}

type UsersMap = Record<string, UserRecord>;

interface QuestionnaireEntry {
  skipped: boolean;
  answers: AnswersMap | null;
  completedAt: string;
}

type QuestionnaireData = Record<string, QuestionnaireEntry>;

interface RegisterResult {
  ok: boolean;
  message?: string;
}

const DEFAULT_USERS: UsersMap = {
  admin: {
    fullName: "Admin",
    password: "admin",
  },
};

const ensureUsers = (): UsersMap => {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return { ...DEFAULT_USERS };
  }

  try {
    const parsed = JSON.parse(raw) as UsersMap;
    if (!parsed.admin) {
      parsed.admin = DEFAULT_USERS.admin;
      localStorage.setItem(USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return { ...DEFAULT_USERS };
  }
};

const setAuthSession = (username: string): void => {
  sessionStorage.setItem(LOGIN_KEY, "true");
  sessionStorage.setItem(USER_KEY, username);
};

const readQuestionnaireData = (): QuestionnaireData => {
  const raw = localStorage.getItem(QUESTIONNAIRE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as QuestionnaireData;
  } catch {
    return {};
  }
};

const writeQuestionnaireData = (data: QuestionnaireData): void => {
  localStorage.setItem(QUESTIONNAIRE_KEY, JSON.stringify(data));
};

const setQuestionnairePending = (value: boolean): void => {
  sessionStorage.setItem(QUESTIONNAIRE_PENDING_KEY, value ? "true" : "false");
};

const clearLegacyLoginStorage = (): void => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
};

const AuthUtils = {
  isAuthenticated: (): boolean => sessionStorage.getItem(LOGIN_KEY) === "true",

  getCurrentUserEmail: (): string | null => sessionStorage.getItem(USER_KEY),

  setLoginInfo: (username: string): void => setAuthSession(username),

  login: (username: string, password: string): boolean => {
    clearLegacyLoginStorage();
    const users = ensureUsers();
    const normalized = username.trim();
    const user = users[normalized];

    if (!user || user.password !== password) {
      return false;
    }

    setAuthSession(normalized);
    setQuestionnairePending(normalized === "admin");
    return true;
  },

  register: (username: string, password: string, fullName = ""): RegisterResult => {
    const users = ensureUsers();
    const normalized = username.trim();

    if (!normalized) {
      return { ok: false, message: "Email is required" };
    }

    if (users[normalized]) {
      return { ok: false, message: "Account already exists" };
    }

    users[normalized] = { fullName: fullName.trim(), password };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { ok: true };
  },

  logout: (): void => {
    sessionStorage.removeItem(LOGIN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(QUESTIONNAIRE_PENDING_KEY);
    clearLegacyLoginStorage();
  },

  isQuestionnaireRequired: (): boolean => {
    const currentUser = sessionStorage.getItem(USER_KEY);
    const pending = sessionStorage.getItem(QUESTIONNAIRE_PENDING_KEY) === "true";
    return currentUser === "admin" && pending;
  },

  saveQuestionnaireAnswers: (answers: AnswersMap): void => {
    const currentUser = sessionStorage.getItem(USER_KEY);
    if (!currentUser) {
      return;
    }

    const questionnaireData = readQuestionnaireData();
    questionnaireData[currentUser] = {
      skipped: false,
      answers,
      completedAt: new Date().toISOString(),
    };
    writeQuestionnaireData(questionnaireData);
    setQuestionnairePending(false);
  },

  skipQuestionnaire: (): void => {
    const currentUser = sessionStorage.getItem(USER_KEY);
    if (!currentUser) {
      return;
    }

    const questionnaireData = readQuestionnaireData();
    questionnaireData[currentUser] = {
      skipped: true,
      answers: null,
      completedAt: new Date().toISOString(),
    };
    writeQuestionnaireData(questionnaireData);
    setQuestionnairePending(false);
  },

  checkAuthStatus: (): { isLoggedIn: boolean; userEmail: string | null } => {
    const isLoggedIn = sessionStorage.getItem(LOGIN_KEY) === "true";
    const userEmail = sessionStorage.getItem(USER_KEY);
    return { isLoggedIn, userEmail };
  },
};

export default AuthUtils;
