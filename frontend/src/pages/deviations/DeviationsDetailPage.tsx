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
import AddTaskIcon from "@mui/icons-material/AddTask"; // ✅ Added icon for CAPA initiation
import { useSnackbar } from "notistack";

import {
  deviationsService,
  type DeviationRecord,
} from "../../services/deviations.service";
import { capaService } from "../../services/capa.service"; // ✅ Added CAPA service
import { auditService } from "../../services/audit.service"; // ✅ Added Audit service
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

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

const mapStatusToWorkflow = (backendStatus: string): any => {
  switch (backendStatus) {
    case "DRAFT":
      return "Draft";
    case "INVESTIGATION":
      return "Investigation";
    case "QA_REVIEW":
    case "UNDER_REVIEW":
      return "Review";
    case "CLOSED":
    case "APPROVED":
      return "Closed";
    default:
      return "Draft";
  }
};

export default function DeviationsDetailPage() {
  const { id } = useParams();
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
      const data = await deviationsService.getById(id);
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
    if (!record || !id) return;
    try {
      await deviationsService.update(id, {
        ...record,
        change_reason: reason || "Manual investigation update",
      });
      setSaveDialogOpen(false);
      enqueueSnackbar("Changes saved successfully", { variant: "success" });
      loadData();
    } catch (err) {
      enqueueSnackbar("Failed to save changes", { variant: "error" });
    }
  };

  // ✅ NEW FUNCTION: Initiate CAPA from Deviation
  const handleInitiateCapa = async () => {
    if (!record || !id) return;
    setIsInitiatingCapa(true);
    try {
      const newCapa = await capaService.create({
        title: `CAPA for ${record.deviation_id}: ${record.title}`,
        deviation: record.id,
        department: record.department,
        description: `Automated initiation from Deviation ${record.deviation_id}. Root Cause: ${record.root_cause || "TBD"}`,
        action_type: "CORRECTIVE",
        status: "PLANNING",
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // Default 30 days
      });

      await auditService.add("deviations", id, {
        actionType: "LINKED_RECORD",
        field: "CAPA Link",
        oldValue: "None",
        newValue: newCapa.capa_id,
        user: "Current User",
        role: role || "QA",
        reason:
          "Corrective action required based on deviation root cause analysis.",
      });

      enqueueSnackbar(`CAPA ${newCapa.capa_id} created and linked.`, {
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
        <Typography sx={{ mt: 2 }}>Loading Deviation {id}...</Typography>
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
        title={`${record.deviation_id || record.id}: ${record.title}`}
        subtitle="Deviation Record"
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
            <StatusChip status={mapStatusToWorkflow(record.status)} />
          </Box>
        }
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline
              currentStatus={mapStatusToWorkflow(record.status)}
              steps={WORKFLOWS.deviations.steps}
            />
            <WorkflowActionsPanel
              recordId={id || ""}
              moduleKey="deviations"
              onUpdated={loadData}
              meta={
                {
                  ...record,
                  id: record.id.toString(),
                  status: mapStatusToWorkflow(record.status),
                } as any
              }
            />

            <Divider />

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={800}
                sx={{
                  mb: 2,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                }}
              >
                Quick Metadata
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Originating Department
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {record.department}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Discovery Date
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(record.occurrence_date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* ✅ Action: Initiate CAPA Button */}
            {record.status === "INVESTIGATION" && (
              <Button
                variant="outlined"
                fullWidth
                startIcon={
                  isInitiatingCapa ? (
                    <CircularProgress size={20} />
                  ) : (
                    <AddTaskIcon />
                  )
                }
                disabled={isInitiatingCapa}
                onClick={handleInitiateCapa}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                Initiate Related CAPA
              </Button>
            )}
          </Box>
        }
        overview={
          <Box sx={{ p: 1 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Investigation Details
              </Typography>
              {canEdit && (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveClick}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  Save Changes
                </Button>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  label="Title"
                  value={record.title}
                  fullWidth
                  disabled={!canEdit}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Risk Level"
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
                  label="Immediate Containment Actions"
                  value={record.immediate_actions || ""}
                  fullWidth
                  multiline
                  rows={2}
                  disabled={!canEdit}
                  onChange={(e) =>
                    handleFieldChange("immediate_actions", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Root Cause Analysis"
                  value={record.root_cause || ""}
                  placeholder="Perform 5 Whys or Fishbone Analysis..."
                  fullWidth
                  multiline
                  rows={3}
                  disabled={!canEdit}
                  onChange={(e) =>
                    handleFieldChange("root_cause", e.target.value)
                  }
                  helperText="Root cause must be identified before moving to QA Review."
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <LinkedCapasPanel
                capas={record.capas || []}
                readOnly={!canEdit}
              />
            </Box>
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
          </Box>
        }
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            <Typography variant="h6" fontWeight={800}>
              Quality Audit Trail
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
        onConfirm={(r) => {
          setReasonModalOpen(false);
          handleConfirmSave(r);
        }}
      />
      <ConfirmDialog
        open={saveDialogOpen}
        title="Submit Changes?"
        message="Are you sure you want to update the investigation details? This will be logged in the audit trail."
        confirmText="Update"
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={() => handleConfirmSave()}
      />
    </>
  );
}
