import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, TextField, Typography, Divider, MenuItem } from "@mui/material";

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

export default function DeviationsDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  // State
  const [meta, setMeta] = useState<WorkflowMeta | null>(null);
  const [auditRows, setAuditRows] = useState<AuditTrailEntry[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false); // ✅ Added Modal State

  // Permissions
  const canEdit = ROLE_PERMISSIONS[role]?.deviations?.includes("edit");

  // Load Data
  useEffect(() => {
    if (!id) return;
    const data = workflowService.getOrCreate(id, "deviations");
    setMeta(data);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setAuditRows(auditService.list("deviations", id));
  }, [id, meta?.status]);

  // ✅ 1. Transition Rule: Mandatory Fields
  const handleValidate = () => {
    if (!meta) return "Error: Record not loaded";
    
    // Example Rule: Cannot submit if Root Cause is empty (mock check)
    // In real app, check form state. Here we simulate validation.
    if (meta.status === 'Investigation' && !canEdit) { 
        // Mock: If we are in investigation and user can't edit, assume valid for demo
        return true; 
    }
    
    // Simple pass for demo
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
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString() 
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
      title="DEV-2024-042: Temperature Excursion"
      subtitle={`Record ID: ${id}`}
      backTo="/deviations"
      statusChip={<StatusChip status={meta.status} />}
      
      rightPanel={
        <Box sx={{ display: "grid", gap: 3 }}>
          <WorkflowTimeline 
            currentStatus={meta.status} 
            steps={WORKFLOWS.deviations.steps} 
          />

          {/* ✅ Connected Validation */}
          <WorkflowActionsPanel
            recordId={id}
            moduleKey="deviations"
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
                 <Typography variant="caption" color="text.secondary">Reported By</Typography>
                 <Typography variant="body2">Operator A. Smith</Typography>
               </Grid>
               <Grid size={{ xs: 6 }}>
                 <Typography variant="caption" color="text.secondary">Department</Typography>
                 <Typography variant="body2">Production / Line 4</Typography>
               </Grid>
            </Grid>
          </Box>
        </Box>
      }

      overview={
        <Box sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
            Event Details
          </Typography>

          <Grid container spacing={3}>
            {/* Classification */}
            <Grid size={{ xs: 12, md: 4 }}>
               <TextField
                select
                label="Classification"
                defaultValue="Major"
                fullWidth
                disabled={!canEdit}
               >
                 <MenuItem value="Minor">Minor</MenuItem>
                 <MenuItem value="Major">Major</MenuItem>
                 <MenuItem value="Critical">Critical</MenuItem>
               </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Date of Occurrence"
                type="date"
                defaultValue="2024-02-10"
                fullWidth
                disabled={!canEdit}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
             <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Date Discovered"
                type="date"
                defaultValue="2024-02-10"
                fullWidth
                disabled={!canEdit}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description of Event"
                defaultValue="Temperature sensor on Autoclave 3 recorded a drop below 121°C for 45 seconds during cycle 4459."
                fullWidth
                multiline
                rows={4}
                disabled={!canEdit}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Immediate Actions / Containment"
                defaultValue="Cycle aborted. Load quarantined immediately. Maintenance notified to inspect sensor calibration."
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
            title="Assign Reviewer / Approver"
          />
        </Box>
      }
    />
  );
}