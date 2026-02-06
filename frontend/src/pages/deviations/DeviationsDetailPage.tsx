import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Box, Button, Typography, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

// --- ENGINEERING STANDARDS IMPORTS ---
import { useFetch } from "../../hooks/useFetch";
import { deviationsService } from "../../services/deviations.service";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// --- COMPONENT IMPORTS ---
import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import DeviationEventPanel from "../../components/deviations/DeviationEventPanel";
import LinkedCapasPanel from "../../components/deviations/LinkedCapasPanel";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import AuditTrailTable from "../../components/qms/AuditTrailTable";
import ReasonForChangeModal from "../../components/common/ReasonForChangeModal";
import SignatureStamp from "../../components/qms/SignatureStamp"; // Ensure this path is correct based on your folder structure

export default function DeviationsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useRole();

  // 1. DATA FETCHING (Using the standard Hook)
  const {
    data: record,
    isLoading,
    error,
    refetch,
  } = useFetch(() => deviationsService.getById(id || ""), [id]);

  // 2. LOCAL STATE
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // 3. PERMISSIONS & EDIT LOGIC - Check both role and record status
  const canEdit = permissionService.can(role, 'deviations', 'edit') && 
                  record?.status !== "Closed";
  const canDelete = permissionService.can(role, 'deviations', 'delete');
  const canReopen = permissionService.can(role, 'deviations', 'reopen');

  // 4. HANDLERS
  const handleSaveClick = () => {
    // Open the confirmation dialog first
    setSaveDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    // In a real app, you might pass updated form data here
    await deviationsService.update(id!, { ...record });
    setSaveDialogOpen(false);
    refetch(); // Refresh data
  };

  // 5. LOADING / ERROR STATES
  if (isLoading) return <LoadingState message="Loading Deviation Record..." />;
  if (error || !record) return <ErrorState onRetry={refetch} />;

  // 6. RENDER
  return (
    <>
      <DetailTabsLayout
        title={`${record.id}: ${record.title}`}
        subtitle="Deviation Record"
        backTo="/deviations"
        // Header Status Chip & Signature
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {record.status === "Closed" && (
              <SignatureStamp
                isSigned={true}
                signedBy="Quality Assurance"
                date={new Date().toLocaleDateString()}
              />
            )}
            <StatusChip status={record.status} />
          </Box>
        }
        // ✅ FIXED: Added the missing rightPanel prop
        rightPanel={
          <Box sx={{ display: "grid", gap: 3 }}>
            {/* Workflow Timeline */}
            <Typography variant="subtitle2" fontWeight={700}>
              Workflow Status
            </Typography>
            {/* You might need to import WorkflowTimeline if not already imported */}
            {/* <WorkflowTimeline currentStatus={record.status} steps={WORKFLOWS.deviations.steps} /> */}

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Metadata
              </Typography>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Reported By
                  </Typography>
                  <Typography variant="body2">John Doe</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body2">Production</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        }
        // TAB 1: OVERVIEW (The Form)
        overview={
          <Box sx={{ p: 1 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
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

            <DeviationEventPanel readOnly={!canEdit} />
            <LinkedCapasPanel readOnly={!canEdit} />
          </Box>
        }
        // TAB 2: ATTACHMENTS
        attachments={<AttachmentsUploader readOnly={!canEdit} />}
        // TAB 3: APPROVALS
        approvals={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ApprovalsPanel requests={[]} canAddReviewer={canEdit} />
          </Box>
        }
        // TAB 4: AUDIT TRAIL
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            <Typography variant="h6" fontWeight={800}>
              Audit Log
            </Typography>
            <AuditTrailTable rows={[]} />
          </Box>
        }
      />

      {/* --- MODALS --- */}

      {/* 1. Reason for Change (21 CFR Part 11 Requirement) */}
      <ReasonForChangeModal
        open={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        onConfirm={(reason) => {
          console.log("Reason logged:", reason);
          setReasonModalOpen(false);
          handleConfirmSave();
        }}
      />

      {/* 2. Generic Confirm Dialog (Engineering Standard) */}
      <ConfirmDialog
        open={saveDialogOpen}
        title="Save Changes?"
        message="This will update the Deviation record. Are you sure you want to proceed?"
        confirmText="Save"
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={() => {
          // If you want to force a reason log, open that modal next
          // setReasonModalOpen(true);
          // Otherwise, just save:
          handleConfirmSave();
        }}
      />
    </>
  );
}
