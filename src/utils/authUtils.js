const LOGIN_KEY = "isLoggedIn";
const USER_KEY = "userEmail";
const USERS_KEY = "fitlife_users";

const DEFAULT_USERS = {
  admin: {
    fullName: "Admin",
    password: "admin",
  },
};

const ensureUsers = () => {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return { ...DEFAULT_USERS };
  }

  try {
    const parsed = JSON.parse(raw);
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

const setAuthSession = (username) => {
  localStorage.setItem(LOGIN_KEY, "true");
  localStorage.setItem(USER_KEY, username);
};

export const AuthUtils = {
  isAuthenticated: () => localStorage.getItem(LOGIN_KEY) === "true",

  getCurrentUserEmail: () => localStorage.getItem(USER_KEY),

  setLoginInfo: (username) => setAuthSession(username),

  login: (username, password) => {
    const users = ensureUsers();
    const normalized = username.trim();
    const user = users[normalized];

    if (!user || user.password !== password) {
      return false;
    }

    setAuthSession(normalized);
    return true;
  },

  register: (username, password, fullName = "") => {
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

  logout: () => {
    localStorage.removeItem(LOGIN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  checkAuthStatus: () => {
    const isLoggedIn = localStorage.getItem(LOGIN_KEY) === "true";
    const userEmail = localStorage.getItem(USER_KEY);
    return { isLoggedIn, userEmail };
  },
};

export default AuthUtils;
