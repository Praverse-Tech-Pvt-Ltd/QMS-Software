import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, Button, Typography, Divider, TextField, MenuItem, CircularProgress, Alert, Grid } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

import { deviationsService, type DeviationRecord } from "../../services/deviations.service";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

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

const mapStatusToWorkflow = (backendStatus: string): any => {
  switch (backendStatus) {
    case "DRAFT": return "Draft";
    case "INVESTIGATION": return "Investigation";
    case "QA_REVIEW":
    case "UNDER_REVIEW": return "Review"; 
    case "CLOSED":
    case "APPROVED": return "Closed";
    default: return "Draft";
  }
};

export default function DeviationsDetailPage() {
  const { id } = useParams();
  const { role } = useRole();

  const [record, setRecord] = useState<DeviationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await deviationsService.getById(id);
      setRecord(data);
    } catch (err) {
      setError("Failed to load Deviation Record.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const canEdit = role && record 
    ? permissionService.can(role, 'deviations', 'edit') && record.status !== "CLOSED"
    : false;

  // ✅ FIX: Two-way binding for form fields
  const handleFieldChange = (field: keyof DeviationRecord, value: any) => {
    if (record) setRecord({ ...record, [field]: value });
  };

  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async (reason?: string) => {
    if (!record || !id) return;
    try {
      await deviationsService.update(id, { ...record, change_reason: reason || "Manual investigation update" });
      setSaveDialogOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to save changes.");
    }
  };

  if (loading) return <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /><Typography>Loading...</Typography></Box>;
  if (error || !record) return <Box sx={{ p: 5 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <>
      <DetailTabsLayout
        title={`${record.deviation_id || record.id}: ${record.title}`}
        subtitle="Deviation Record"
        backTo="/deviations"
        statusChip={<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {record.status === "CLOSED" && <SignatureStamp isSigned={true} signedBy="QA" date={new Date().toLocaleDateString()} />}
            <StatusChip status={mapStatusToWorkflow(record.status)} />
        </Box>}
        rightPanel={<Box sx={{ display: "grid", gap: 3 }}>
            <WorkflowTimeline currentStatus={mapStatusToWorkflow(record.status)} steps={WORKFLOWS.deviations.steps} />
            <WorkflowActionsPanel recordId={id || ""} moduleKey="deviations" onUpdated={loadData}
              meta={{ ...record, id: record.id.toString(), status: mapStatusToWorkflow(record.status) } as any} 
            />
            <Divider />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Metadata</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Department</Typography>
                <Typography variant="body2">{record.department}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">Occurrence</Typography>
                <Typography variant="body2">{record.occurrence_date}</Typography></Grid>
              </Grid>
            </Box>
        </Box>}
        overview={
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Event Investigation</Typography>
              {canEdit && <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveClick} size="small">Save Changes</Button>}
            </Box>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}><TextField label="Title" value={record.title} fullWidth disabled={!canEdit} onChange={(e) => handleFieldChange("title", e.target.value)} /></Grid>
                <Grid size={{ xs: 12, md: 4 }}><TextField select label="Severity" value={record.risk_level} fullWidth disabled={!canEdit} onChange={(e) => handleFieldChange("risk_level", e.target.value)}>
                    <MenuItem value="MINOR">Minor</MenuItem><MenuItem value="MAJOR">Major</MenuItem><MenuItem value="CRITICAL">Critical</MenuItem>
                </TextField></Grid>
                <Grid size={{ xs: 12 }}><TextField label="Description" value={record.description} fullWidth multiline rows={3} disabled={!canEdit} onChange={(e) => handleFieldChange("description", e.target.value)} /></Grid>
                <Grid size={{ xs: 12 }}><TextField label="Immediate Actions" value={record.immediate_actions || ""} fullWidth multiline rows={2} disabled={!canEdit} onChange={(e) => handleFieldChange("immediate_actions", e.target.value)} /></Grid>
                <Grid size={{ xs: 12 }}><TextField label="Root Cause" value={record.root_cause || ""} fullWidth multiline rows={3} disabled={!canEdit} onChange={(e) => handleFieldChange("root_cause", e.target.value)} helperText="Required before QA Review" /></Grid>
            </Grid>
            <LinkedCapasPanel capas={record.capas || []} readOnly={!canEdit} />
          </Box>
        }
        attachments={<AttachmentsUploader readOnly={!canEdit} />}
        approvals={<Box sx={{ display: "grid", gap: 3 }}><ApprovalsPanel requests={[]} canAddReviewer={canEdit} onAddReviewer={() => setAssignModalOpen(true)} /></Box>}
        activity={<Box sx={{ display: "grid", gap: 3 }}>
            <Typography variant="h6" fontWeight={800}>Audit Log</Typography>
            <AuditTrailTable rows={record.audit_trail || []} />
        </Box>}
      />

      <UserSelectionModal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} onSelect={() => setAssignModalOpen(false)} title="Assign Reviewer" />
      <ReasonForChangeModal open={reasonModalOpen} onClose={() => setReasonModalOpen(false)} onConfirm={(r) => { setReasonModalOpen(false); handleConfirmSave(r); }} />
      <ConfirmDialog open={saveDialogOpen} title="Save Changes?" message="Update Deviation record?" confirmText="Save" onClose={() => setSaveDialogOpen(false)} onConfirm={() => handleConfirmSave()} />
    </>
  );
}