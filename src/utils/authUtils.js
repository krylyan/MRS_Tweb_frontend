/**
 * Auth utility functions
 * Gestionează logica de autentificare și localStorage
 */

export const AuthUtils = {
  /**
   * Verifica dacă utilizatorul este logat
   */
  isAuthenticated: () => {
    return localStorage.getItem("isLoggedIn") === "true";
  },

  /**
   * Obține email-ul utilizatorului curent
   */
  getCurrentUserEmail: () => {
    return localStorage.getItem("userEmail");
  },

  /**
   * Setează informațiile de login
   */
  setLoginInfo: (email) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
  },

  /**
   * Curăță informațiile de login (logout)
   */
  logout: () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
  },

  /**
   * Verifica și updata starea de login
   * Util pentru a sincroniza starea între tab-uri/ferestre
   */
  checkAuthStatus: () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userEmail = localStorage.getItem("userEmail");
    
    return {
      isLoggedIn,
      userEmail,
    };
  },
};

export default AuthUtils;
