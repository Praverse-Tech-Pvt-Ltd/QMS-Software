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
   Grid, // ✅ Standardized Grid2
  Stack,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";

import {
  trainingService,
  type TrainingPlan,
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

export default function TrainingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();

  const [record, setRecord] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ old: "", new: "" });
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // ✅ Handshake: Backend typically expects numeric ID for Detail lookup
      const lookupId = id.includes("-") ? id.split("-").pop() : id;
      const data = await trainingService.getById(lookupId!);
      setRecord(data);
    } catch (err) {
      setError("Failed to load Training Plan.");
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
        change_reason: reason || "Training configuration updated",
      });
      setSaveDialogOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to save training plan changes.");
    }
  };

  const handleCompare = (vOld: string, vNew: string) => {
    setCompareVersions({ old: vOld, new: vNew });
    setCompareModalOpen(true);
  };

  if (loading)
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Syncing Training Record...</Typography>
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
        subtitle={`System ID: ${record.id}`}
        backTo="/training"
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {(record.status === "ACTIVE" || record.status === "EFFECTIVE") && (
              <SignatureStamp
                isSigned={true}
                signedBy="Training Coordinator"
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
              steps={WORKFLOWS.training.steps}
            />

            <WorkflowActionsPanel
              recordId={record.id.toString()}
              moduleKey="training"
              onUpdated={loadData}
              meta={{ ...record, id: record.id.toString() } as any}
              onValidate={() => {
                if (!record.title)
                  return "A descriptive title is required for publishing.";
                if (!record.trainer)
                  return "Please assign a Trainer or Coordinator.";
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
                Plan Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    TOTAL TRAINEES
                  </Typography>
                  <Typography variant="body2" fontWeight={800}>
                    {(record as any).totalTrainees || 0}
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
                    {(record as any).completionRate || 0}%
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
                Training Configuration
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  size="small"
                  onClick={() => setPrintModalOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Print Syllabus
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
              </Stack>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Training Method"
                  value={record.method}
                  fullWidth
                  disabled={!canEdit}
                  onChange={(e) =>
                    setRecord({ ...record, method: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f8fafc",
                      borderRadius: 3,
                    },
                  }}
                >
                  <MenuItem value="Classroom">
                    Classroom / Instructor-Led
                  </MenuItem>
                  <MenuItem value="Online">Online / SCORM</MenuItem>
                  <MenuItem value="Read">Read & Understand (SOP)</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Duration (Minutes)"
                  type="number"
                  value={record.duration_minutes}
                  fullWidth
                  disabled={!canEdit}
                  onChange={(e) =>
                    setRecord({
                      ...record,
                      duration_minutes: Number(e.target.value),
                    })
                  }
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
                  label="Minimum Pass Score (%)"
                  type="number"
                  value={(record as any).passScore || 80}
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
                  onChange={(e) =>
                    setRecord({ ...record, description: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f8fafc",
                      borderRadius: 3,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Designated Trainer"
                  value={record.trainer}
                  fullWidth
                  disabled={!canEdit}
                  onChange={(e) =>
                    setRecord({ ...record, trainer: e.target.value })
                  }
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

            <Box sx={{ display: "grid", gap: 3 }}>
              <Typography variant="h6" fontWeight={900}>
                Version Governance
              </Typography>
              <VersionHistoryPanel
                currentVersion={(record as any).version || "v1.0"}
                rows={[]}
                onView={(v) => console.log("Viewing syllabus version:", v)}
                onCompare={handleCompare}
              />
            </Box>
          </Box>
        }
        attachments={
          <AttachmentsUploader
            readOnly={!canEdit}
            title="Training Courseware"
            acceptedFormats=".pdf,.ppt,.pptx"
          />
        }
        approvals={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ApprovalsPanel
              requests={[]}
              canAddReviewer={canEdit}
              onAddReviewer={() => setAssignModalOpen(true)}
            />
            <SignatureLogTable rows={record.signatureLog || []} />{" "}
          </Box>
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
        onSelect={(user) => {
          console.log(user);
          setAssignModalOpen(false);
        }}
        title="Assign Training Approver"
      />

      <ReasonForChangeModal
        open={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        onConfirm={handleConfirmSave}
      />

      <ConfirmDialog
        open={saveDialogOpen}
        title="Save Training Configuration?"
        message="All changes to the learning objectives or requirements will be tracked in the audit trail."
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
        docTitle={record.title}
        docId={record.id.toString()}
        version={(record as any).version || "v1.0"}
      />
    </>
  );
}
