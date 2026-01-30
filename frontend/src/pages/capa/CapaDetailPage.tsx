import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Divider,
  MenuItem,
  Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

// Architecture Imports
import { useRole } from "../../app/providers/RoleProvider";
import { ROLE_PERMISSIONS } from "../../config/permissions";
import { WORKFLOWS } from "../../config/workflows";
import { workflowService } from "../../services/workflow.service";
import { auditService } from "../../services/audit.service";

// Components
import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import WorkflowActionsPanel from "../../components/qms/WorkflowActionsPanel";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ActivityLog from "../../components/qms/ActivityLog";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import UserSelectionModal from "../../components/common/UserSelectionModal";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import SignatureLogTable from "../../components/qms/SignatureLogTable";
import SignatureStamp from "../../components/qms/SignatureStamp"; // ✅ Added
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal"; // ✅ Added
import CapaActionPanel from "../../components/capa/CapaActionPanel";
import ClosureChecklist from "../../components/qms/ClosureChecklist";

import type { AuditTrailEntry } from "../../types/audit.types";
import type { WorkflowMeta } from "../../types/workflow.types";

export default function CapaDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  // State
  const [meta, setMeta] = useState<WorkflowMeta | null>(null);
  const [auditRows, setAuditRows] = useState<AuditTrailEntry[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false); // ✅ Added

  // Permissions
  const canEdit = ROLE_PERMISSIONS[role]?.capa?.includes("edit");

  // Load Data
  useEffect(() => {
    if (!id) return;
    const data = workflowService.getOrCreate(id, "capa");
    setMeta(data);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setAuditRows(auditService.list("capa", id));
  }, [id, meta?.status]);

  // --- Handlers ---

  const handleValidate = () => {
    if (!meta) return "Error: Record not loaded";
    if (
      meta.status === "Root Cause Analysis" ||
      meta.status === "Investigation"
    ) {
      return true;
    }
    return true;
  };

  const handleAddReviewer = (user: {
    id: string;
    name: string;
    role: string;
  }) => {
    if (!id || !meta) return;
    const newRequest = {
      id: `req-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      stepName: meta.status,
      assignedDate: new Date().toISOString(),
      status: "Pending" as const,
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    };
    const updatedMeta = {
      ...meta,
      approvalRequests: [...(meta.approvalRequests || []), newRequest],
    };
    setMeta(updatedMeta);
  };

  // ✅ Save Logic
  const handleSaveClick = () => setReasonModalOpen(true);

  const handleConfirmChange = (reason: string) => {
    if (!id) return;
    setReasonModalOpen(false);
    auditService.add("capa", id, {
      actionType: "FIELD_EDIT",
      field: "CAPA Details",
      oldValue: "Old Content",
      newValue: "Updated Content",
      user: "Current User",
      role: role,
      reason: reason,
    });
    setAuditRows(auditService.list("capa", id));
  };

  if (!id || !meta) return null;

  return (
    <DetailTabsLayout
      title="CAPA-2024-009: Labeling Error Correction"
      subtitle={`Record ID: ${id}`}
      backTo="/capa"
      // ✅ Signature Stamp
      statusChip={
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <SignatureStamp
            isSigned={meta.status === "Effective" || meta.status === "Closed"}
            signedBy={
              meta.signatureLog.length > 0
                ? meta.signatureLog[meta.signatureLog.length - 1].signedBy
                : "Unknown"
            }
            date={
              meta.signatureLog.length > 0
                ? new Date(
                    meta.signatureLog[meta.signatureLog.length - 1].timestamp,
                  ).toLocaleDateString()
                : ""
            }
          />
          <StatusChip status={meta.status} />
        </Box>
      }
      rightPanel={
        <Box sx={{ display: "grid", gap: 3 }}>
          <WorkflowTimeline
            currentStatus={meta.status}
            steps={WORKFLOWS.capa.steps}
          />

          <WorkflowActionsPanel
            recordId={id}
            moduleKey="capa"
            meta={meta}
            onUpdated={setMeta}
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
                <Typography variant="body2">Deviation DEV-042</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Risk Level
                </Typography>
                <Typography variant="body2">High</Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      }
      overview={
        <Box sx={{ p: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Problem & Investigation
            </Typography>
            {/* ✅ Save Button */}
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
                defaultValue="Corrective"
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
                defaultValue="2024-03-01"
                fullWidth
                disabled={!canEdit}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Owner"
                defaultValue="QA Specialist"
                fullWidth
                disabled={!canEdit}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Problem Statement"
                defaultValue="Incorrect expiration date printed on Batch 4599 due to manual entry error."
                fullWidth
                multiline
                rows={3}
                disabled={!canEdit}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Root Cause Analysis (RCA)"
                defaultValue="Human error due to lack of double-check verification step in the SOP."
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
                defaultValue="1. Update SOP-005 to include dual verification. 2. Retrain packaging staff."
                fullWidth
                multiline
                rows={3}
                disabled={!canEdit}
              />
            </Grid>
          </Grid>

          {/* ✅ Reason Modal */}
          <ReasonForChangeModal
            open={reasonModalOpen}
            onClose={() => setReasonModalOpen(false)}
            onConfirm={handleConfirmChange}
          />
        </Box>
      }
      plan={
        <Box sx={{ p: 1 }}>
          <CapaActionPanel readOnly={!canEdit} />
          {meta?.status === "Verification" && (
            <Box sx={{ mt: 3 }}>
              <ClosureChecklist />
            </Box>
          )}
        </Box>
      }
      attachments={<AttachmentsUploader readOnly={!canEdit} />}
      activity={
        <Box sx={{ display: "grid", gap: 3 }}>
          <ActivityLog />
          <Divider />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Audit Trail (21 CFR Part 11)
          </Typography>
          <AuditTrailTable rows={auditRows} />
        </Box>
      }
      approvals={
        <Box sx={{ display: "grid", gap: 3 }}>
          <ApprovalsPanel
            requests={meta.approvalRequests || []}
            canAddReviewer={canEdit}
            onAddReviewer={() => setAssignModalOpen(true)}
          />
          <SignatureLogTable rows={meta.signatureLog || []} />

          <UserSelectionModal
            open={assignModalOpen}
            onClose={() => setAssignModalOpen(false)}
            onSelect={handleAddReviewer}
            title="Assign CAPA Approver"
          />
        </Box>
      }
    />
  );
}
