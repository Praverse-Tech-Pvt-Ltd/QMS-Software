import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  Grid,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddTaskIcon from "@mui/icons-material/AddTask";
import { useSnackbar } from "notistack";

// --- SERVICES ---
import {
  deviationsService,
  type DeviationRecord,
} from "../../services/deviations.service";
import { capaService } from "../../services/capa.service";
import { auditService } from "../../services/audit.service";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// --- COMPONENTS ---
import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal";
import SignatureStamp from "../../components/qms/SignatureStamp";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import WorkflowActionsPanel from "../../components/qms/WorkflowActionsPanel";
import { WORKFLOWS } from "../../config/workflows";
import UserSelectionModal from "../../components/common/UserSelectionModal";
import LinkedCapasPanel from "../../components/deviations/LinkedCapasPanel";
import ActivityLog from "../../components/qms/ActivityLog";

export default function DeviationsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const { enqueueSnackbar } = useSnackbar();

  const [record, setRecord] = useState<DeviationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [isInitiatingCapa, setIsInitiatingCapa] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // ✅ Use String() to safely pass the param to the service
      const data = await deviationsService.getById(String(id));
      setRecord(data);
    } catch (err) {
      setError("Failed to load Deviation Record.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const canEdit =
    role && record
      ? permissionService.can(role, "deviations", "edit") &&
        record.status !== "CLOSED"
      : false;

  const handleFieldChange = (field: keyof DeviationRecord, value: any) => {
    if (record) setRecord({ ...record, [field]: value });
  };

  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async (reason?: string) => {
    if (!record) return;
    try {
      // ✅ Explicitly cast record.id to string for the service call
      await deviationsService.update(String(record.id), {
        ...record,
        change_reason: reason || "Investigation details updated",
      });
      setSaveDialogOpen(false);
      enqueueSnackbar("Investigation updated successfully", {
        variant: "success",
      });
      loadData();
    } catch (err) {
      enqueueSnackbar("Failed to save changes", { variant: "error" });
    }
  };

  const handleInitiateCapa = async () => {
    if (!record) return;
    setIsInitiatingCapa(true);
    try {
      const newCapa = await capaService.create({
        title: `CAPA for ${record.deviation_id}: ${record.title}`,
        deviation: record.id,
        department: record.department,
        description: `Initiated from Deviation ${record.deviation_id}. Root Cause: ${record.root_cause || "Pending Investigation"}`,
        action_type: "CORRECTIVE",
        status: "PLANNING",
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });

      // ✅ FIX: Cast record.id to String to avoid "number not assignable to string" error
      await auditService.add("deviations", String(record.id), {
        actionType: "LINKED_RECORD",
        field: "CAPA Link",
        oldValue: "None",
        newValue: newCapa.capa_id,
        user: "Current User",
        role: role || "QA",
        reason: "CAPA initiated from root cause analysis.",
      });

      enqueueSnackbar(`CAPA ${newCapa.capa_id} successfully linked.`, {
        variant: "success",
      });
      loadData();
    } catch (err) {
      enqueueSnackbar("Failed to initiate CAPA", { variant: "error" });
    } finally {
      setIsInitiatingCapa(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Syncing Quality Record...</Typography>
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
        title={`${record.deviation_id}: ${record.title}`}
        subtitle="Non-Conformance Investigation"
        backTo="/deviations"
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {record.status === "CLOSED" && (
              <SignatureStamp
                isSigned={true}
                signedBy="QA Manager"
                date={record.occurrence_date}
              />
            )}
            <StatusChip status={record.status} />
          </Box>
        }
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline
              currentStatus={record.status}
              steps={WORKFLOWS.deviations.steps}
            />
            <WorkflowActionsPanel
              recordId={record.id.toString()}
              moduleKey="deviations"
              onUpdated={loadData}
              meta={{ ...record, id: record.id.toString() } as any}
            />

            <Divider />

            <Box sx={{ p: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 2,
                  fontWeight: 800,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                }}
              >
                Investigation Timeline
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
                    OCCURRENCE DATE
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {new Date(record.occurrence_date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {record.status === "INVESTIGATION" && (
              <Button
                variant="outlined"
                fullWidth
                color="primary"
                startIcon={
                  isInitiatingCapa ? (
                    <CircularProgress size={20} />
                  ) : (
                    <AddTaskIcon />
                  )
                }
                disabled={isInitiatingCapa}
                onClick={handleInitiateCapa}
                sx={{
                  borderRadius: 2.5,
                  py: 1.5,
                  fontWeight: 700,
                  borderStyle: "dashed",
                }}
              >
                Launch CAPA Workflow
              </Button>
            )}
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
                Primary Investigation
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
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  label="Investigation Title"
                  value={record.title}
                  fullWidth
                  disabled={!canEdit}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Risk Classification"
                  value={record.risk_level}
                  fullWidth
                  disabled={!canEdit}
                  onChange={(e) =>
                    handleFieldChange("risk_level", e.target.value)
                  }
                >
                  <MenuItem value="MINOR">Minor</MenuItem>
                  <MenuItem value="MAJOR">Major</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description of Non-Conformance"
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
                  label="Root Cause Analysis (RCA)"
                  value={record.root_cause || ""}
                  placeholder="Document the 5-Whys..."
                  fullWidth
                  multiline
                  rows={3}
                  disabled={!canEdit}
                  onChange={(e) =>
                    handleFieldChange("root_cause", e.target.value)
                  }
                  helperText="A valid RCA is required for CAPA initiation."
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 5 }}>
              <LinkedCapasPanel
                capas={record.capas || []}
                readOnly={!canEdit}
              />
            </Box>
          </Box>
        }
        attachments={<AttachmentsUploader readOnly={!canEdit} />}
        approvals={
          <ApprovalsPanel
            requests={[]}
            canAddReviewer={canEdit}
            onAddReviewer={() => setAssignModalOpen(true)}
          />
        }
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ActivityLog />
            <Typography variant="h6" fontWeight={900}>
              Regulatory Audit Trail
            </Typography>
            <AuditTrailTable rows={record.audit_trail || []} />
          </Box>
        }
      />

      <UserSelectionModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSelect={() => setAssignModalOpen(false)}
        title="Assign Quality Reviewer"
      />
      <ReasonForChangeModal
        open={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        onConfirm={(r) => handleConfirmSave(r)}
      />
      <ConfirmDialog
        open={saveDialogOpen}
        title="Save Investigation?"
        message="Confirm changes to the RCA and investigation notes. This action is tracked in the audit trail."
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={() => handleConfirmSave()}
      />
    </>
  );
}
