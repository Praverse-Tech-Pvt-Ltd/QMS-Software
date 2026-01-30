import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box,  Grid, TextField, Typography, Divider, MenuItem, Button, Paper } from "@mui/material";
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
import SignatureStamp from "../../components/qms/SignatureStamp";      // ✅ Added
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal"; // ✅ Added

import type { AuditTrailEntry } from "../../types/audit.types";
import type { WorkflowMeta } from "../../types/workflow.types";

export default function ChangeControlDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  const [meta, setMeta] = useState<WorkflowMeta | null>(null);
  const [auditRows, setAuditRows] = useState<AuditTrailEntry[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false); // ✅ Added

  const canEdit = ROLE_PERMISSIONS[role]?.change?.includes("edit");

  useEffect(() => {
    if (!id) return;
    const data = workflowService.getOrCreate(id, "change");
    setMeta(data);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setAuditRows(auditService.list("change", id));
  }, [id, meta?.status]);

  const handleValidate = () => {
    if (!meta) return "Error: Record not loaded";
    return true; 
  };

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
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString()
    };
    const updatedMeta = { 
        ...meta, 
        approvalRequests: [...(meta.approvalRequests || []), newRequest] 
    };
    setMeta(updatedMeta);
  };

  // ✅ Save Logic
  const handleSaveClick = () => setReasonModalOpen(true);
  
  const handleConfirmChange = (reason: string) => {
    if (!id) return;
    setReasonModalOpen(false);
    auditService.add("change", id, {
        actionType: "FIELD_EDIT",
        field: "Change Request Details",
        oldValue: "-",
        newValue: "Updated",
        user: "Current User",
        role: role,
        reason: reason
    });
    setAuditRows(auditService.list("change", id));
  };

  if (!id || !meta) return null;

  return (
    <DetailTabsLayout
      title="CC-2024-089: New Blender Installation"
      subtitle={`Change Request ID: ${id}`}
      backTo="/change-control"
      
      // ✅ Signature Stamp
      statusChip={
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
           <SignatureStamp 
              isSigned={meta.status === 'Closed' || meta.status === 'Approved'} 
              signedBy={meta.signatureLog.length > 0 ? meta.signatureLog[meta.signatureLog.length - 1].signedBy : "Unknown"}
              date={meta.signatureLog.length > 0 ? new Date(meta.signatureLog[meta.signatureLog.length - 1].timestamp).toLocaleDateString() : ""} 
           />
           <StatusChip status={meta.status} />
        </Box>
      }
      
      rightPanel={
        <Box sx={{ display: "grid", gap: 3 }}>
          <WorkflowTimeline 
            currentStatus={meta.status} 
            steps={WORKFLOWS.change.steps} 
          />

          <WorkflowActionsPanel
            recordId={id}
            moduleKey="change"
            meta={meta}
            onUpdated={setMeta}
            onValidate={handleValidate} 
          />
          
          <Divider />
          
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Change Stats
            </Typography>
            <Grid container spacing={2}>
               <Grid size={{ xs: 6 }}>
                 <Typography variant="caption" color="text.secondary">Priority</Typography>
                 <Typography variant="body2">High</Typography>
               </Grid>
               <Grid size={{ xs: 6 }}>
                 <Typography variant="caption" color="text.secondary">Department</Typography>
                 <Typography variant="body2">Engineering</Typography>
               </Grid>
            </Grid>
          </Box>
        </Box>
      }

      overview={
        <Box sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Change Request Details
            </Typography>
            {/* ✅ Save Button */}
            {canEdit && (
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveClick} size="small">
                    Save Changes
                </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            {/* ... Fields ... */}
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Change Title"
                defaultValue="Installation of High-Speed Blender in Room 404"
                fullWidth
                disabled={!canEdit}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
               <TextField
                select
                label="Change Type"
                defaultValue="Major"
                fullWidth
                disabled={!canEdit}
               >
                 <MenuItem value="Minor">Minor</MenuItem>
                 <MenuItem value="Major">Major</MenuItem>
                 <MenuItem value="Critical">Critical</MenuItem>
               </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Reason for Change"
                defaultValue="Current blender capacity is insufficient for projected Q3 demand. New equipment increases throughput by 40%."
                fullWidth
                multiline
                rows={3}
                disabled={!canEdit}
              />
            </Grid>
            
            {/* ... More Fields ... */}
          </Grid>

          {/* ✅ Reason Modal */}
          <ReasonForChangeModal 
             open={reasonModalOpen}
             onClose={() => setReasonModalOpen(false)}
             onConfirm={handleConfirmChange}
          />
        </Box>
      }

      impact={
        <Box sx={{ p: 1 }}>
           <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
            Impact Assessment
           </Typography>
           
           <Paper variant="outlined" sx={{ p: 3, bgcolor: '#fafafa', mb: 3 }}>
             <Typography variant="subtitle2" gutterBottom>
               Does this change affect:
             </Typography>
             <Grid container spacing={2}>
               <Grid size={{ xs: 12, md: 4 }}>
                 <TextField select label="Regulatory Filing?" defaultValue="No" fullWidth disabled={!canEdit}>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                 </TextField>
               </Grid>
               {/* ... */}
             </Grid>
           </Paper>

           <TextField
              label="Detailed Impact Analysis"
              defaultValue="Validation required (IQ/OQ/PQ). EHS assessment for noise levels required."
              fullWidth
              multiline
              rows={4}
              disabled={!canEdit}
            />
        </Box>
      }

      plan={
        <Box sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
            Implementation Plan
          </Typography>
          <TextField
              label="Action Items"
              defaultValue={`1. Procure Equipment (Due: 2024-04-01)\n2. Perform IQ/OQ (Due: 2024-05-01)\n3. Update SOPs (Due: 2024-05-15)`}
              fullWidth
              multiline
              rows={6}
              disabled={!canEdit}
            />
        </Box>
      }

      attachments={<AttachmentsUploader readOnly={!canEdit} title="Drawings & Specs" />}

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
            title="Assign Change Control Approver"
          />
        </Box>
      }
    />
  );
}