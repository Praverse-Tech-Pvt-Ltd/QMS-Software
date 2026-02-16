import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, Button, Typography, Divider, TextField, MenuItem, CircularProgress, Alert, Grid } from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";

// --- IMPORTS ---
import { deviationsService, type DeviationRecord } from "../../services/deviations.service";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// --- COMPONENT IMPORTS ---
import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal";
import SignatureStamp from "../../components/qms/SignatureStamp";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import WorkflowActionsPanel from "../../components/qms/WorkflowActionsPanel";
import { WORKFLOWS } from "../../config/workflows";
import UserSelectionModal from "../../components/common/UserSelectionModal";
import LinkedCapasPanel from "../../components/deviations/LinkedCapasPanel";

// ✅ HELPER: Map Backend Status to UI Workflow Status
const mapStatusToWorkflow = (backendStatus: string): any => {
  switch (backendStatus) {
    case "DRAFT": return "Draft";
    case "INVESTIGATION": return "Investigation";
    case "QA_REVIEW": return "Review"; // Matches 'Review' step in WORKFLOWS config
    case "CLOSED": return "Closed";
    default: return "Draft";
  }
};

export default function DeviationsDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  // 1. DATA FETCHING
  const [record, setRecord] = useState<DeviationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. LOCAL STATE
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // 3. LOAD DATA
  const loadData = async () => {
      const safeId = id || ""; 
      if (!safeId) return;

      try {
          setLoading(true);
          const data = await deviationsService.getById(safeId);
          setRecord(data);
      } catch (err) {
          console.error(err);
          setError("Failed to load Deviation Record.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      loadData();
  }, [id]);

  // 4. PERMISSIONS
  const canEdit = role && record 
    ? permissionService.can(role, 'deviations', 'edit') && record.status !== "CLOSED"
    : false;

  // 5. HANDLERS
  const handleSaveClick = () => {
    setSaveDialogOpen(true);
  };

  const handleConfirmSave = async (reason?: string) => {
    const safeId = id || "";
    if (!record || !safeId) return;

    try {
        console.log("Saving with reason:", reason);
        await deviationsService.update(safeId, { ...record });
        setSaveDialogOpen(false);
        loadData();
    } catch (err) {
        alert("Failed to save changes.");
    }
  };

  const handleAddReviewer = (user: any) => {
    console.log("Assigning Reviewer:", user);
    setAssignModalOpen(false);
  };

  const handleValidate = () => {
     return true;
  };

  if (loading) return <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /> <Typography>Loading Deviation Record...</Typography></Box>;
  if (error || !record) return <Box sx={{ p: 5 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <>
      <DetailTabsLayout
        // Access deviation_id if available, else id
        title={`${(record as any).deviation_id || record.id}: ${record.title}`}
        subtitle="Deviation Record"
        backTo="/deviations"
        
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {record.status === "CLOSED" && (
              <SignatureStamp
                isSigned={true}
                signedBy="Quality Assurance"
                date={new Date().toLocaleDateString()}
              />
            )}
            <StatusChip status={mapStatusToWorkflow(record.status)} />
          </Box>
        }

        // ✅ RIGHT PANEL: Timeline + Workflow Actions
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline 
                currentStatus={mapStatusToWorkflow(record.status)} 
                steps={WORKFLOWS.deviations.steps} 
            />

            <WorkflowActionsPanel
                recordId={id || ""}
                moduleKey="deviations"
                meta={{
                    ...record,
                    id: record.id.toString(), // Fix Type Mismatch
                    moduleKey: "deviations",
                    status: mapStatusToWorkflow(record.status), 
                    approvalRequests: [],
                    approvalsLog: [],
                    signatureLog: []
                }}
                onUpdated={loadData}
                onValidate={handleValidate}
            />

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Metadata
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Reported By
                  </Typography>
                  <Typography variant="body2">{(record as any).reported_by || "User"}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body2">{record.department}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        }

        // TAB 1: OVERVIEW 
        overview={
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Event Investigation
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
                        label="Deviation Title" 
                        defaultValue={record.title} 
                        fullWidth 
                        disabled={!canEdit} 
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField 
                        select 
                        label="Severity" 
                        defaultValue={(record as any).severity || "Minor"} 
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
                        label="Event Description" 
                        defaultValue={record.description} 
                        fullWidth 
                        multiline 
                        rows={4} 
                        disabled={!canEdit} 
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <TextField 
                        label="Immediate Actions Taken" 
                        defaultValue={(record as any).immediate_actions || ""} 
                        fullWidth 
                        multiline 
                        rows={2} 
                        disabled={!canEdit} 
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <TextField 
                        label="Root Cause Analysis" 
                        defaultValue={(record as any).root_cause || ""} 
                        fullWidth 
                        multiline 
                        rows={3} 
                        disabled={!canEdit} 
                        helperText="Required before submitting for review"
                    />
                </Grid>
            </Grid>

            {/* Linked CAPAs Component */}
            <LinkedCapasPanel readOnly={!canEdit} />
          </Box>
        }

        // TAB 2: ATTACHMENTS
        attachments={<AttachmentsUploader readOnly={!canEdit} />}

        // TAB 3: APPROVALS
        approvals={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ApprovalsPanel 
                requests={[]} 
                canAddReviewer={canEdit} 
                onAddReviewer={() => setAssignModalOpen(true)}
            />
          </Box>
        }

        // TAB 4: AUDIT TRAIL
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            {/* ✅ FIXED: Separate Title from AuditTrailTable */}
            <Typography variant="h6" fontWeight={800}>
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
        title="Assign Reviewer"
      />

      <ReasonForChangeModal
        open={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        onConfirm={(reason) => {
          setReasonModalOpen(false);
          handleConfirmSave(reason);
        }}
      />

      <ConfirmDialog
        open={saveDialogOpen}
        title="Save Changes?"
        message="This will update the Deviation record. Are you sure you want to proceed?"
        confirmText="Save"
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={() => {
          handleConfirmSave();
        }}
      />
    </>
  );
}