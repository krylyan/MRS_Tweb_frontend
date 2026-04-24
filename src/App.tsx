import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import FAQ from "./pages/FAQ";
import GymPlanMenu from "./pages/GymPlanMenu";
import Home from "./pages/Home";
import MyPlans from "./pages/MyPlans";
import Profile from "./pages/Profile";
import Questionnaire from "./pages/Questionnaire";
import Timer from "./pages/Timer";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import { TimerProvider } from "./contexts/TimerContext";

export default function App() {
  return (
    <TimerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/questionnaire"
            element={
              <ProtectedRoute>
                <Questionnaire />
              </ProtectedRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/plans" element={<MyPlans />} />
            <Route path="/gym-plan" element={<GymPlanMenu />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/timer" element={<Timer />} />
          </Route>
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
    </TimerProvider>
  );
}

