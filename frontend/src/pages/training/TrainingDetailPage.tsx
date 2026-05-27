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
  Grid, // ✅ Standardized to Grid2 for consistency
  Stack,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import { useSnackbar } from "notistack"; // Added for feedback

import {
  trainingService,
  type TrainingPlan,
  type TrainingAssignment, // ✅ Import detail table type
} from "../../services/training.service";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import SignatureStamp from "../../components/qms/SignatureStamp";
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal";
import UserSelectionModal from "../../components/common/UserSelectionModal";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import WorkflowActionsPanel from "../../components/qms/WorkflowActionsPanel";
import { WORKFLOWS } from "../../config/workflows";

import VersionHistoryPanel from "../../components/dms/VersionHistoryPanel";
import VersionCompareModal from "../../components/dms/VersionCompareModal";
import ControlledCopyPrintModal from "../../components/dms/ControlledCopyPrintModal";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import SignatureLogTable from "../../components/qms/SignatureLogTable";
import ActivityLog from "../../components/qms/ActivityLog";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import TraineeProgressTable from "../../components/training/TraineeProgressTable";
import AssignTrainingDialog from "../../components/training/AssignTrainingDialog";

export default function TrainingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const { enqueueSnackbar } = useSnackbar();

  const [record, setRecord] = useState<TrainingPlan | null>(null);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]); // ✅ Detail table state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ old: "", new: "" });
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // const navigate = useNavigate();

  const loadData = async () => {
  if (!id) return;
  try {
    setLoading(true);
    setError(null);

    // 1. CLEAN THE ID: Remove "PLAN-", colons, and all non-numeric characters
    // This turns "PLAN-1" or ":1" into just "1"
    const numericId = id.replace(/[^\d]/g, "");

    if (!numericId) {
      throw new Error("Invalid ID format");
    }

    // 2. FETCH MASTER RECORD (The Training Plan)
    const planData = await trainingService.getById(numericId);
    setRecord(planData);

    // 3. FETCH DETAIL TABLE (The Assignments)
    // ✅ FIX: Use planData.id (which is a clean Number from the DB) 
    // instead of the 'id' variable from the URL.
    const assignmentData = await trainingService.getAssignmentsByPlan(planData.id);
    
    setAssignments(assignmentData);
  } catch (err: any) {
    console.error("Fetch error:", err);
    setError("Training record not found or server error.");
  } finally {
    setLoading(false);
  }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const canEdit =
    role && record
      ? permissionService.can(role, "training", "edit") &&
        record.status === "DRAFT"
      : false;

  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async (reason?: string) => {
    if (!record || !id) return;
    try {
      await trainingService.update(String(record.id), {
        ...record,
        change_reason: reason || "Metadata update",
      });
      setSaveDialogOpen(false);
      enqueueSnackbar("Plan updated successfully", { variant: "success" });
      loadData();
    } catch (err) {
      enqueueSnackbar("Failed to save changes", { variant: "error" });
    }
  };

  const handleSendReminder = async (assignmentId: string | number) => {
    enqueueSnackbar(`Reminder notification sent for record #${assignmentId}`, {
      variant: "info",
    });
  };

  const handleCompare = (vOld: string, vNew: string) => {
    setCompareVersions({ old: vOld, new: vNew });
    setCompareModalOpen(true);
  };

  if (loading)
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Syncing Training Records...</Typography>
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
        title={`${record.title}`}
        subtitle={`Owning Department: ${record.department}`}
        backTo="/training"
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {(record.status === "ACTIVE" || record.status === "EFFECTIVE") && (
              <SignatureStamp
                isSigned={true}
                signedBy="Training Coordinator"
                date={record.updated_at || new Date().toLocaleDateString()}
              />
            )}
            <StatusChip status={record.status} />
          </Box>
        }
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline
              currentStatus={record.status}
              steps={WORKFLOWS.training.steps}
            />

            <WorkflowActionsPanel
              recordId={id ?? ""}
              moduleKey="training"
              onUpdated={loadData}
              meta={{ ...record, id: id ?? "" } as any}
              onValidate={() => {
                if (!record.title) return "A descriptive title is required.";
                if (!record.trainer) return "Please assign a coordinator.";
                return true;
              }}
            />

            <Divider />

            <Box sx={{ p: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  mb: 2,
                }}
              >
                Real-time Compliance
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    ENROLLED
                  </Typography>
                  <Typography variant="body2" fontWeight={800}>
                    {record.totalTrainees || 0}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    COMPLETION
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={800}
                    color="primary.main"
                  >
                    {record.completionRate || 0}%
                  </Typography>
                </Grid>
              </Grid>
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
                Syllabus & Config
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  size="small"
                  onClick={() => setPrintModalOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Print Summary
                </Button>
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
                <Button
                  variant="contained"
                  onClick={() => setAssignModalOpen(true)}
                >
                  Assign Personnel
                </Button>

                <AssignTrainingDialog
                  open={assignModalOpen}
                  onClose={() => setAssignModalOpen(false)}
                  planId={record?.id}
                  planTitle={record?.title}
                  onSuccess={loadData}
                />
              </Stack>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Method"
                  value={record.method}
                  fullWidth
                  disabled={!canEdit}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f8fafc",
                      borderRadius: 3,
                    },
                  }}
                >
                  <MenuItem value="Classroom">Classroom / ILT</MenuItem>
                  <MenuItem value="Online">Online / SCORM</MenuItem>
                  <MenuItem value="Read">Read & Understand</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Duration (Min)"
                  type="number"
                  value={record.duration_minutes}
                  fullWidth
                  disabled={!canEdit}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f8fafc",
                      borderRadius: 3,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Pass Score (%)"
                  type="number"
                  value={record.passScore || 80}
                  fullWidth
                  disabled={!canEdit}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f8fafc",
                      borderRadius: 3,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Learning Objectives"
                  value={record.description}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={!canEdit}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f8fafc",
                      borderRadius: 3,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 5, borderStyle: "dashed" }} />
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
              Version Control
            </Typography>
            <VersionHistoryPanel
              currentVersion={record.version || "v1.0"}
              rows={[]}
              onView={(v) => console.log(v)}
              onCompare={handleCompare}
            />
          </Box>
        }
        trainees={
          <Box sx={{ p: 1 }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 3 }}>
              Personnel Tracking
            </Typography>
            <TraineeProgressTable
              rows={assignments}
              onRemind={handleSendReminder}
            />
          </Box>
        }
        attachments={
          <AttachmentsUploader readOnly={!canEdit} title="Course Materials" />
        }
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
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ActivityLog />
            <Typography variant="h6" fontWeight={900}>
              Audit Trail
            </Typography>
            <AuditTrailTable rows={record.audit_trail || []} />
          </Box>
        }
      />

      <UserSelectionModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSelect={() => setAssignModalOpen(false)}
        title="Assign Training Approver"
      />
      <ReasonForChangeModal
        open={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        onConfirm={handleConfirmSave}
      />
      <ConfirmDialog
        open={saveDialogOpen}
        title="Submit Updates?"
        message="Modify the training objectives and configuration? This action is recorded in the audit trail."
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={() => handleConfirmSave()}
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
        docTitle={record.title || ""}
        docId={record.id.toString()}
        version={record.version || "v1.0"}
      />
    </>
  );
}
