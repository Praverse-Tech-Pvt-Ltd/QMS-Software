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

// --- ENGINEERING STANDARDS IMPORTS ---
import { useFetch } from "../../hooks/useFetch";
import { capaService } from "../../services/capa.service"; // ✅ Service
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
import CapaActionPanel from "../../components/capa/CapaActionPanel";
import ClosureChecklist from "../../components/qms/ClosureChecklist";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import SignatureLogTable from "../../components/qms/SignatureLogTable";
import ActivityLog from "../../components/qms/ActivityLog";

export default function CapaDetailPage() {
  const { id } = useParams();

  // 1. DATA FETCHING
  const { 
    data: record, 
    isLoading, 
    error, 
    refetch 
  } = useFetch(() => capaService.getById(id || ""), [id]);

  // 2. LOCAL STATE
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // 3. PERMISSIONS (Mocked logic)
  const canEdit = record?.status !== 'Closed' && record?.status !== 'Cancelled';

  // 4. HANDLERS
  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async () => {
    await capaService.update(id!, { ...record });
    setSaveDialogOpen(false);
    refetch();
  };

  const handleAddReviewer = (user: any) => {
    console.log("Assigning CAPA Reviewer:", user);
    setAssignModalOpen(false);
  };

  const handleValidate = () => {
     // CAPA validation logic here
     return true;
  };

  // 5. LOADING / ERROR STATES
  if (isLoading) return <LoadingState message="Loading CAPA Record..." />;
  if (error || !record) return <ErrorState onRetry={refetch} />;

  // 6. RENDER
  return (
    <>
      <DetailTabsLayout
        title={`${record.id}: ${record.title}`}
        subtitle={`Record ID: ${id}`}
        backTo="/capa"
        
        // Header Status Chip & Signature
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {(record.status === "Effective" || record.status === "Closed") && (
                <SignatureStamp
                  isSigned={true}
                  signedBy="QA Manager"
                  date={new Date().toLocaleDateString()}
                />
            )}
            <StatusChip status={record.status} />
          </Box>
        }

        // RIGHT PANEL: Workflow Timeline & Actions
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline
              currentStatus={record.status}
              steps={WORKFLOWS.capa.steps}
            />

            <WorkflowActionsPanel
              recordId={id || ""}
              moduleKey="capa"
              meta={record}
              onUpdated={refetch}
              onValidate={handleValidate}
            />

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Record Metadata
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Source</Typography>
                  <Typography variant="body2">{record.source}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Risk Level</Typography>
                  <Typography variant="body2">{record.riskLevel}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        }

        // TAB 1: OVERVIEW (CAPA Form)
        overview={
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Problem & Investigation
              </Typography>
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

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="CAPA Type"
                  defaultValue={record.type}
                  fullWidth
                  disabled={!canEdit}
                >
                  <MenuItem value="Corrective">Corrective</MenuItem>
                  <MenuItem value="Preventive">Preventive</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Target Date"
                  type="date"
                  defaultValue={record.targetDate}
                  fullWidth
                  disabled={!canEdit}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Owner"
                  defaultValue={record.owner}
                  fullWidth
                  disabled={!canEdit}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Problem Statement"
                  defaultValue={record.description}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={!canEdit}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Root Cause Analysis (RCA)"
                  defaultValue={record.rootCause}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={!canEdit}
                  helperText="Use 5 Whys or Fishbone method"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Proposed Action Plan"
                  defaultValue={record.proposedPlan}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={!canEdit}
                />
              </Grid>
            </Grid>
          </Box>
        }

        // TAB 2: ACTION PLAN (Detailed Steps)
        plan={
          <Box sx={{ p: 1 }}>
            <CapaActionPanel readOnly={!canEdit} />
            
            {record.status === "Verification" && (
              <Box sx={{ mt: 3 }}>
                <ClosureChecklist />
              </Box>
            )}
          </Box>
        }

        // TAB 3: ATTACHMENTS
        attachments={<AttachmentsUploader readOnly={!canEdit} />}

        // TAB 4: APPROVALS
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

        // TAB 5: AUDIT TRAIL
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
        title="Assign CAPA Approver"
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
        title="Save CAPA Record?"
        message="This will update the investigation details. Ensure RCA is complete before saving."
        confirmText="Save"
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={() => {
             // Optional: Force reason modal
             // setReasonModalOpen(true);
             handleConfirmSave();
        }}
      />
    </>
  );
}