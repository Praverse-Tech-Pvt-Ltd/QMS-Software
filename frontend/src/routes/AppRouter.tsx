import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import RequirePermission from "./RequirePermission";
import AuthGuard from "../components/auth/AuthGuard";

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

// --- New QMS Modules ---
import AuditsListPage from "../pages/audits/AuditsListPage";
import AuditDetailPage from "../pages/audits/AuditDetailPage";
import ComplaintsListPage from "../pages/complaints/ComplaintsListPage";
import ComplaintDetailPage from "../pages/complaints/ComplaintDetailPage";
import RisksListPage from "../pages/risks/RisksListPage";
import RiskDetailPage from "../pages/risks/RiskDetailPage";
import SuppliersListPage from "../pages/suppliers/SuppliersListPage";
import SupplierDetailPage from "../pages/suppliers/SupplierDetailPage";
import NCListPage from "../pages/nonconformance/NCListPage";
import NCDetailPage from "../pages/nonconformance/NCDetailPage";
import OOSListPage from "../pages/oos/OOSListPage";
import OOSDetailPage from "../pages/oos/OOSDetailPage";
import LaboratoryListPage from "../pages/laboratory/LaboratoryListPage";
import SampleDetailPage from "../pages/laboratory/SampleDetailPage";
import ASLPage from "../pages/suppliers/ASLPage";
import BatchRecordsListPage from "../pages/batch-records/BatchRecordsListPage";
import BPRDetailPage from "../pages/batch-records/BPRDetailPage";
import ManagementReviewPage from "../pages/management-reports/ManagementReviewPage";
import APQRDetailPage from "../pages/management-reports/APQRDetailPage";
import KnowledgePage from "../pages/knowledge/KnowledgePage";

