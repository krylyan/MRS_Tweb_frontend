import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute Component
 * Redirecționează utilizatorii neautentificați la /signin
 * Permite doar utilizatorii logați să acceseze rute protejate
 */
export default function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    // Redirecționează la Sign In dacă nu ești logat
    return <Navigate to="/signin" replace />;
  }

  // Dacă ești logat, afișează componenta
  return children;
}
