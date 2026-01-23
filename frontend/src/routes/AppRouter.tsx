import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import RequirePermission from "./RequirePermission";
import { authService } from "../services/auth.service";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

// Dashboard
import DashboardPage from "../pages/dashboard/DashboardPage";

// DMS
import DmsListPage from "../pages/dms/DmsListPage";
import DmsCreatePage from "../pages/dms/DmsCreatePage";
import DmsDetailPage from "../pages/dms/DmsDetailPage";

// Training
import TrainingListPage from "../pages/training/TrainingListPage";
import TrainingCreatePage from "../pages/training/TrainingCreatePage";
import TrainingDetailPage from "../pages/training/TrainingDetailPage";
import TrainingMatrixPage from "../pages/training/TrainingMatrixPage";
import EmployeeTrainingProfilePage from "../pages/training/EmployeeTrainingProfilePage";

// Deviations
import DeviationsListPage from "../pages/deviations/DeviationsListPage";
import DeviationsCreatePage from "../pages/deviations/DeviationsCreatePage";
import DeviationsDetailPage from "../pages/deviations/DeviationsDetailPage";

// CAPA
import CapaListPage from "../pages/capa/CapaListPage";
import CapaCreatePage from "../pages/capa/CapaCreatePage";
import CapaDetailPage from "../pages/capa/CapaDetailPage";

// Change Control
import ChangeControlListPage from "../pages/change-control/ChangeControlListPage";
import ChangeControlCreatePage from "../pages/change-control/ChangeControlCreatePage";
import ChangeControlDetailPage from "../pages/change-control/ChangeControlDetailPage";

const isAuthed = () => authService.isAuthenticated();

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected App */}
      <Route
        path="/"
        element={isAuthed() ? <AppLayout /> : <Navigate to="/login" replace />}
      >
        {/* Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* DMS */}
        <Route
          path="dms"
          element={
            <RequirePermission moduleKey="dms">
              <DmsListPage />
            </RequirePermission>
          }
        />
        <Route
          path="dms/new"
          element={
            <RequirePermission moduleKey="dms">
              <DmsCreatePage />
            </RequirePermission>
          }
        />
        <Route
          path="dms/:id"
          element={
            <RequirePermission moduleKey="dms">
              <DmsDetailPage />
            </RequirePermission>
          }
        />

        {/* Training */}
        <Route
          path="training"
          element={
            <RequirePermission moduleKey="training">
              <TrainingListPage />
            </RequirePermission>
          }
        />
        <Route
          path="training/new"
          element={
            <RequirePermission moduleKey="training">
              <TrainingCreatePage />
            </RequirePermission>
          }
        />
        <Route
          path="training/:id"
          element={
            <RequirePermission moduleKey="training">
              <TrainingDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="training/matrix"
          element={
            <RequirePermission moduleKey="training_matrix">
              <TrainingMatrixPage />
            </RequirePermission>
          }
        />

        <Route
          path="training/employees/:id"
          element={
            <RequirePermission moduleKey="training_matrix">
              <EmployeeTrainingProfilePage />
            </RequirePermission>
          }
        />

        {/* Deviations */}
        <Route
          path="deviations"
          element={
            <RequirePermission moduleKey="deviations">
              <DeviationsListPage />
            </RequirePermission>
          }
        />
        <Route
          path="deviations/new"
          element={
            <RequirePermission moduleKey="deviations">
              <DeviationsCreatePage />
            </RequirePermission>
          }
        />
        <Route
          path="deviations/:id"
          element={
            <RequirePermission moduleKey="deviations">
              <DeviationsDetailPage />
            </RequirePermission>
          }
        />

        {/* CAPA */}
        <Route
          path="capa"
          element={
            <RequirePermission moduleKey="capa">
              <CapaListPage />
            </RequirePermission>
          }
        />
        <Route
          path="capa/new"
          element={
            <RequirePermission moduleKey="capa">
              <CapaCreatePage />
            </RequirePermission>
          }
        />
        <Route
          path="capa/:id"
          element={
            <RequirePermission moduleKey="capa">
              <CapaDetailPage />
            </RequirePermission>
          }
        />

        {/* Change Control */}
        <Route
          path="change-control"
          element={
            <RequirePermission moduleKey="change">
              <ChangeControlListPage />
            </RequirePermission>
          }
        />
        <Route
          path="change-control/new"
          element={
            <RequirePermission moduleKey="change">
              <ChangeControlCreatePage />
            </RequirePermission>
          }
        />
        <Route
          path="change-control/:id"
          element={
            <RequirePermission moduleKey="change">
              <ChangeControlDetailPage />
            </RequirePermission>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
