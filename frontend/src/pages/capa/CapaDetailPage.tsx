import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, TextField, Typography, Divider, MenuItem, Button,
  CircularProgress, Alert, Grid, Stack
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

// --- SERVICES ---
import { capaService, type CapaRecord } from "../../services/capa.service";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// --- COMPONENTS ---
import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import SignatureStamp from "../../components/qms/SignatureStamp";
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal";
import UserSelectionModal from "../../components/common/UserSelectionModal";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import WorkflowActionsPanel from "../../components/qms/WorkflowActionsPanel";
import { WORKFLOWS } from "../../config/workflows";

import CapaActionPanel from "../../components/capa/CapaActionPanel";
import AddCapaActionModal from "../../components/capa/AddCapaActionModal";
import ClosureChecklist from "../../components/qms/ClosureChecklist";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import SignatureLogTable from "../../components/qms/SignatureLogTable";
import ActivityLog from "../../components/qms/ActivityLog";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const mapStatusToWorkflow = (backendStatus: string): any => {
  switch (backendStatus) {
    case "PLANNING": return "Planning";
    case "PENDING": return "Pending";
    case "VERIFICATION": return "Verification";
    case "CLOSED": return "Closed";
    default: return "Planning";
  }
};

export default function CapaDetailPage() {
  const { id } = useParams(); // This is the business 'capa_id' from the URL
  const { role } = useRole();
  const { enqueueSnackbar } = useSnackbar();

  const [record, setRecord] = useState<CapaRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [addActionModalOpen, setAddActionModalOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Backend handles lookup by the string 'capa_id'
      const data = await capaService.getById(id);
      setRecord(data);
    } catch (err) {
      setError("Failed to load CAPA record.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const canEdit = role && record 
    ? permissionService.can(role, 'capa', 'edit') && record.status !== "CLOSED"
    : false;

  const handleFieldChange = (field: keyof CapaRecord, value: any) => {
    if (record) setRecord({ ...record, [field]: value });
  };

  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async (reason?: string) => {
    if (!record || !id) return;
    try {
      // Use numeric DB 'id' for the PATCH request
      await capaService.update(record.id, {
        ...record,
        change_reason: reason || "Metadata update",
      });
      setSaveDialogOpen(false);
      enqueueSnackbar("CAPA updated successfully", { variant: "success" });
      loadData();
    } catch (err) {
      enqueueSnackbar("Save failed", { variant: "error" });
    }
  };

  const handleAddAction = async (actionData: any) => {
    if (!record) return;
    try {
      await capaService.addAction(record.id, actionData);
      setAddActionModalOpen(false);
      enqueueSnackbar("Action item added", { variant: "success" });
      loadData();
    } catch (err) {
      enqueueSnackbar("Failed to add action", { variant: "error" });
    }
  };

  if (loading) return <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading CAPA {id}...</Typography></Box>;
  if (error || !record) return <Box sx={{ p: 5 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <>
      <DetailTabsLayout
        title={`${record.capa_id}: ${record.title}`}
        subtitle={`Origin: ${record.deviation ? 'Linked Deviation' : 'Internal Quality Audit'}`}
        backTo="/capa"
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {record.status === "CLOSED" && (
              <SignatureStamp isSigned={true} signedBy="Quality Assurance" date={new Date().toLocaleDateString()} />
            )}
            <StatusChip status={record.status} />
          </Box>
        }
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline currentStatus={mapStatusToWorkflow(record.status)} steps={WORKFLOWS.capa.steps} />
            <WorkflowActionsPanel
              recordId={record.id.toString()}
              moduleKey="capa"
              meta={{
                ...record,
                id: record.id.toString(),
                status: mapStatusToWorkflow(record.status),
                approvalRequests: [],
                approvalsLog: [],
                signatureLog: [],
              } as any}
              onUpdated={loadData}
              onValidate={() => {
                if (!record.root_cause) return "Root cause is required before proceeding.";
                return true;
              }}
            />
            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Key Metadata
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Site Department</Typography>
                  <Typography variant="body2" fontWeight={600}>{record.department}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Source Document</Typography>
                  <Typography variant="body2" fontWeight={600}>{record.source || 'Direct Initiation'}</Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        }
        overview={
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Investigation & RCA</Typography>
              {canEdit && (
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveClick} size="small" sx={{ borderRadius: 2 }}>
                  Save Investigation
                </Button>
              )}
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField select label="Action Category" value={record.action_type} fullWidth disabled={!canEdit}
                  onChange={(e) => handleFieldChange("action_type", e.target.value)}>
                  <MenuItem value="CORRECTIVE">Corrective Action (CAP)</MenuItem>
                  <MenuItem value="PREVENTIVE">Preventive Action (PAP)</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Target Closure Date" type="date" value={record.due_date} fullWidth disabled={!canEdit}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(e) => handleFieldChange("due_date", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Assigned Owner" value={record.owner || "Unassigned"} fullWidth disabled={!canEdit} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Problem Description" value={record.description} fullWidth multiline rows={3} disabled={!canEdit}
                  onChange={(e) => handleFieldChange("description", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Root Cause (Verified)" value={record.root_cause || ""} fullWidth multiline rows={3} disabled={!canEdit}
                  placeholder="Explain why the non-conformance occurred..."
                  onChange={(e) => handleFieldChange("root_cause", e.target.value)} />
              </Grid>
            </Grid>
          </Box>
        }
        plan={
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Implementation Plan</Typography>
                {canEdit && (
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setAddActionModalOpen(true)} size="small" sx={{ borderRadius: 2 }}>
                        Add Task
                    </Button>
                )}
            </Box>
            
            <CapaActionPanel actions={record.actions || []} readOnly={!canEdit} />
            
            {record.status === "VERIFICATION" && (
              <Box sx={{ mt: 5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Closure Verification</Typography>
                <Divider sx={{ mb: 3 }} />
                <ClosureChecklist />
              </Box>
            )}
          </Box>
        }
        attachments={<AttachmentsUploader readOnly={!canEdit} />}
        approvals={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ApprovalsPanel requests={[]} canAddReviewer={canEdit} onAddReviewer={() => setAssignModalOpen(true)} />
            <SignatureLogTable rows={record.signatures || []} />
          </Box>
        }
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ActivityLog />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>System Audit Trail</Typography>
            <AuditTrailTable rows={record.audit_trail || []} />
          </Box>
        }
      />

      {/* --- MODALS --- */}
      <AddCapaActionModal 
        open={addActionModalOpen} 
        onClose={() => setAddActionModalOpen(false)} 
        onAdd={handleAddAction} 
      />
      <UserSelectionModal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} onSelect={() => setAssignModalOpen(false)} title="Assign CAPA Approver" />
      <ReasonForChangeModal open={reasonModalOpen} onClose={() => setReasonModalOpen(false)} onConfirm={(reason) => handleConfirmSave(reason)} />
      <ConfirmDialog 
        open={saveDialogOpen} 
        title="Confirm Updates" 
        message="This action will permanently update the investigation and plan details. Proceed?" 
        confirmText="Save Changes" 
        onClose={() => setSaveDialogOpen(false)} 
        onConfirm={() => handleConfirmSave()} 
      />
    </>
  );
}