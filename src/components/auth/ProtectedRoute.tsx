import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthUtils from "../../utils/authUtils";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdminMode?: boolean;
}

export default function ProtectedRoute({ children, requireAdminMode = false }: ProtectedRouteProps) {
  const location = useLocation();
  const isLoggedIn = AuthUtils.isAuthenticated();
  const questionnaireRequired = AuthUtils.isQuestionnaireRequired();

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  if (questionnaireRequired && location.pathname !== "/questionnaire") {
    return <Navigate to="/questionnaire" replace />;
  }

  if (requireAdminMode && !AuthUtils.isAdminModeEnabled()) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

