import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, TextField, Typography, Divider, MenuItem, Chip } from "@mui/material";

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
import UserSelectionModal from "../../components/common/UserSelectionModal"; // ✅ Added Modal
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import SignatureLogTable from "../../components/qms/SignatureLogTable";

// Types
import type { AuditTrailEntry } from "../../types/audit.types";
import type { WorkflowMeta } from "../../types/workflow.types";

export default function DmsDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  // State
  const [meta, setMeta] = useState<WorkflowMeta | null>(null);
  const [auditRows, setAuditRows] = useState<AuditTrailEntry[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false); // ✅ Modal State

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

  // ✅ 1. Transition Rule: Validation Logic
  // Passed to WorkflowActionsPanel to block actions if data is missing
  const handleValidate = () => {
     if (!meta) return "Error: Record not loaded";
     
     // Example Rule: Cannot submit to QA if title is missing
     // In a real app, you would check the form values here.
     // For this UI demo, we'll assume valid if the ID exists.
     if (!id) return "Error: Invalid Record ID";
     
     return true; // Proceed
  };

  // ✅ 2. Assign Reviewer Logic
  const handleAddReviewer = (user: { id: string; name: string; role: string }) => {
    if (!id || !meta) return;
    
    // Call service to add reviewer (Mock)
    // In a real app, this would be an API call
    const newRequest = {
        id: `req-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        role: user.role,
        stepName: meta.status, // Assign to current step
        assignedDate: new Date().toISOString(),
        status: 'Pending' as const,
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString() // +3 days default
    };

    // Update Local State (Optimistic UI)
    const updatedMeta = { 
        ...meta, 
        approvalRequests: [...(meta.approvalRequests || []), newRequest] 
    };
    setMeta(updatedMeta);

    // Persist to Mock Service
    // (Assuming workflowService has an update method, otherwise this just resets on reload)
    // workflowService.update(id, 'dms', updatedMeta);
  };

  if (!id || !meta) return null;

  return (
    <DetailTabsLayout
      title="SOP-2024-001: Hygiene Procedure"
      subtitle={`Record ID: ${id}`}
      backTo="/dms"
      statusChip={<StatusChip status={meta.status} />}
      
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
            onValidate={handleValidate} // ✅ Connected Validation
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
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
            Document Information
          </Typography>

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
                  status: "Obsolete",
                  effectiveDate: "2023-01-01",
                  updatedBy: "QA Manager",
                  updatedAt: "2023-01-02",
                },
              ]}
              onView={(v) => console.log("View version:", v)}
            />

            <PeriodicReviewCard />
          </Box>
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
          {/* ✅ Real Approvals Panel */}
          <ApprovalsPanel 
             requests={meta.approvalRequests || []} 
             canAddReviewer={canEdit}
             onAddReviewer={() => setAssignModalOpen(true)}
          />
          <SignatureLogTable rows={meta.signatureLog || []} />
          
          {/* ✅ User Selection Modal */}
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