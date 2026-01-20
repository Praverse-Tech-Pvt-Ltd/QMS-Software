import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LoginPage from "../pages/auth/LoginPage";
import AppLayout from "../components/layout/AppLayout";
import DmsListPage from "../pages/dms/DmsListPage";
import TrainingListPage from "../pages/training/TrainingListPage";
import DeviationsListPage from "../pages/deviations/DeviationsListPage";
import CapaListPage from "../pages/capa/CapaListPage";
import ChangeControlListPage from "../pages/change-control/ChangeControlListPage";

const isAuthed = () => {
  return localStorage.getItem("qms_token") === "demo";
};

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          isAuthed() ? (
            <AppLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dms" element={<DmsListPage />} />
        <Route path="training" element={<TrainingListPage />} />
        <Route path="deviations" element={<DeviationsListPage />} />
        <Route path="capa" element={<CapaListPage />} />
        <Route path="change-control" element={<ChangeControlListPage />} />

        {/* Module routes will come tomorrow */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
