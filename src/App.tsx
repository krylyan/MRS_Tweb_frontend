import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminUsers from "./pages/AdminUsers";
import AdminExercises from "./pages/AdminExercises";
import AdminMeals from "./pages/AdminMeals";
import Exercises from "./pages/Exercises";
import FAQ from "./pages/FAQ";
import GymPlanMenu from "./pages/GymPlanMenu";
import MealPlanMenu from "./pages/MealPlanMenu";
import Meals from "./pages/Meals";
import Home from "./pages/Home";
import MyPlans from "./pages/MyPlans";
import Profile from "./pages/Profile";
import Questionnaire from "./pages/Questionnaire";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import AuthUtils from "./utils/authUtils";

function HomeRoute() {
  return AuthUtils.isAdminModeEnabled() ? <Navigate to="/admin" replace /> : <Home />;
}

export default function App() {
  return (
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
          <Route path="/home" element={<HomeRoute />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/plans" element={<MyPlans />} />
          <Route path="/gym-plan" element={<GymPlanMenu />} />
          <Route path="/meal-plan" element={<MealPlanMenu />} />
          <Route path="/meals" element={<Meals />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdminMode>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exercises"
            element={
              <ProtectedRoute requireAdminMode>
                <AdminExercises />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/meals"
            element={
              <ProtectedRoute requireAdminMode>
                <AdminMeals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faq"
            element={
              <ProtectedRoute requireAdminMode>
                <FAQ />
              </ProtectedRoute>
            }
          />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

