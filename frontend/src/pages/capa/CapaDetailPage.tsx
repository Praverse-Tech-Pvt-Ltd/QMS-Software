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
  Grid,
  Stack,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

// --- SERVICES ---
import { capaService, type CapaRecord } from "../../services/capa.service";
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

import CapaActionPanel from "../../components/capa/CapaActionPanel";
import AddCapaActionModal from "../../components/capa/AddCapaActionModal";
import ClosureChecklist from "../../components/qms/ClosureChecklist";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import ActivityLog from "../../components/qms/ActivityLog";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function CapaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const { enqueueSnackbar } = useSnackbar();

  const [record, setRecord] = useState<CapaRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [addActionModalOpen, setAddActionModalOpen] = useState(false);

  const loadData = async () => {
    // ✅ Fix: Guard against undefined id
    if (!id) return;
    try {
      setLoading(true);
      const data = await capaService.getById(id);
      setRecord(data);
    } catch (err) {
      setError("Failed to load CAPA record.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const canEdit =
    role && record
      ? permissionService.can(role, "capa", "edit") &&
        record.status !== "CLOSED"
      : false;

  const handleFieldChange = (field: keyof CapaRecord, value: any) => {
    if (record) setRecord({ ...record, [field]: value });
  };

  const handleSaveClick = () => setReasonModalOpen(true);

  const handleConfirmSave = async (reason?: string) => {
    if (!record || !id) return;
    try {
      // ✅ Use record.id (number) converted to string for the API call
      await capaService.update(String(record.id), {
        ...record,
        change_reason: reason || "Investigation details updated",
      } as any);
      setSaveDialogOpen(false);
      enqueueSnackbar("CAPA updated successfully", { variant: "success" });
      loadData();
    } catch (err) {
      enqueueSnackbar("Save failed", { variant: "error" });
    }
  };

  const handleAddAction = async (actionData: any) => {
    if (!record) return;
    try {
      await capaService.addAction(String(record.id), actionData);
      setAddActionModalOpen(false);
      enqueueSnackbar("Action item added", { variant: "success" });
      loadData();
    } catch (err) {
      enqueueSnackbar("Failed to add action", { variant: "error" });
    }
  };

  if (loading)
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Synchronizing Quality Data...</Typography>
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
        title={`${record.capa_id}: ${record.title}`}
        subtitle={`Investigation Source: ${record.source || "Internal Initiation"}`}
        backTo="/capa"
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {record.status === "CLOSED" && (
              <SignatureStamp
                isSigned={true}
                signedBy="Quality Assurance"
                date={new Date().toLocaleDateString()}
              />
            )}
            <StatusChip status={record.status} />
          </Box>
        }
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline
              currentStatus={record.status}
              steps={WORKFLOWS.capa.steps}
            />
            <WorkflowActionsPanel
              recordId={id ?? ""} // ✅ Use fallback for string safety
              moduleKey="capa"
              onUpdated={loadData}
              meta={{ ...record, id: id ?? "", status: record.status } as any}
              onValidate={() => {
                if (!record.root_cause)
                  return "Verified root cause is mandatory for plan approval.";
                if (
                  record.status === "PLANNING" &&
                  (record.actions?.length || 0) === 0
                ) {
                  return "At least one action item must be defined in the plan.";
                }
                return true;
              }}
            />
            <Divider />
            <Box sx={{ p: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                }}
              >
                Quick Metadata
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    DEPARTMENT
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {record.department}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    SOURCE REFERENCE
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {record.source || "Direct Initiation"}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        }
        overview={
          <Box sx={{ p: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 4,
                alignItems: "center",
              }}
            >
              <Typography variant="h6" fontWeight={900}>
                Investigation & RCA
              </Typography>
              {canEdit && (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveClick}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  Commit Changes
                </Button>
              )}
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Action Type"
                  value={record.action_type}
                  fullWidth
                  disabled={!canEdit}
                  onChange={(e) =>
                    handleFieldChange("action_type", e.target.value)
                  }
                >
                  <MenuItem value="CORRECTIVE">Corrective Action</MenuItem>
                  <MenuItem value="PREVENTIVE">Preventive Action</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Target Closure Date"
                  type="date"
                  value={record.due_date}
                  fullWidth
                  disabled={!canEdit}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(e) =>
                    handleFieldChange("due_date", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Lead Owner"
                  value={record.owner || "Unassigned"}
                  fullWidth
                  disabled
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
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Verified Root Cause"
                  value={record.root_cause || ""}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={!canEdit}
                  placeholder="Summarize findings from the root cause analysis..."
                  onChange={(e) =>
                    handleFieldChange("root_cause", e.target.value)
                  }
                  helperText="Required before moving to Implementation."
                />
              </Grid>
            </Grid>
          </Box>
        }
        plan={
          <Box sx={{ p: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography variant="h6" fontWeight={900}>
                Action Plan Implementation
              </Typography>
              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setAddActionModalOpen(true)}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  Add Action Item
                </Button>
              )}
            </Box>

            <CapaActionPanel
              actions={record.actions || []}
              readOnly={!canEdit}
            />

            {(record.status === "VERIFICATION" ||
              record.status === "VERIFIED") && (
              <Box sx={{ mt: 6 }}>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                  Closure Effectiveness Verification
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <ClosureChecklist />
              </Box>
            )}
          </Box>
        }
        attachments={<AttachmentsUploader readOnly={!canEdit} />}
        approvals={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ApprovalsPanel
              requests={record.approvalRequests || []}
              canAddReviewer={canEdit}
              onAddReviewer={() => setAssignModalOpen(true)}
            />
            <AuditTrailTable rows={record.signatures || []} />
          </Box>
        }
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ActivityLog />
            <Typography variant="h6" fontWeight={900}>
              Audit Log
            </Typography>
            <AuditTrailTable rows={record.audit_trail || []} />
          </Box>
        }
      />

      <AddCapaActionModal
        open={addActionModalOpen}
        onClose={() => setAddActionModalOpen(false)}
        onAdd={handleAddAction}
      />
      <UserSelectionModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSelect={() => setAssignModalOpen(false)}
        title="Assign Quality Approver"
      />
      <ReasonForChangeModal
        open={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        onConfirm={(reason) => handleConfirmSave(reason)}
      />
      <ConfirmDialog
        open={saveDialogOpen}
        title="Save Plan Updates?"
        message="This will permanently modify the CAPA investigation and implementation strategy."
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={() => handleConfirmSave()}
      />
    </>
  );
}
