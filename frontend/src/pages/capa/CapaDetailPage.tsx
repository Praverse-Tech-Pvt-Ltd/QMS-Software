import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, TextField, Typography, Divider, MenuItem, Button,
  CircularProgress, Alert, Grid
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";

// --- IMPORTS ---
import { capaService, type CapaRecord } from "../../services/capa.service";
import { useRole } from "../../app/providers/RoleProvider";

// --- COMPONENTS ---
import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import SignatureStamp from "../../components/qms/SignatureStamp";
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal";
import UserSelectionModal from "../../components/common/UserSelectionModal";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import WorkflowActionsPanel from "../../components/qms/WorkflowActionsPanel";
import { WORKFLOWS } from "../../config/workflows";

// Module Specific Components
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
    case "PLANNING": return "Draft";
    case "PENDING":
    case "IMPLEMENTATION": return "In Progress";
    case "VERIFICATION": return "Review";
    case "CLOSED": return "Closed";
    default: return "Draft";
  }
};

export default function CapaDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

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
      const data = await capaService.getById(id);
      setRecord(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load CAPA record.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const canEdit = role && record 
    ? record.status !== "VERIFIED" && record.status !== "VERIFICATION"
    : false;

  const handleFieldChange = (field: keyof CapaRecord, value: any) => {
    if (record) setRecord({ ...record, [field]: value });
  };

  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async (reason?: string) => {
    if (!record || !id) return;
    try {
      await capaService.update(id, {
        ...record,
        change_reason: reason || "Investigation update",
      } as any);
      setSaveDialogOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to save changes.");
    }
  };

  const handleAddAction = async (actionData: any) => {
    if (!id) return;
    try {
      await capaService.addAction(id, actionData);
      setAddActionModalOpen(false);
      loadData(); // Refresh to see the new action in the table
    } catch (err) {
      alert("Failed to add action item.");
    }
  };

  const handleAddReviewer = (_user: any) => {
    setAssignModalOpen(false);
  };

  if (loading) return <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading CAPA Record...</Typography></Box>;
  if (error || !record) return <Box sx={{ p: 5 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <>
      <DetailTabsLayout
        title={`${record.capa_id || record.id}: ${record.title}`}
        subtitle={`Record ID: ${id}`}
        backTo="/capa"
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {record.status === "VERIFIED" && (
              <SignatureStamp isSigned={true} signedBy="QA Manager" date={new Date().toLocaleDateString()} />
            )}
            <StatusChip status={record.status} />
          </Box>
        }
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline currentStatus={mapStatusToWorkflow(record.status)} steps={WORKFLOWS.capa.steps} />
            <WorkflowActionsPanel
              recordId={id || ""}
              moduleKey="capa"
              meta={{
                ...record,
                id: record.id.toString(),
                moduleKey: "capa",
                status: mapStatusToWorkflow(record.status),
                approvalRequests: [],
                approvalsLog: [],
                signatureLog: [],
              }}
              onUpdated={loadData}
              onValidate={() => true}
            />
            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Metadata</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Source</Typography>
                  <Typography variant="body2">{record.deviation ? `Deviation #${record.deviation}` : "Manual"}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Priority</Typography>
                  <Typography variant="body2">{record.action_type || "Standard"}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        }
        overview={
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Problem & Investigation</Typography>
              {canEdit && (
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveClick} size="small">
                  Save Changes
                </Button>
              )}
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField select label="CAPA Type" value={record.action_type} fullWidth disabled={!canEdit}
                  onChange={(e) => handleFieldChange("action_type", e.target.value)}>
                  <MenuItem value="CORRECTIVE">Corrective Action</MenuItem>
                  <MenuItem value="PREVENTIVE">Preventive Action</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Target Date" type="date" value={record.due_date} fullWidth disabled={!canEdit}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(e) => handleFieldChange("due_date", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Owner" defaultValue="QA Lead" fullWidth disabled={!canEdit} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Problem Statement" value={record.description} fullWidth multiline rows={3} disabled={!canEdit}
                  onChange={(e) => handleFieldChange("description", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Root Cause Analysis (RCA)" value={record.root_cause || ""} fullWidth multiline rows={3} disabled={!canEdit}
                  helperText="Identify the underlying cause using 5-Whys or Fishbone"
                  onChange={(e) => handleFieldChange("root_cause", e.target.value)} />
              </Grid>
            </Grid>
          </Box>
        }
        plan={
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                {canEdit && (
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setAddActionModalOpen(true)} size="small">
                        Add Action Item
                    </Button>
                )}
            </Box>
            
            {/* ✅ Actions Table now pulls from record.actions */}
            <CapaActionPanel actions={record.actions || []} readOnly={!canEdit} />
            
            {record.status === "VERIFICATION" && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ my: 3 }} />
                <ClosureChecklist />
              </Box>
            )}
          </Box>
        }
        attachments={<AttachmentsUploader readOnly={!canEdit} />}
        approvals={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ApprovalsPanel requests={[]} canAddReviewer={canEdit} onAddReviewer={() => setAssignModalOpen(true)} />
            <SignatureLogTable rows={[]} />
          </Box>
        }
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ActivityLog />
            <Divider />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Audit Log</Typography>
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

      <UserSelectionModal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} onSelect={handleAddReviewer} title="Assign CAPA Approver" />
      
      <ReasonForChangeModal 
        open={reasonModalOpen} 
        onClose={() => setReasonModalOpen(false)} 
        onConfirm={(reason) => { setReasonModalOpen(false); handleConfirmSave(reason); }} 
      />
      
      <ConfirmDialog 
        open={saveDialogOpen} 
        title="Save CAPA Record?" 
        message="This will update the investigation and action plan details. Are you sure?" 
        confirmText="Save" 
        onClose={() => setSaveDialogOpen(false)} 
        onConfirm={() => handleConfirmSave()} 
      />
    </>
  );
}