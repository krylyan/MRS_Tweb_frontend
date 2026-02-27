import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthUtils from "../../utils/authUtils";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const isLoggedIn = AuthUtils.isAuthenticated();
  const questionnaireRequired = AuthUtils.isQuestionnaireRequired();

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  if (questionnaireRequired && location.pathname !== "/questionnaire") {
    return <Navigate to="/questionnaire" replace />;
  }

  return children;
}
