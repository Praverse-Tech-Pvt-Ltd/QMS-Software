import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  Box,
  Grid, // ✅ Grid v2
  TextField,
  Typography,
  Divider,
  MenuItem,
  Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";

// --- ENGINEERING STANDARDS IMPORTS ---
import { useFetch } from "../../hooks/useFetch";
import { trainingService } from "../../services/training.service"; // ✅ Service
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
import ConfirmDialog from "../../components/common/ConfirmDialog";import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";
// --- COMPONENT IMPORTS ---
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

export default function TrainingDetailPage() {
  const { id } = useParams();

  // 1. DATA FETCHING
  const { 
    data: record, 
    isLoading, 
    error, 
    refetch 
  } = useFetch(() => trainingService.getById(id || ""), [id]);

  // 2. LOCAL STATE
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // DMS/Training Specific State
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ old: "", new: "" });
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // 3. PERMISSIONS (Mocked logic)
  const canEdit = record?.status === 'Draft' || record?.status === 'Review';

  // 4. HANDLERS
  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async () => {
    await trainingService.update(id!, { ...record });
    setSaveDialogOpen(false);
    refetch();
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
    // Training specific validation
    if (record?.status === "Draft" && !canEdit) {
       return "Please upload training materials first.";
    }
    return true;
  };

  // 5. LOADING / ERROR STATES
  if (isLoading) return <LoadingState message="Loading Training Plan..." />;
  if (error || !record) return <ErrorState onRetry={refetch} />;

  // 6. RENDER
  return (
    <>
      <DetailTabsLayout
        title={`${record.id}: ${record.title}`}
        subtitle={`Plan ID: ${id}`}
        backTo="/training"
        
        // Header Status Chip & Signature
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {(record.status === "Effective" || record.status === "Approved") && (
                <SignatureStamp
                  isSigned={true}
                  signedBy="QA Manager"
                  date={new Date().toLocaleDateString()}
                />
            )}
            <StatusChip status={record.status} />
          </Box>
        }

        // RIGHT PANEL: Workflow & Stats
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline
              currentStatus={record.status}
              steps={WORKFLOWS.training.steps}
            />

            <WorkflowActionsPanel
              recordId={id || ""}
              moduleKey="training"
              meta={record}
              onUpdated={refetch}
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
                  <Typography variant="body2">{record.totalTrainees}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Completion</Typography>
                  <Typography variant="body2">{record.completionRate}%</Typography>
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
                  defaultValue={record.duration}
                  fullWidth
                  disabled={!canEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Pass Score (%)"
                  type="number"
                  defaultValue={record.passScore}
                  fullWidth
                  disabled={!canEdit}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Learning Objectives"
                  defaultValue={record.objectives}
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
                    currentVersion={record.version}
                    rows={[
                        { version: "v2.0", status: "Draft", effectiveDate: "-", updatedBy: "Training Lead", updatedAt: "2024-02-10" },
                        { version: "v1.0", status: "Effective", effectiveDate: "2023-01-15", updatedBy: "QA Manager", updatedAt: "2023-01-15" },
                    ]}
                    onView={(v) => console.log("View:", v)}
                    onCompare={handleCompare}
                />
            </Box>
          </Box>
        }

        // TAB 2: MATERIALS (Attachments)
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
              requests={record.approvalRequests || []}
              canAddReviewer={canEdit}
              onAddReviewer={() => setAssignModalOpen(true)}
            />
            <SignatureLogTable rows={record.signatureLog || []} />
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
             handleConfirmSave();
        }}
      />

      <ConfirmDialog 
        open={saveDialogOpen}
        title="Save Training Plan?"
        message="This will update the training configuration. Version increment may be required."
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
        docId={record.id}
        version={record.version}
      />
    </>
  );
}