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
  Grid, // ✅ Standardized Grid Import
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";

// --- IMPORTS ---
import { capaService, type CapaRecord } from "../../services/capa.service";
import { useRole } from "../../app/providers/RoleProvider";

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
import CapaActionPanel from "../../components/capa/CapaActionPanel";
import ClosureChecklist from "../../components/qms/ClosureChecklist";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import SignatureLogTable from "../../components/qms/SignatureLogTable";
import ActivityLog from "../../components/qms/ActivityLog";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// ✅ HELPER: Map Backend Status to UI Workflow Status
const mapStatusToWorkflow = (backendStatus: string): any => {
  switch (backendStatus) {
    case "PLANNING":
      return "Draft";
    case "PENDING":
      return "In Progress";
    case "IMPLEMENTATION":
      return "In Progress";
    case "VERIFICATION":
      return "Review";
    case "CLOSED":
      return "Closed";
    default:
      return "Draft";
  }
};

export default function CapaDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  // 1. DATA FETCHING
  const [record, setRecord] = useState<CapaRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. LOCAL STATE
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // 3. LOAD DATA
  const loadData = async () => {
    const safeId = id || "";
    if (!safeId) return;

    try {
      setLoading(true);
      const data = await capaService.getById(safeId);
      setRecord(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load CAPA record.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // 4. PERMISSIONS
  const canEdit =
    role && record
      ? record.status !== "CLOSED" && record.status !== "VERIFICATION"
      : false;

  // 5. HANDLERS
  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async (reason?: string) => {
    const safeId = id || "";
    if (!record || !safeId) return;

    try {
      console.log("Saving with reason:", reason);
      await capaService.update(safeId, { ...record });
      setSaveDialogOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to save changes.");
    }
  };

  const handleFieldChange = (field: keyof CapaRecord, value: any) => {
    if (record) setRecord({ ...record, [field]: value });
  };

  const handleAddReviewer = (user: any) => {
    console.log("Assigning CAPA Reviewer:", user);
    setAssignModalOpen(false);
  };

  const handleValidate = () => {
    return true;
  };

  if (loading)
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress /> <Typography>Loading CAPA Record...</Typography>
      </Box>
    );
  if (error || !record)
    return (
      <Box sx={{ p: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <>
      <DetailTabsLayout
        title={`${record.capa_id || record.id}: ${record.title}`}
        subtitle={`Record ID: ${id}`}
        backTo="/capa"
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {record.status === "CLOSED" && (
              <SignatureStamp
                isSigned={true}
                signedBy="QA Manager"
                date={new Date().toLocaleDateString()}
              />
            )}
            <StatusChip status={record.status} />
          </Box>
        }
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline
              currentStatus={mapStatusToWorkflow(record.status)}
              steps={WORKFLOWS.capa.steps}
            />

            <WorkflowActionsPanel
              recordId={id || ""}
              moduleKey="capa"
              meta={{
                ...record,
                id: record.id.toString(),
                moduleKey: "capa",
                status: mapStatusToWorkflow(record.status),
                approvalRequests: [],
                approvalsLog: [],
                signatureLog: [],
              }}
              onUpdated={loadData}
              onValidate={handleValidate}
            />

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Record Metadata
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Source
                  </Typography>
                  <Typography variant="body2">
                    {record.deviation
                      ? `Deviation #${record.deviation}`
                      : "Manual"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Priority
                  </Typography>
                  <Typography variant="body2">
                    {record.action_type || "Standard"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        }
        overview={
          <Box sx={{ p: 1 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
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
                  value={record.action_type}
                  fullWidth
                  disabled={!canEdit}
                >
                  <MenuItem value="CORRECTIVE">Corrective</MenuItem>
                  <MenuItem value="PREVENTIVE">Preventive</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Target Date"
                  type="date"
                  value={record.due_date}
                  fullWidth
                  disabled={!canEdit}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Owner"
                  defaultValue="QA Lead"
                  fullWidth
                  disabled={!canEdit}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Problem Statement"
                  value={record.description}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={!canEdit}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Root Cause Analysis (RCA)"
                  value={record.root_cause || ""}
                  onChange={(e) =>
                    handleFieldChange("root_cause", e.target.value)
                  }
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
                  defaultValue=""
                  fullWidth
                  multiline
                  rows={3}
                  disabled={!canEdit}
                />
              </Grid>
            </Grid>
          </Box>
        }
        plan={
          <Box sx={{ p: 1 }}>
            <CapaActionPanel readOnly={!canEdit} />

            {record.status === "VERIFICATION" && (
              <Box sx={{ mt: 3 }}>
                <ClosureChecklist />
              </Box>
            )}
          </Box>
        }
        attachments={<AttachmentsUploader readOnly={!canEdit} />}
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
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ActivityLog />
            <Divider />

            {/* ✅ FIXED: Separate Title from AuditTrailTable */}
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Audit Log
            </Typography>
            <AuditTrailTable rows={record.audit_trail || []} />
          </Box>
        }
      />

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
          handleConfirmSave(reason);
        }}
      />

      <ConfirmDialog
        open={saveDialogOpen}
        title="Save CAPA Record?"
        message="This will update the investigation details."
        confirmText="Save"
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={() => {
          handleConfirmSave();
        }}
      />
    </>
  );
}
