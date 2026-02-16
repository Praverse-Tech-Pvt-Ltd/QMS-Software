import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid, // ✅ Standardized Grid Import
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { dmsService, type DmsDocument } from "../../services/dms.service";
import { permissionService } from "../../services/permission.service";
import { useRole } from "../../app/providers/RoleProvider";

import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import SignatureStamp from "../../components/qms/SignatureStamp";
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal";
import UserSelectionModal from "../../components/common/UserSelectionModal";

import VersionHistoryPanel from "../../components/dms/VersionHistoryPanel";
import PeriodicReviewCard from "../../components/dms/PeriodicReviewCard";
import VersionCompareModal from "../../components/dms/VersionCompareModal";
import ControlledCopyPrintModal from "../../components/dms/ControlledCopyPrintModal";
import { FileUploadModal } from "../../components/dms/FileUploadModal"; 

import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";

export default function DmsDetailPage() {
  const { id } = useParams();
  const { role } = useRole();
  
  const [record, setRecord] = useState<DmsDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false); 
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ old: "", new: "" });
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await dmsService.getById(id);
      setRecord(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load document.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const canEdit = role 
    ? permissionService.can(role, 'dms', 'edit') && (record?.status === 'DRAFT' || record?.status === 'REVIEW')
    : false;

  const handleSaveClick = () => setReasonModalOpen(true);

  const handleConfirmSave = async (reason: string) => {
    if (!record || !id) return;
    try {
      console.log("Saving with reason:", reason);
      await dmsService.update(id, { ...record });
      setReasonModalOpen(false);
      loadData(); 
    } catch (err) {
      alert("Failed to save changes");
    }
  };

  const handleCompare = (vOld: string, vNew: string) => {
    setCompareVersions({ old: vOld, new: vNew });
    setCompareModalOpen(true);
  };

  const handleAddReviewer = (user: any) => {
    console.log("Assigning user:", user);
    setAssignModalOpen(false);
  };

  if (loading) return <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /> <Typography>Loading Document...</Typography></Box>;
  if (error || !record) return <Box sx={{ p: 5 }}><Alert severity="error">{error || "Document not found"}</Alert></Box>;

  return (
    <>
      <DetailTabsLayout
        title={`${record.document_id || record.id}: ${record.title}`}
        subtitle={`Version: ${record.latest_version?.version_number || "Draft"}`}
        backTo="/dms"
        
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: 'center' }}>
            {(record.status === "EFFECTIVE" || record.status === "APPROVED") && (
              <SignatureStamp
                isSigned={true}
                signedBy="Quality Assurance"
                date={record.updatedAt || new Date().toLocaleDateString()}
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
                        <Typography variant="caption" color="text.secondary">Owner</Typography>
                        <Typography variant="body2">{record.owner}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Updated</Typography>
                        <Typography variant="body2">{record.updatedAt || '-'}</Typography>
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
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveClick} size="small">
                    Save Changes
                  </Button>
                )}
             </Box>

             <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    label="Document Title"
                    value={record.title}
                    fullWidth
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Document Type"
                    value={record.doc_type}
                    fullWidth
                    disabled={!canEdit}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Department"
                    value={record.department}
                    fullWidth
                    disabled={!canEdit}
                  />
                </Grid>
             </Grid>

             <Divider sx={{ my: 4 }} />

             <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Lifecycle Management
                </Typography>
                {canEdit && (
                  <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setUploadModalOpen(true)} size="small">
                    Upload New Version
                  </Button>
                )}
             </Box>
             
             <VersionHistoryPanel
                currentVersion={record.latest_version?.version_number || "Draft"}
                rows={[]} 
                onView={(v) => console.log("View:", v)}
                onCompare={handleCompare}
             />
          </Box>
        }

        attachments={<AttachmentsUploader readOnly={!canEdit} />}

        approvals={
           <Box sx={{ display: "grid", gap: 3 }}>
              <ApprovalsPanel 
                  requests={[]} 
                  canAddReviewer={canEdit} 
                  onAddReviewer={() => setAssignModalOpen(true)}
              />
           </Box>
        }

        activity={
           <Box sx={{ display: "grid", gap: 3 }}>
              {/* ✅ FIXED: Use separate Typography for title */}
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
             handleConfirmSave(reason);
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
        docId={record.id.toString()}
        version={record.latest_version?.version_number || "Draft"}
      />

      {uploadModalOpen && (
        <FileUploadModal 
            docId={record.id}
            onClose={() => setUploadModalOpen(false)}
            onSuccess={() => {
                loadData(); 
            }}
        />
      )}
    </>
  );
}