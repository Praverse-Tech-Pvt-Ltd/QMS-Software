import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Divider,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Grid
} from "@mui/material";


import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";

// --- IMPORTS ---
import { trainingService, type TrainingPlan } from "../../services/training.service"; 
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// --- COMPONENTS ---
import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import SignatureStamp from "../../components/qms/SignatureStamp";
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal";
import UserSelectionModal from "../../components/common/UserSelectionModal";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import WorkflowActionsPanel from "../../components/qms/WorkflowActionsPanel";
import { WORKFLOWS } from "../../config/workflows";

// Module Specific Components
import VersionHistoryPanel from "../../components/dms/VersionHistoryPanel";
import VersionCompareModal from "../../components/dms/VersionCompareModal";
import ControlledCopyPrintModal from "../../components/dms/ControlledCopyPrintModal";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import SignatureLogTable from "../../components/qms/SignatureLogTable";
import ActivityLog from "../../components/qms/ActivityLog";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// ✅ HELPER: Map Backend Status to UI Workflow Status
const mapStatusToWorkflow = (backendStatus: string): any => {
  // Cast to string to avoid "no overlap" TS errors if interface is too strict
  const status = backendStatus as string;
  switch (status) {
    case "DRAFT": return "Draft";
    case "ACTIVE": return "Effective"; // Map 'Active' to 'Effective'
    case "EFFECTIVE": return "Effective"; 
    case "OBSOLETE": return "Obsolete";
    default: return "Draft";
  }
};

export default function TrainingDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  // 1. DATA FETCHING
  const [record, setRecord] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. LOCAL STATE
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // DMS/Training Specific State
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ old: "", new: "" });
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // 3. LOAD DATA
  const loadData = async () => {
      const safeId = id || ""; 
      if (!safeId) return;

      try {
          setLoading(true);
          const data = await trainingService.getById(safeId);
          setRecord(data);
      } catch (err) {
          console.error(err);
          setError("Failed to load Training Plan.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      loadData();
  }, [id]);

  // 4. PERMISSIONS
  const canEdit = role && record
    ? permissionService.can(role, 'training', 'edit') && (record.status === 'DRAFT')
    : false;

  // 5. HANDLERS
  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async (reason?: string) => {
    const safeId = id || "";
    if (!record || !safeId) return;

    try {
        console.log("Saving with reason:", reason);
        await trainingService.update(safeId, { ...record });
        setSaveDialogOpen(false);
        loadData();
    } catch (err) {
        alert("Failed to save changes.");
    }
  };

  const handleAddReviewer = (user: any) => {
    console.log("Assigning Reviewer:", user);
    setAssignModalOpen(false);
  };

  const handleCompare = (vOld: string, vNew: string) => {
    setCompareVersions({ old: vOld, new: vNew });
    setCompareModalOpen(true);
  };

  const handleValidate = () => {
    if (record?.status === "DRAFT" && !record.title) {
       return "Title is required.";
    }
    return true;
  };

  if (loading) return <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /> <Typography>Loading Training Plan...</Typography></Box>;
  if (error || !record) return <Box sx={{ p: 5 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <>
      <DetailTabsLayout
        title={`${record.id}: ${record.title}`}
        subtitle={`Plan ID: ${id}`}
        backTo="/training"
        
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {/* ✅ FIXED: Cast to string to bypass strict type checking for statuses that might be missing in type definition */}
            {((record.status as string) === "ACTIVE" || (record.status as string) === "EFFECTIVE") && (
              <SignatureStamp
                isSigned={true}
                signedBy="QA Manager"
                date={new Date().toLocaleDateString()}
              />
            )}
            <StatusChip status={mapStatusToWorkflow(record.status)} />
          </Box>
        }

        // RIGHT PANEL: Workflow & Stats
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline
              currentStatus={mapStatusToWorkflow(record.status)}
              steps={WORKFLOWS.training.steps}
            />

            <WorkflowActionsPanel
              recordId={id || ""}
              moduleKey="training"
              meta={{
                ...record,
                id: record.id.toString(), 
                moduleKey: "training",
                status: mapStatusToWorkflow(record.status), 
                approvalRequests: [],
                approvalsLog: [],
                signatureLog: []
              }}
              onUpdated={loadData}
              onValidate={handleValidate}
            />

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Plan Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Total Trainees</Typography>
                  <Typography variant="body2">{(record as any).totalTrainees || 0}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Completion</Typography>
                  <Typography variant="body2">{(record as any).completionRate || 0}%</Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        }

        // TAB 1: OVERVIEW (Configuration)
        overview={
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Training Configuration
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    size="small"
                    onClick={() => setPrintModalOpen(true)}
                >
                    Print Plan
                </Button>
                {canEdit && (
                    <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveClick}
                    size="small"
                    >
                    Save Changes
                    </Button>
                )}
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Training Method"
                  defaultValue={record.method}
                  fullWidth
                  disabled={!canEdit}
                >
                  <MenuItem value="Classroom">Classroom</MenuItem>
                  <MenuItem value="Online">Online / SCORM</MenuItem>
                  <MenuItem value="Read">Read & Understand</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Duration (Minutes)"
                  type="number"
                  defaultValue={record.duration_minutes}
                  fullWidth
                  disabled={!canEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Pass Score (%)"
                  type="number"
                  defaultValue={(record as any).passScore || 80}
                  fullWidth
                  disabled={!canEdit}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Learning Objectives"
                  defaultValue={record.description}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={!canEdit}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Trainer / Coordinator"
                  defaultValue={record.trainer}
                  fullWidth
                  disabled={!canEdit}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: "grid", gap: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Plan Lifecycle
                </Typography>
                <VersionHistoryPanel
                    currentVersion={(record as any).version || "v1.0"}
                    rows={[]} 
                    onView={(v) => console.log("View:", v)}
                    onCompare={handleCompare}
                />
            </Box>
          </Box>
        }

        // TAB 2: MATERIALS
        attachments={
            <AttachmentsUploader
                readOnly={!canEdit}
                title="Training Materials"
                acceptedFormats=".pdf,.ppt,.pptx"
            />
        }

        // TAB 3: APPROVALS
        approvals={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ApprovalsPanel
              requests={[]} 
              canAddReviewer={canEdit}
              onAddReviewer={() => setAssignModalOpen(true)}
            />
            <SignatureLogTable rows={[]} />
          </Box>
        }

        // TAB 4: AUDIT TRAIL
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ActivityLog />
            <Divider />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Audit Log
            </Typography>
            <AuditTrailTable rows={[]} /> 
          </Box>
        }
      />

      {/* --- MODALS --- */}
      <UserSelectionModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSelect={handleAddReviewer}
        title="Assign Training Approver"
      />

      <ReasonForChangeModal
        open={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        onConfirm={(reason) => {
             setReasonModalOpen(false);
             handleConfirmSave(reason);
        }}
      />

      <ConfirmDialog 
        open={saveDialogOpen}
        title="Save Training Plan?"
        message="This will update the training configuration."
        confirmText="Save"
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={() => {
             handleConfirmSave();
        }}
      />

      <VersionCompareModal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        oldVersion={compareVersions.old}
        newVersion={compareVersions.new}
      />

      <ControlledCopyPrintModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        docTitle={record.title}
        docId={record.id.toString()}
        version={(record as any).version || "v1.0"}
      />
    </>
  );
}