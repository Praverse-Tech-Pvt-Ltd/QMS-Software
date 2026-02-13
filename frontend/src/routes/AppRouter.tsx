import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import RequirePermission from "./RequirePermission";
import AuthGuard from "../components/auth/AuthGuard"; // ✅ The Bouncer

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import AccessDeniedPage from "../pages/auth/AccessDeniedPage";

// Dashboard & Daily Usage
import DashboardPage from "../pages/dashboard/DashboardPage";
import MyTasksPage from "../pages/dashboard/MyTasksPage";
import ReportsPage from "../pages/dashboard/ReportsPage";

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

// Settings
import SettingsPage from "../pages/settings/SettingsPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* --- Protected Routes (Wrapped in AuthGuard) --- */}
      {/* 1. The AuthGuard checks if user is logged in.
          2. If yes, it renders the Outlet (which is AppLayout).
          3. AppLayout renders the specific page (Dashboard, DMS, etc.).
      */}
      <Route element={<AuthGuard />}>
        <Route path="/" element={<AppLayout />}>
          
          {/* Dashboard */}
          <Route
            index
            element={
              <RequirePermission moduleKey="dashboard">
                <DashboardPage />
              </RequirePermission>
            }
          />

          <Route path="tasks" element={<MyTasksPage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* DMS Module */}
          <Route path="dms">
            <Route
              index
              element={
                <RequirePermission moduleKey="dms">
                  <DmsListPage />
                </RequirePermission>
              }
            />
            <Route
              path="new"
              element={
                <RequirePermission moduleKey="dms">
                  <DmsCreatePage />
                </RequirePermission>
              }
            />
            <Route
              path=":id"
              element={
                <RequirePermission moduleKey="dms">
                  <DmsDetailPage />
                </RequirePermission>
              }
            />
          </Route>

          {/* Training Module */}
          <Route path="training">
            <Route
              index
              element={
                <RequirePermission moduleKey="training">
                  <TrainingListPage />
                </RequirePermission>
              }
            />
            <Route
              path="new"
              element={
                <RequirePermission moduleKey="training">
                  <TrainingCreatePage />
                </RequirePermission>
              }
            />
            <Route
              path=":id"
              element={
                <RequirePermission moduleKey="training">
                  <TrainingDetailPage />
                </RequirePermission>
              }
            />
            <Route
              path="matrix"
              element={
                <RequirePermission moduleKey="training_matrix">
                  <TrainingMatrixPage />
                </RequirePermission>
              }
            />
            <Route
              path="employees/:id"
              element={
                <RequirePermission moduleKey="training_matrix">
                  <EmployeeTrainingProfilePage />
                </RequirePermission>
              }
            />
          </Route>

          {/* Deviations Module */}
          <Route path="deviations">
            <Route
              index
              element={
                <RequirePermission moduleKey="deviations">
                  <DeviationsListPage />
                </RequirePermission>
              }
            />
            <Route
              path="new"
              element={
                <RequirePermission moduleKey="deviations">
                  <DeviationsCreatePage />
                </RequirePermission>
              }
            />
            <Route
              path=":id"
              element={
                <RequirePermission moduleKey="deviations">
                  <DeviationsDetailPage />
                </RequirePermission>
              }
            />
          </Route>

          {/* CAPA Module */}
          <Route path="capa">
            <Route
              index
              element={
                <RequirePermission moduleKey="capa">
                  <CapaListPage />
                </RequirePermission>
              }
            />
            <Route
              path="new"
              element={
                <RequirePermission moduleKey="capa">
                  <CapaCreatePage />
                </RequirePermission>
              }
            />
            <Route
              path=":id"
              element={
                <RequirePermission moduleKey="capa">
                  <CapaDetailPage />
                </RequirePermission>
              }
            />
          </Route>

          {/* Change Control Module */}
          <Route path="change-control">
            <Route
              index
              element={
                <RequirePermission moduleKey="change">
                  <ChangeControlListPage />
                </RequirePermission>
              }
            />
            <Route
              path="new"
              element={
                <RequirePermission moduleKey="change">
                  <ChangeControlCreatePage />
                </RequirePermission>
              }
            />
            <Route
              path=":id"
              element={
                <RequirePermission moduleKey="change">
                  <ChangeControlDetailPage />
                </RequirePermission>
              }
            />
          </Route>

          {/* Settings - All roles can access (for personal preferences) */}
          <Route path="settings" element={<SettingsPage />} />

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}