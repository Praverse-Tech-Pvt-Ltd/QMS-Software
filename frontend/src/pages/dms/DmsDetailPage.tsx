import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  Box,
  Grid, // ✅ Import Grid2 as Grid for 'size' prop support
  TextField,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";

// --- ENGINEERING STANDARDS IMPORTS ---
import { useFetch } from "../../hooks/useFetch";
import { dmsService } from "../../services/dms.service";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// --- COMPONENT IMPORTS ---
import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import SignatureStamp from "../../components/qms/SignatureStamp";
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal";
import UserSelectionModal from "../../components/common/UserSelectionModal";

// DMS Specific Components
import VersionHistoryPanel from "../../components/dms/VersionHistoryPanel";
import PeriodicReviewCard from "../../components/dms/PeriodicReviewCard";
import VersionCompareModal from "../../components/dms/VersionCompareModal";
import ControlledCopyPrintModal from "../../components/dms/ControlledCopyPrintModal";

// Generic QMS Components
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
export default function DmsDetailPage() {
  const { id } = useParams();
  const { role } = useRole();
  
  // 1. DATA FETCHING
  const { 
    data: record, 
    isLoading, 
    error, 
    refetch 
  } = useFetch(() => dmsService.getById(id || ""), [id]);

  // 2. LOCAL STATE
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
  // DMS Specific State
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ old: "", new: "" });
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // 3. PERMISSIONS - Check both role and record status
  const canEdit = permissionService.can(role, 'dms', 'edit') && 
                  (record?.status === 'Draft' || record?.status === 'Review');
  const canDelete = permissionService.can(role, 'dms', 'delete');

  // 4. HANDLERS
  const handleSaveClick = () => setSaveDialogOpen(true);

  const handleConfirmSave = async () => {
    await dmsService.update(id!, { ...record });
    setSaveDialogOpen(false);
    refetch();
  };

  const handleCompare = (vOld: string, vNew: string) => {
    setCompareVersions({ old: vOld, new: vNew });
    setCompareModalOpen(true);
  };

  const handleAddReviewer = (user: any) => {
    console.log("Assigning user:", user);
    setAssignModalOpen(false);
  };

  // 5. LOADING / ERROR STATES
  if (isLoading) return <LoadingState message="Loading Document..." />;
  if (error || !record) return <ErrorState onRetry={refetch} />;

  // 6. RENDER
  return (
    <>
      <DetailTabsLayout
        title={`${record.id}: ${record.title}`}
        subtitle={`Version: ${record.version}`}
        backTo="/dms"
        
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: 'center' }}>
            {(record.status === "Effective" || record.status === "Approved") && (
                <SignatureStamp
                  isSigned={true}
                  signedBy="Quality Assurance"
                  date={record.effectiveDate || new Date().toLocaleDateString()}
                />
            )}
            <StatusChip status={record.status} />
          </Box>
        }

        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Document Metadata
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Created By</Typography>
                        <Typography variant="body2">John Doe</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Effective Date</Typography>
                        <Typography variant="body2">{record.effectiveDate || '-'}</Typography>
                    </Box>
                </Box>
            </Box>
            <Divider />
            <PeriodicReviewCard />
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => setPrintModalOpen(true)}
              fullWidth
            >
              Print Controlled Copy
            </Button>
          </Box>
        }

        overview={
          <Box sx={{ p: 1 }}>
             <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Document Information
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

             {/* ✅ CORRECTED: Using 'size' object prop for Grid2 */}
             <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    label="Document Title"
                    defaultValue={record.title}
                    fullWidth
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Document Type"
                    defaultValue={record.type}
                    fullWidth
                    disabled={!canEdit}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Scope / Description"
                    defaultValue={record.description}
                    fullWidth
                    multiline
                    rows={4}
                    disabled={!canEdit}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Owner / Department"
                    defaultValue={record.owner}
                    fullWidth
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Next Review Date"
                    defaultValue={record.nextReview}
                    fullWidth
                    disabled={!canEdit}
                  />
                </Grid>
             </Grid>

             <Divider sx={{ my: 4 }} />

             <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Lifecycle Management
             </Typography>
             <VersionHistoryPanel
                currentVersion={record.version}
                rows={[
                  { version: "v1.1", status: "Effective", effectiveDate: "2024-01-10", updatedBy: "QA Lead", updatedAt: "2024-01-11" },
                  { version: "v1.0", status: "Superseded", effectiveDate: "2023-01-01", updatedBy: "QA Manager", updatedAt: "2023-01-02" },
                ]}
                onView={(v) => console.log("View:", v)}
                onCompare={handleCompare}
             />
          </Box>
        }

        attachments={<AttachmentsUploader readOnly={!canEdit} />}

        approvals={
           <Box sx={{ display: "grid", gap: 3 }}>
              <ApprovalsPanel 
                  requests={record.approvalRequests || []} 
                  canAddReviewer={canEdit} 
                  onAddReviewer={() => setAssignModalOpen(true)}
              />
           </Box>
        }

        activity={
           <Box sx={{ display: "grid", gap: 3 }}>
              <Typography variant="h6" fontWeight={800}>Audit Log</Typography>
              <AuditTrailTable rows={[]} /> 
           </Box>
        }
      />

      {/* --- MODALS --- */}
      <UserSelectionModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSelect={handleAddReviewer}
        title="Assign Reviewer / Approver"
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
        title="Save Document?"
        message="This will update the document metadata. A version increment may be required."
        confirmText="Save"
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={() => {
             handleConfirmSave();
        }}
      />

      <VersionCompareModal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        oldVersion={compareVersions.old}
        newVersion={compareVersions.new}
      />

      <ControlledCopyPrintModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        docTitle={record.title}
        docId={record.id}
        version={record.version}
      />
    </>
  );
}