import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  Box,
  Grid, // ✅ Grid v2
  TextField,
  Typography,
  Divider,
  MenuItem,
  Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

// --- ENGINEERING STANDARDS IMPORTS ---
import { useFetch } from "../../hooks/useFetch";
import { changeService } from "../../services/change.service"; // ✅ Service
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
import ConfirmDialog from "../../components/common/ConfirmDialog";import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";
// --- COMPONENT IMPORTS ---
import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import SignatureStamp from "../../components/qms/SignatureStamp";
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal";
import UserSelectionModal from "../../components/common/UserSelectionModal";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline"; 
import { WORKFLOWS } from "../../config/workflows"; 

// Module Specific Components
import ImpactAssessmentPanel from "../../components/change/ImpactAssessmentPanel"; 
import ClosureChecklist from "../../components/qms/ClosureChecklist";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import SignatureLogTable from "../../components/qms/SignatureLogTable";
import WorkflowActionsPanel from "../../components/qms/WorkflowActionsPanel";

export default function ChangeControlDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  // 1. DATA FETCHING
  const { 
    data: record, 
    isLoading, 
    error, 
    refetch 
  } = useFetch(() => changeService.getById(id || ""), [id]);

  // 2. LOCAL STATE
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // 3. PERMISSIONS - Check both role and record status
  const canEdit = permissionService.can(role, 'change', 'edit') && 
                  record?.status !== 'Closed' && record?.status !== 'Cancelled';
  const canDelete = permissionService.can(role, 'change', 'delete');

  // 4. HANDLERS
  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async () => {
    await changeService.update(id!, { ...record });
    setSaveDialogOpen(false);
    refetch();
  };

  const handleAddReviewer = (user: any) => {
    console.log("Assigning Reviewer:", user);
    setAssignModalOpen(false);
    // In real app: changeService.addReviewer(id, user)
  };

  const handleValidate = () => {
     // Add validation logic here (e.g., check required fields)
     return true;
  };

  // 5. LOADING / ERROR STATES
  if (isLoading) return <LoadingState message="Loading Change Request..." />;
  if (error || !record) return <ErrorState onRetry={refetch} />;

  // 6. RENDER
  return (
    <>
      <DetailTabsLayout
        title={`${record.id}: ${record.title}`}
        subtitle={`Change Request ID: ${id}`}
        backTo="/change-control"
        
        // Header Status Chip & Signature
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {(record.status === "Closed" || record.status === "Approved") && (
                <SignatureStamp
                  isSigned={true}
                  signedBy="QA Manager"
                  date={new Date().toLocaleDateString()}
                />
            )}
            <StatusChip status={record.status} />
          </Box>
        }

        // RIGHT PANEL: Workflow Timeline & Actions
        rightPanel={
            <Box sx={{ display: "grid", gap: 3 }}>
                <WorkflowTimeline
                    currentStatus={record.status}
                    steps={WORKFLOWS.change.steps}
                />
                
                <WorkflowActionsPanel
                    recordId={id || ""}
                    moduleKey="change"
                    meta={record} 
                    onUpdated={refetch}
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
                            <Typography variant="body2">{record.priority}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">Department</Typography>
                            <Typography variant="body2">{record.department}</Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        }

        // TAB 1: OVERVIEW (Change Request Form)
        overview={
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Change Request Details
              </Typography>
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
                  label="Change Title"
                  defaultValue={record.title}
                  fullWidth
                  disabled={!canEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Change Type"
                  defaultValue={record.type}
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
                  label="Description / Reason for Change"
                  defaultValue={record.description}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={!canEdit}
                />
              </Grid>
              
               <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Owner"
                  defaultValue={record.owner}
                  fullWidth
                  disabled={!canEdit}
                />
              </Grid>
               <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Target Implementation Date"
                  type="date"
                  defaultValue={record.targetDate}
                  fullWidth
                  disabled={!canEdit}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        }

        // TAB 2: IMPACT ASSESSMENT
        impact={
          <Box sx={{ p: 1 }}>
            <ImpactAssessmentPanel readOnly={!canEdit} />
            
            {record.status === "Closure" && (
              <Box sx={{ mt: 3 }}>
                <ClosureChecklist />
              </Box>
            )}
          </Box>
        }

        // TAB 3: IMPLEMENTATION PLAN (Redirect to Impact)
        plan={
          <Box sx={{ p: 5, textAlign: "center", color: "text.secondary" }}>
            <Typography gutterBottom>
              The Implementation Plan is now managed within the <b>Impact Assessment</b> tab.
            </Typography>
            <Button variant="outlined" disabled>
              See Impact Tab
            </Button>
          </Box>
        }

        // TAB 4: ATTACHMENTS
        attachments={
          <AttachmentsUploader readOnly={!canEdit} title="Drawings & Specs" />
        }

        // TAB 5: APPROVALS
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

        // TAB 6: AUDIT TRAIL
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Audit Log
            </Typography>
            <AuditTrailTable rows={[]} /> 
          </Box>
        }
      />

      {/* --- MODALS --- */}
      <UserSelectionModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSelect={handleAddReviewer}
        title="Assign Change Control Approver"
      />

      <ReasonForChangeModal
        open={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        onConfirm={(reason) => {
             setReasonModalOpen(false);
             handleConfirmSave();
        }}
      />

      <ConfirmDialog 
        open={saveDialogOpen}
        title="Save Change Request?"
        message="This will update the change details. Ensure impact assessment is reviewed if scope has changed."
        confirmText="Save"
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={() => {
             // You can force a reason check here if required:
             // setReasonModalOpen(true);
             // OR just save:
             handleConfirmSave();
        }}
      />
    </>
  );
}