export default function AppRouter() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      <Route element={<AuthGuard />}>
        <Route path="/" element={<AppLayout />}>

          {/* Dashboard */}
          <Route index element={<RequirePermission moduleKey="dashboard"><DashboardPage /></RequirePermission>} />
          <Route path="tasks" element={<MyTasksPage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* DMS */}
          <Route path="dms">
            <Route index element={<RequirePermission moduleKey="dms"><DmsListPage /></RequirePermission>} />
            <Route path="new" element={<RequirePermission moduleKey="dms"><DmsCreatePage /></RequirePermission>} />
            <Route path=":id" element={<RequirePermission moduleKey="dms"><DmsDetailPage /></RequirePermission>} />
          </Route>

          {/* Training */}
          <Route path="training">
            <Route index element={<RequirePermission moduleKey="training"><TrainingListPage /></RequirePermission>} />
            <Route path="new" element={<RequirePermission moduleKey="training"><TrainingCreatePage /></RequirePermission>} />
            <Route path=":id" element={<RequirePermission moduleKey="training"><TrainingDetailPage /></RequirePermission>} />
            <Route path="matrix" element={<RequirePermission moduleKey="training_matrix"><TrainingMatrixPage /></RequirePermission>} />
            <Route path="employees/:id" element={<RequirePermission moduleKey="training_matrix"><EmployeeTrainingProfilePage /></RequirePermission>} />
          </Route>

          {/* Deviations */}
          <Route path="deviations">
            <Route index element={<RequirePermission moduleKey="deviations"><DeviationsListPage /></RequirePermission>} />
            <Route path="new" element={<RequirePermission moduleKey="deviations"><DeviationsCreatePage /></RequirePermission>} />
            <Route path=":id" element={<RequirePermission moduleKey="deviations"><DeviationsDetailPage /></RequirePermission>} />
          </Route>

          {/* CAPA */}
          <Route path="capa">
            <Route index element={<RequirePermission moduleKey="capa"><CapaListPage /></RequirePermission>} />
            <Route path="new" element={<RequirePermission moduleKey="capa"><CapaCreatePage /></RequirePermission>} />
            <Route path=":id" element={<RequirePermission moduleKey="capa"><CapaDetailPage /></RequirePermission>} />
          </Route>

          {/* Change Control */}
          <Route path="change-control">
            <Route index element={<RequirePermission moduleKey="change"><ChangeControlListPage /></RequirePermission>} />
            <Route path="new" element={<RequirePermission moduleKey="change"><ChangeControlCreatePage /></RequirePermission>} />
            <Route path=":id" element={<RequirePermission moduleKey="change"><ChangeControlDetailPage /></RequirePermission>} />
          </Route>

          {/* Audits */}
          <Route path="audits">
            <Route index element={<RequirePermission moduleKey="audits"><AuditsListPage /></RequirePermission>} />
            <Route path="new" element={<RequirePermission moduleKey="audits"><AuditsListPage /></RequirePermission>} />
            <Route path=":id" element={<RequirePermission moduleKey="audits"><AuditDetailPage /></RequirePermission>} />
          </Route>

          {/* Complaints */}
          <Route path="complaints">
            <Route index element={<RequirePermission moduleKey="complaints"><ComplaintsListPage /></RequirePermission>} />
            <Route path="new" element={<RequirePermission moduleKey="complaints"><ComplaintsListPage /></RequirePermission>} />
            <Route path=":id" element={<RequirePermission moduleKey="complaints"><ComplaintDetailPage /></RequirePermission>} />
          </Route>

          {/* Risk */}
          <Route path="risks">
            <Route index element={<RequirePermission moduleKey="risks"><RisksListPage /></RequirePermission>} />
            <Route path="new" element={<RequirePermission moduleKey="risks"><RisksListPage /></RequirePermission>} />
            <Route path=":id" element={<RequirePermission moduleKey="risks"><RiskDetailPage /></RequirePermission>} />
          </Route>

          {/* Suppliers — asl MUST be before :id */}
          <Route path="suppliers">
            <Route index element={<RequirePermission moduleKey="suppliers"><SuppliersListPage /></RequirePermission>} />
            <Route path="new" element={<RequirePermission moduleKey="suppliers"><SuppliersListPage /></RequirePermission>} />
            <Route path="asl" element={<RequirePermission moduleKey="suppliers"><ASLPage /></RequirePermission>} />
            <Route path=":id" element={<RequirePermission moduleKey="suppliers"><SupplierDetailPage /></RequirePermission>} />
          </Route>

          {/* Non-Conformance */}
          <Route path="nonconformance">
            <Route index element={<RequirePermission moduleKey="nonconformance"><NCListPage /></RequirePermission>} />
            <Route path="new" element={<RequirePermission moduleKey="nonconformance"><NCListPage /></RequirePermission>} />
            <Route path=":id" element={<RequirePermission moduleKey="nonconformance"><NCDetailPage /></RequirePermission>} />
          </Route>

          {/* OOS */}
          <Route path="oos">
            <Route index element={<RequirePermission moduleKey="oos"><OOSListPage /></RequirePermission>} />
            <Route path="new" element={<RequirePermission moduleKey="oos"><OOSListPage /></RequirePermission>} />
            <Route path=":id" element={<RequirePermission moduleKey="oos"><OOSDetailPage /></RequirePermission>} />
          </Route>

          {/* Laboratory */}
          <Route path="laboratory">
            <Route index element={<RequirePermission moduleKey="laboratory"><LaboratoryListPage /></RequirePermission>} />
            <Route path="samples/new" element={<RequirePermission moduleKey="laboratory"><LaboratoryListPage /></RequirePermission>} />
            <Route path="samples/:id" element={<RequirePermission moduleKey="laboratory"><SampleDetailPage /></RequirePermission>} />
            <Route path="tests/:id" element={<RequirePermission moduleKey="laboratory"><LaboratoryListPage /></RequirePermission>} />
          </Route>

          {/* Batch Records */}
          <Route path="batch-records">
            <Route index element={<RequirePermission moduleKey="batch_records"><BatchRecordsListPage /></RequirePermission>} />
            <Route path="mbr/new" element={<RequirePermission moduleKey="batch_records"><BatchRecordsListPage /></RequirePermission>} />
            <Route path="mbr/:id" element={<RequirePermission moduleKey="batch_records"><BatchRecordsListPage /></RequirePermission>} />
            <Route path="bpr/new" element={<RequirePermission moduleKey="batch_records"><BatchRecordsListPage /></RequirePermission>} />
            <Route path="bpr/:id" element={<RequirePermission moduleKey="batch_records"><BPRDetailPage /></RequirePermission>} />
          </Route>

          {/* Management Reports */}
          <Route path="management-review">
            <Route index element={<RequirePermission moduleKey="reports"><ManagementReviewPage /></RequirePermission>} />
            <Route path="apqr/:id" element={<RequirePermission moduleKey="reports"><APQRDetailPage /></RequirePermission>} />
          </Route>

          {/* Knowledge Base */}
          <Route path="knowledge" element={<RequirePermission moduleKey="knowledge"><KnowledgePage /></RequirePermission>} />

          {/* /quality/* — PRD-specified paths (aliases alongside old paths) */}
          <Route path="quality">
            <Route path="deviations">
              <Route index element={<RequirePermission moduleKey="deviations"><DeviationsListPage /></RequirePermission>} />
              <Route path=":id" element={<RequirePermission moduleKey="deviations"><DeviationsDetailPage /></RequirePermission>} />
            </Route>
            <Route path="capa">
              <Route index element={<RequirePermission moduleKey="capa"><CapaListPage /></RequirePermission>} />
              <Route path=":id" element={<RequirePermission moduleKey="capa"><CapaDetailPage /></RequirePermission>} />
            </Route>
            <Route path="change-control">
              <Route index element={<RequirePermission moduleKey="change"><ChangeControlListPage /></RequirePermission>} />
              <Route path=":id" element={<RequirePermission moduleKey="change"><ChangeControlDetailPage /></RequirePermission>} />
            </Route>
          </Route>

          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
