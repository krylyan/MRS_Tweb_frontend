import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthUtils from "../../utils/authUtils";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isLoggedIn = AuthUtils.isAuthenticated();
  const questionnaireRequired = AuthUtils.isQuestionnaireRequired();

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  if (questionnaireRequired && location.pathname !== "/questionnaire") {
    return <Navigate to="/questionnaire" replace />;
  }

  return <>{children}</>;
}

