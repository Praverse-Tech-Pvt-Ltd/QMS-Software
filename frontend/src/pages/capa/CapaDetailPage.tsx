import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box,  Grid, TextField, Typography, Divider, MenuItem } from "@mui/material";

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
import UserSelectionModal from "../../components/common/UserSelectionModal"; // ✅ Added
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import SignatureLogTable from "../../components/qms/SignatureLogTable";

import type { AuditTrailEntry } from "../../types/audit.types";
import type { WorkflowMeta } from "../../types/workflow.types";

export default function CapaDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  // State
  const [meta, setMeta] = useState<WorkflowMeta | null>(null);
  const [auditRows, setAuditRows] = useState<AuditTrailEntry[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false); // ✅ Modal State

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

  // ✅ 1. Transition Rule: Validation
  const handleValidate = () => {
    if (!meta) return "Error: Record not loaded";
    
    // Rule: Cannot move past 'Root Cause Analysis' without a root cause entered
    if (meta.status === 'Root Cause Analysis' || meta.status === 'Investigation') {
       // Mock check for empty field (In real app, check React Hook Form state)
       // For demo, we just allow it, but this is where you'd return "Root Cause is mandatory."
       return true; 
    }
    
    return true; 
  };

  // ✅ 2. Assign Reviewer Logic
  const handleAddReviewer = (user: { id: string; name: string; role: string }) => {
    if (!id || !meta) return;
    
    const newRequest = {
        id: `req-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        role: user.role,
        stepName: meta.status,
        assignedDate: new Date().toISOString(),
        status: 'Pending' as const,
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString() // +5 days for CAPA
    };

    const updatedMeta = { 
        ...meta, 
        approvalRequests: [...(meta.approvalRequests || []), newRequest] 
    };
    setMeta(updatedMeta);
  };

  if (!id || !meta) return null;

  return (
    <DetailTabsLayout
      title="CAPA-2024-009: Labeling Error Correction"
      subtitle={`Record ID: ${id}`}
      backTo="/capa"
      statusChip={<StatusChip status={meta.status} />}
      
      rightPanel={
        <Box sx={{ display: "grid", gap: 3 }}>
          <WorkflowTimeline 
            currentStatus={meta.status} 
            steps={WORKFLOWS.capa.steps} 
          />

          {/* ✅ Connected Validation */}
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
                 <Typography variant="caption" color="text.secondary">Source</Typography>
                 <Typography variant="body2">Deviation DEV-042</Typography>
               </Grid>
               <Grid size={{ xs: 6 }}>
                 <Typography variant="caption" color="text.secondary">Risk Level</Typography>
                 <Typography variant="body2">High</Typography>
               </Grid>
            </Grid>
          </Box>
        </Box>
      }

      overview={
        <Box sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
            Problem & Investigation
          </Typography>

          <Grid container spacing={3}>
            {/* Classification */}
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

            {/* Description */}
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
          {/* ✅ Connected Approvals Panel */}
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
            title="Assign CAPA Approver"
          />
        </Box>
      }
    />
  );
}