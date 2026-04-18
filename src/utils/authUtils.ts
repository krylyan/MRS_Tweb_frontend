const LOGIN_KEY = "fitlife_session_logged_in";
const USER_KEY = "fitlife_session_user";
const USERS_KEY = "fitlife_users";
const QUESTIONNAIRE_KEY = "fitlife_questionnaire";
const QUESTIONNAIRE_PENDING_KEY = "fitlife_questionnaire_pending";
const ADMIN_MODE_KEY = "fitlife_admin_mode";

type AnswersMap = Record<string, string>;

export type UserRole = "admin" | "user";

export interface UserRecord {
  fullName: string;
  password: string;
  role: UserRole;
  blocked: boolean;
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

interface LoginResult {
  ok: boolean;
  message?: string;
}

export interface ManagedUser {
  username: string;
  fullName: string;
  role: UserRole;
  blocked: boolean;
}

const DEFAULT_USERS: UsersMap = {
  admin: {
    fullName: "Admin",
    password: "admin",
    role: "admin",
    blocked: false,
  },
  max: {
    fullName: "Max",
    password: "max",
    role: "user",
    blocked: false,
  },
};

const cloneUsersMap = (users: UsersMap): UsersMap =>
  Object.fromEntries(
    Object.entries(users).map(([username, user]) => [
      username,
      {
        fullName: user.fullName,
        password: user.password,
        role: user.role,
        blocked: user.blocked,
      },
    ]),
  );

const normalizeUserRecord = (record: Partial<UserRecord> | undefined, username: string): UserRecord => ({
  fullName: record?.fullName?.trim() || username,
  password: record?.password ?? "",
  role: record?.role === "admin" ? "admin" : "user",
  blocked: record?.blocked === true,
});

const readUsers = (): UsersMap | null => {
  const raw = localStorage.getItem(USERS_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<UserRecord>>;
    return Object.fromEntries(
      Object.entries(parsed).map(([username, record]) => [
        username,
        normalizeUserRecord(record, username),
      ]),
    );
  } catch {
    return null;
  }
};

const writeUsers = (users: UsersMap): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const ensureUsers = (): UsersMap => {
  const parsed = readUsers();
  const nextUsers = parsed ? cloneUsersMap(parsed) : {};

  for (const [username, record] of Object.entries(DEFAULT_USERS)) {
    const existing = nextUsers[username];

    nextUsers[username] = existing
      ? {
          ...existing,
          fullName: existing.fullName || record.fullName,
          password: existing.password || record.password,
          role: username === "admin" ? "admin" : existing.role,
          blocked: username === "admin" ? false : existing.blocked,
        }
      : { ...record };
  }

  writeUsers(nextUsers);
  return nextUsers;
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

const setAdminMode = (value: boolean): void => {
  sessionStorage.setItem(ADMIN_MODE_KEY, value ? "true" : "false");
};

const setAuthSession = (username: string): void => {
  sessionStorage.setItem(LOGIN_KEY, "true");
  sessionStorage.setItem(USER_KEY, username);
  setAdminMode(false);
};

const clearLegacyLoginStorage = (): void => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
};

const toManagedUser = (username: string, user: UserRecord): ManagedUser => ({
  username,
  fullName: user.fullName,
  role: user.role,
  blocked: user.blocked,
});

const moveQuestionnaireEntry = (previousUsername: string, nextUsername: string): void => {
  if (previousUsername === nextUsername) {
    return;
  }

  const questionnaireData = readQuestionnaireData();
  const existingEntry = questionnaireData[previousUsername];

  if (!existingEntry) {
    return;
  }

  questionnaireData[nextUsername] = existingEntry;
  delete questionnaireData[previousUsername];
  writeQuestionnaireData(questionnaireData);
};

const AuthUtils = {
  isAuthenticated: (): boolean => sessionStorage.getItem(LOGIN_KEY) === "true",

  getCurrentUserEmail: (): string | null => sessionStorage.getItem(USER_KEY),

  getCurrentUsername: (): string | null => sessionStorage.getItem(USER_KEY),

  getCurrentUser: (): ManagedUser | null => {
    const username = sessionStorage.getItem(USER_KEY);

    if (!username) {
      return null;
    }

    const users = ensureUsers();
    const user = users[username];
    return user ? toManagedUser(username, user) : null;
  },

  isCurrentUserAdmin: (): boolean => {
    const currentUser = AuthUtils.getCurrentUser();
    return currentUser?.role === "admin";
  },

  isAdminModeEnabled: (): boolean =>
    AuthUtils.isCurrentUserAdmin() && sessionStorage.getItem(ADMIN_MODE_KEY) === "true",

  setAdminModeEnabled: (value: boolean): void => {
    if (!AuthUtils.isCurrentUserAdmin()) {
      setAdminMode(false);
      return;
    }

    setAdminMode(value);
  },

  toggleAdminMode: (): boolean => {
    const nextValue = !AuthUtils.isAdminModeEnabled();
    AuthUtils.setAdminModeEnabled(nextValue);
    return nextValue;
  },

  setLoginInfo: (username: string): void => setAuthSession(username),

  login: (username: string, password: string): LoginResult => {
    clearLegacyLoginStorage();
    const users = ensureUsers();
    const normalized = username.trim();
    const user = users[normalized];

    if (!user || user.password !== password) {
      return { ok: false, message: "Invalid credentials." };
    }

    if (user.blocked) {
      return { ok: false, message: "This account is blocked. Contact an admin." };
    }

    setAuthSession(normalized);
    setQuestionnairePending(normalized === "admin");
    return { ok: true };
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

    users[normalized] = {
      fullName: fullName.trim() || normalized,
      password,
      role: "user",
      blocked: false,
    };
    writeUsers(users);
    return { ok: true };
  },

  updateCurrentProfile: (fullName: string, nextUsername: string): RegisterResult => {
    const currentUsername = sessionStorage.getItem(USER_KEY);

    if (!currentUsername) {
      return { ok: false, message: "No active session" };
    }

    const users = ensureUsers();
    const currentUser = users[currentUsername];

    if (!currentUser) {
      return { ok: false, message: "User not found" };
    }

    const trimmedName = fullName.trim();
    const trimmedUsername = nextUsername.trim();

    if (!trimmedName || !trimmedUsername) {
      return { ok: false, message: "Name and email are required" };
    }

    if (currentUsername === "admin" && trimmedUsername !== "admin") {
      return { ok: false, message: "The admin username cannot be changed" };
    }

    if (trimmedUsername !== currentUsername && users[trimmedUsername]) {
      return { ok: false, message: "Another account already uses this email" };
    }

    const updatedUser: UserRecord = {
      ...currentUser,
      fullName: trimmedName,
    };

    if (trimmedUsername === currentUsername) {
      users[currentUsername] = updatedUser;
    } else {
      delete users[currentUsername];
      users[trimmedUsername] = updatedUser;
      sessionStorage.setItem(USER_KEY, trimmedUsername);
      moveQuestionnaireEntry(currentUsername, trimmedUsername);
    }

    writeUsers(users);
    return { ok: true };
  },

  logout: (): void => {
    sessionStorage.removeItem(LOGIN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(QUESTIONNAIRE_PENDING_KEY);
    sessionStorage.removeItem(ADMIN_MODE_KEY);
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

  getAllUsers: (): ManagedUser[] => {
    const users = ensureUsers();

    return Object.entries(users)
      .map(([username, user]) => toManagedUser(username, user))
      .sort((left, right) => {
        if (left.role !== right.role) {
          return left.role === "admin" ? -1 : 1;
        }

        return left.username.localeCompare(right.username);
      });
  },

  updateUserRole: (username: string, role: UserRole): RegisterResult => {
    const users = ensureUsers();
    const targetUser = users[username];
    const currentUsername = sessionStorage.getItem(USER_KEY);

    if (!AuthUtils.isCurrentUserAdmin()) {
      return { ok: false, message: "Only admins can change roles" };
    }

    if (!targetUser) {
      return { ok: false, message: "User not found" };
    }

    if (username === "admin") {
      return { ok: false, message: "The special admin account must remain admin" };
    }

    targetUser.role = role;
    users[username] = targetUser;
    writeUsers(users);

    if (currentUsername === username && role !== "admin") {
      setAdminMode(false);
    }

    return { ok: true };
  },

  toggleUserBlocked: (username: string): RegisterResult => {
    const users = ensureUsers();
    const targetUser = users[username];
    const currentUsername = sessionStorage.getItem(USER_KEY);

    if (!AuthUtils.isCurrentUserAdmin()) {
      return { ok: false, message: "Only admins can block users" };
    }

    if (!targetUser) {
      return { ok: false, message: "User not found" };
    }

    if (username === "admin" || username === currentUsername) {
      return { ok: false, message: "You cannot block this account" };
    }

    targetUser.blocked = !targetUser.blocked;
    users[username] = targetUser;
    writeUsers(users);
    return { ok: true };
  },

  deleteUser: (username: string): RegisterResult => {
    const users = ensureUsers();
    const currentUsername = sessionStorage.getItem(USER_KEY);

    if (!AuthUtils.isCurrentUserAdmin()) {
      return { ok: false, message: "Only admins can delete users" };
    }

    if (!users[username]) {
      return { ok: false, message: "User not found" };
    }

    if (username === "admin" || username === currentUsername) {
      return { ok: false, message: "You cannot delete this account" };
    }

    delete users[username];
    writeUsers(users);

    const questionnaireData = readQuestionnaireData();
    delete questionnaireData[username];
    writeQuestionnaireData(questionnaireData);

    return { ok: true };
  },

  checkAuthStatus: (): { isLoggedIn: boolean; userEmail: string | null } => {
    const isLoggedIn = sessionStorage.getItem(LOGIN_KEY) === "true";
    const userEmail = sessionStorage.getItem(USER_KEY);
    return { isLoggedIn, userEmail };
  },
};

export default AuthUtils;
