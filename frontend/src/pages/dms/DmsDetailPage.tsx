import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Divider,
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
import VersionHistoryPanel from "../../components/dms/VersionHistoryPanel";
import PeriodicReviewCard from "../../components/dms/PeriodicReviewCard";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ActivityLog from "../../components/qms/ActivityLog";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import UserSelectionModal from "../../components/common/UserSelectionModal";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import SignatureLogTable from "../../components/qms/SignatureLogTable";
import SignatureStamp from "../../components/qms/SignatureStamp";
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal"; 
import VersionCompareModal from "../../components/dms/VersionCompareModal";
import ControlledCopyPrintModal from "../../components/dms/ControlledCopyPrintModal";
import PrintIcon from "@mui/icons-material/Print";

// Types
import type { AuditTrailEntry } from "../../types/audit.types";
import type { WorkflowMeta } from "../../types/workflow.types";

export default function DmsDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  // State
  const [meta, setMeta] = useState<WorkflowMeta | null>(null);
  const [auditRows, setAuditRows] = useState<AuditTrailEntry[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false); 
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ old: "", new: "" });
  const [printModalOpen, setPrintModalOpen] = useState(false);
  // Permissions
  const canEdit = ROLE_PERMISSIONS[role]?.dms?.includes("edit");

  // Load Data
  useEffect(() => {
    if (!id) return;
    const data = workflowService.getOrCreate(id, "dms");
    setMeta(data);
  }, [id]);

  // Load Audit Trail
  useEffect(() => {
    if (!id) return;
    setAuditRows(auditService.list("dms", id));
  }, [id, meta?.status]);

  // --- Handlers ---

  const handleValidate = () => {
    if (!meta) return "Error: Record not loaded";
    if (!id) return "Error: Invalid Record ID";
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
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    };

    const updatedMeta = {
      ...meta,
      approvalRequests: [...(meta.approvalRequests || []), newRequest],
    };
    setMeta(updatedMeta);
  };
  const handleCompare = (vOld: string, vNew: string) => {
    setCompareVersions({ old: vOld, new: vNew });
    setCompareModalOpen(true);
  };

  // ✅ Triggered when user clicks "Save Changes"
  const handleSaveClick = () => {
    setReasonModalOpen(true);
  };

  // ✅ Triggered when user confirms the reason
  const handleConfirmChange = (reason: string) => {
    if (!id) return;
    setReasonModalOpen(false);

    // 1. Log to Audit Service (Mock)
    auditService.add("dms", id, {
      actionType: "FIELD_EDIT",
      field: "Document Form", // In a real app, track the specific field changed
      oldValue: "Previous Value",
      newValue: "Updated Value",
      user: "Current User", // Replace with actual user context
      role: role,
      reason: reason,
    });

    // 2. Refresh Audit Rows to show the new entry immediately
    setAuditRows(auditService.list("dms", id));
  };

  if (!id || !meta) return null;

  return (
    <DetailTabsLayout
      title="SOP-2024-001: Hygiene Procedure"
      subtitle={`Record ID: ${id}`}
      backTo="/dms"
      statusChip={
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <SignatureStamp
            isSigned={meta.status === "Effective" || meta.status === "Approved"}
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
            steps={WORKFLOWS.dms.steps}
          />

          <WorkflowActionsPanel
            recordId={id}
            moduleKey="dms"
            meta={meta}
            onUpdated={setMeta}
            onValidate={handleValidate}
          />

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              System Metadata
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body2">John Doe</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body2">2024-01-15</Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      }
      overview={
        <Box sx={{ p: 1 }}>
          {/* ✅ Header with Save Button */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Document Information
            </Typography>

            {/* Only show Save button if user has edit permission */}
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
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Document Title"
                defaultValue="Standard Hygiene Procedure for Zone A"
                fullWidth
                disabled={!canEdit}
                InputProps={{ readOnly: !canEdit }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Document Type"
                defaultValue="SOP"
                fullWidth
                disabled={!canEdit}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Scope / Description"
                defaultValue="This document details the cleaning and gowning procedures required for entry into Zone A manufacturing areas."
                fullWidth
                multiline
                rows={4}
                disabled={!canEdit}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Owner / Department"
                defaultValue="Quality Assurance"
                fullWidth
                disabled={!canEdit}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Next Review Date"
                defaultValue="2025-01-15"
                fullWidth
                disabled={!canEdit}
              />
            </Grid>
          </Grid>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            size="small"
            onClick={() => setPrintModalOpen(true)}
            sx={{ mr: 1 }}
          >
            Print Controlled Copy
          </Button>
          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: "grid", gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Lifecycle Management
            </Typography>

            <VersionHistoryPanel
              currentVersion="v1.1"
              rows={[
                {
                  version: "v1.1",
                  status: "Effective",
                  effectiveDate: "2024-01-10",
                  updatedBy: "QA Lead",
                  updatedAt: "2024-01-11",
                },
                {
                  version: "v1.0",
                  status: "Superseded",
                  effectiveDate: "2023-01-01",
                  updatedBy: "QA Manager",
                  updatedAt: "2023-01-02",
                },
              ]}
              onView={(v) => console.log("View:", v)}
              onCompare={handleCompare} 
            />

            <PeriodicReviewCard />
          </Box>

          {/* ✅ Render the Reason Modal */}
          <ReasonForChangeModal
            open={reasonModalOpen}
            onClose={() => setReasonModalOpen(false)}
            onConfirm={handleConfirmChange}
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
            docTitle="Standard Hygiene Procedure"
            docId={id || ""}
            version="v1.1"
          />
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
            title="Assign Reviewer / Approver"
          />
        </Box>
      }
    />
  );
}
