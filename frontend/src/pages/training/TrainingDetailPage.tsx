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

export default function TrainingDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  // State
  const [meta, setMeta] = useState<WorkflowMeta | null>(null);
  const [auditRows, setAuditRows] = useState<AuditTrailEntry[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false); // ✅ Modal State

  // Permissions
  const canEdit = ROLE_PERMISSIONS[role]?.training?.includes("edit");

  // Load Data
  useEffect(() => {
    if (!id) return;
    const data = workflowService.getOrCreate(id, "training");
    setMeta(data);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setAuditRows(auditService.list("training", id));
  }, [id, meta?.status]);

  // ✅ 1. Transition Rule: Validation
  const handleValidate = () => {
    if (!meta) return "Error: Record not loaded";
    
    // Example: Can't publish training if no materials are attached
    // (Mock Logic)
    if (meta.status === 'Draft' && !canEdit) {
       return "Please upload training materials first.";
    }
    
    return true; 
  };

  // ✅ 2. Assign Approver / Trainer Logic
  const handleAddReviewer = (user: { id: string; name: string; role: string }) => {
    if (!id || !meta) return;
    
    const newRequest = {
        id: `req-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        role: user.role,
        stepName: "Plan Approval",
        assignedDate: new Date().toISOString(),
        status: 'Pending' as const,
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString() 
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
      title="TRN-2024-005: Annual GMP Refresher"
      subtitle={`Plan ID: ${id}`}
      backTo="/training"
      statusChip={<StatusChip status={meta.status} />}
      
      rightPanel={
        <Box sx={{ display: "grid", gap: 3 }}>
          <WorkflowTimeline 
            currentStatus={meta.status} 
            steps={WORKFLOWS.training.steps} 
          />

          {/* ✅ Connected Validation */}
          <WorkflowActionsPanel
            recordId={id}
            moduleKey="training"
            meta={meta}
            onUpdated={setMeta}
            onValidate={handleValidate} 
          />
          
          <Divider />
          
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Plan Stats
            </Typography>
            <Grid container spacing={2}>
               <Grid size={{ xs: 6 }}>
                 <Typography variant="caption" color="text.secondary">Total Trainees</Typography>
                 <Typography variant="body2">25</Typography>
               </Grid>
               <Grid size={{ xs: 6 }}>
                 <Typography variant="caption" color="text.secondary">Completion</Typography>
                 <Typography variant="body2">85%</Typography>
               </Grid>
            </Grid>
          </Box>
        </Box>
      }

      overview={
        <Box sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
            Training Configuration
          </Typography>

          <Grid container spacing={3}>
            {/* Classification */}
            <Grid size={{ xs: 12, md: 4 }}>
               <TextField
                select
                label="Training Method"
                defaultValue="Classroom"
                fullWidth
                disabled={!canEdit}
               >
                 <MenuItem value="Classroom">Classroom</MenuItem>
                 <MenuItem value="Online">Online / SCORM</MenuItem>
                 <MenuItem value="Read">Read & Understand</MenuItem>
               </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Duration (Minutes)"
                type="number"
                defaultValue="60"
                fullWidth
                disabled={!canEdit}
              />
            </Grid>
             <Grid size={{ xs: 12, md: 4 }}>
               <TextField
                label="Pass Score (%)"
                type="number"
                defaultValue="80"
                fullWidth
                disabled={!canEdit}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Learning Objectives"
                defaultValue="To refresh knowledge on Good Manufacturing Practices, hygiene, and documentation standards."
                fullWidth
                multiline
                rows={4}
                disabled={!canEdit}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
               <TextField
                label="Trainer / Coordinator"
                defaultValue="John Doe (Training Lead)"
                fullWidth
                disabled={!canEdit}
              />
            </Grid>
          </Grid>
        </Box>
      }

      attachments={
        <AttachmentsUploader 
          readOnly={!canEdit} 
          title="Training Materials (Slides, Quizzes)" 
          acceptedFormats=".pdf,.ppt,.pptx"
        />
      }

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
            title="Assign Approver"
          />
        </Box>
      }
    />
  );
}