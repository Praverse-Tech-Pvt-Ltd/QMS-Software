import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box, TextField, Typography, Divider, MenuItem, Button,
  CircularProgress, Alert, Grid
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

// --- IMPORTS ---
import { changeService, type ChangeRecord } from "../../services/change.service";
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

import ImpactAssessmentPanel from "../../components/change/ImpactAssessmentPanel";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import SignatureLogTable from "../../components/qms/SignatureLogTable";
import ActivityLog from "../../components/qms/ActivityLog";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const mapStatusToWorkflow = (backendStatus: string): any => {
  switch (backendStatus) {
    case "DRAFT": return "Draft";
    case "EVALUATION":
    case "APPROVAL": return "Review";
    case "IMPLEMENTATION": return "In Progress";
    case "CLOSED": return "Closed";
    default: return "Draft";
  }
};

export default function ChangeControlDetailPage() {
  const { id } = useParams(); // This is the cc_id (e.g. CC-2026-001)
  const { role } = useRole();

  const [record, setRecord] = useState<ChangeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await changeService.getById(id);
      setRecord(data);
    } catch (err) {
      setError("Failed to load Change Request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const canEdit = role && record 
    ? permissionService.can(role, "change", "edit") && record.status !== "CLOSED"
    : false;

  const handleFieldChange = (field: keyof ChangeRecord, value: any) => {
    if (record) setRecord({ ...record, [field]: value });
  };

  const handleImpactChange = (newImpactData: any) => {
    if (record) setRecord({ ...record, impact_data: newImpactData });
  };

  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async (reason?: string) => {
    if (!record || !id) return;
    try {
      await changeService.update(id, { 
        ...record, 
        change_reason: reason || "Investigation/Assessment Update" 
      } as any);
      setSaveDialogOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to save changes.");
    }
  };

  if (loading) return <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading...</Typography></Box>;
  if (error || !record) return <Box sx={{ p: 5 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <>
      <DetailTabsLayout
        title={`${record.cc_id}: ${record.title}`}
        subtitle={`Record ID: ${record.id}`}
        backTo="/change-control"
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {record.status === "CLOSED" && (
              <SignatureStamp isSigned={true} signedBy="QA Manager" date={new Date().toLocaleDateString()} />
            )}
            <StatusChip status={record.status} />
          </Box>
        }
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline currentStatus={mapStatusToWorkflow(record.status)} steps={WORKFLOWS.change.steps} />
            <WorkflowActionsPanel
              recordId={id || ""}
              moduleKey="change"
              meta={{
                ...record,
                id: record.id.toString(),
                moduleKey: "change",
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
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body2">{record.change_type}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Department</Typography>
                  <Typography variant="body2">{record.department}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        }
        overview={
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>General Information</Typography>
              {canEdit && (
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveClick} size="small">
                  Save Changes
                </Button>
              )}
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField label="Change Title" value={record.title} fullWidth disabled={!canEdit}
                  onChange={(e) => handleFieldChange("title", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField select label="Change Type" value={record.change_type} fullWidth disabled={!canEdit}
                  onChange={(e) => handleFieldChange("change_type", e.target.value)}>
                  <MenuItem value="STANDARD">Standard</MenuItem>
                  <MenuItem value="PERMANENT">Permanent</MenuItem>
                  <MenuItem value="TEMPORARY">Temporary</MenuItem>
                  <MenuItem value="EMERGENCY">Emergency</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Description & Justification" value={record.description} fullWidth multiline rows={4} disabled={!canEdit}
                  onChange={(e) => handleFieldChange("description", e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Target Implementation Date" type="date" value={record.target_date || ""} fullWidth disabled={!canEdit}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(e) => handleFieldChange("target_date", e.target.value)} />
              </Grid>
            </Grid>
          </Box>
        }
        impact={
          <Box sx={{ p: 1 }}>
            {/* ✅ Impact Assessment now connected to backend impact_data */}
            <ImpactAssessmentPanel 
              data={record.impact_data || {}} 
              onChange={handleImpactChange}
              readOnly={!canEdit} 
            />
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
      <UserSelectionModal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} onSelect={() => setAssignModalOpen(false)} title="Assign Approver" />
      <ReasonForChangeModal open={reasonModalOpen} onClose={() => setReasonModalOpen(false)} onConfirm={(r) => handleConfirmSave(r)} />
      <ConfirmDialog 
        open={saveDialogOpen} 
        title="Save Changes?" 
        message="Update change control assessment details?" 
        confirmText="Save" 
        onClose={() => setSaveDialogOpen(false)} 
        onConfirm={() => handleConfirmSave()} 
      />
    </>
  );
}