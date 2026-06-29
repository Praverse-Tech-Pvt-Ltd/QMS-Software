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
   Grid,
  Stack,
  alpha,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import HistoryIcon from "@mui/icons-material/History";

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
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import WorkflowActionsPanel from "../../components/qms/WorkflowActionsPanel";
import ActivityLog from "../../components/qms/ActivityLog";
import AIRemarkField from "../../components/common/AIRemarkField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { WORKFLOWS } from "../../config/workflows";

export default function DmsDetailPage() {
  const { id } = useParams<{ id: string }>();
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
  const [aiRemark, setAiRemark] = useState("");
  const [aiRemarkConfirmed, setAiRemarkConfirmed] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // ✅ Using the 'id' string (document_id) directly as per your routing requirement
      if (!id) return; // Guard clause
      const data = await dmsService.getById(id);
      setRecord(data);
    } catch (err) {
      setError("Failed to load controlled document.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const canEdit =
    role && record
      ? permissionService.can(role, "dms", "edit") &&
        (record.status === "DRAFT" || record.status === "REVIEW")
      : false;

  const handleSaveClick = () => setReasonModalOpen(true);

  const handleConfirmSave = async (reason: string) => {
    if (!record || !id) return;
    try {
      // ✅ Cast to any or the combined type to allow change_reason
      await dmsService.update(id, {
        title: record.title,
        department: record.department,
        change_reason: reason,
      } as any);
      setReasonModalOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to save document changes");
    }
  };

  const handleCompare = (vOld: string, vNew: string) => {
    setCompareVersions({ old: vOld, new: vNew });
    setCompareModalOpen(true);
  };

  if (loading)
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Syncing Controlled Record...</Typography>
      </Box>
    );

  if (error || !record)
    return (
      <Box sx={{ p: 5 }}>
        <Alert severity="error">{error || "Document not found"}</Alert>
      </Box>
    );

  return (
    <>
      <DetailTabsLayout
        title={`${record.document_id}: ${record.title}`}
        subtitle={`Current Revision: ${record.latest_version?.version_number || "Draft"}`}
        backTo="/dms"
        statusChip={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {(record.status === "EFFECTIVE" ||
              record.status === "APPROVED") && (
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
            <WorkflowTimeline
              currentStatus={record.status}
              steps={WORKFLOWS.dms.steps}
            />

            <WorkflowActionsPanel
              recordId={id ?? ""} // ✅ Use nullish coalescing operator
              moduleKey="dms"
              onUpdated={loadData}
              meta={{ ...record, id: id ?? "" } as any}
            />

            <Divider />

            <Box sx={{ p: 1 }}>
              <Typography
                variant="subtitle2"
                fontWeight={800}
                sx={{
                  mb: 2,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                }}
              >
                Document Governance
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    OWNER
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {record.owner}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    LAST UPDATED
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {record.updatedAt || "-"}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />
            <PeriodicReviewCard />

            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => setPrintModalOpen(true)}
              fullWidth
              sx={{ borderRadius: 2, fontWeight: 700, borderStyle: "dashed" }}
            >
              Issue Controlled Copy
            </Button>
          </Box>
        }
        overview={
          <Box sx={{ p: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 4,
                alignItems: "center",
              }}
            >
              <Typography variant="h6" fontWeight={900}>
                Primary Metadata
              </Typography>
              {canEdit && (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveClick}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  Save Metadata
                </Button>
              )}
            </Box>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  label="Document Title"
                  value={record.title}
                  fullWidth
                  disabled={!canEdit}
                  onChange={(e) =>
                    setRecord({ ...record, title: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f8fafc",
                      borderRadius: 3,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Document Classification"
                  value={record.doc_type}
                  fullWidth
                  disabled={!canEdit}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f8fafc",
                      borderRadius: 3,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Owning Department"
                  value={record.department}
                  fullWidth
                  disabled={!canEdit}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f8fafc",
                      borderRadius: 3,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 5, borderStyle: "dashed" }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    bgcolor: alpha("#4f46e5", 0.1),
                    p: 1,
                    borderRadius: 2,
                    display: "flex",
                  }}
                >
                  <HistoryIcon color="primary" />
                </Box>
                <Typography variant="h6" fontWeight={900}>
                  Version Control
                </Typography>
              </Stack>
              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  onClick={() => setUploadModalOpen(true)}
                  size="small"
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Upload Revision
                </Button>
              )}
            </Box>

            <VersionHistoryPanel
              currentVersion={record.latest_version?.version_number || "Draft"}
              rows={record.versions || []}
              onView={(v) => console.log("Viewing PDF version:", v)}
              onCompare={handleCompare}
            />
          </Box>
        }
        attachments={<AttachmentsUploader readOnly={!canEdit} />}
        approvals={
          <Box sx={{ display: "grid", gap: 3 }}>
            {(record.status === "REVIEW" || record.status === "DRAFT") && (
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
                    AI-Drafted Review Remark
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                    Use this as a starting point for your comment in the workflow action panel.
                  </Typography>
                  <AIRemarkField
                    module="dms"
                    recordId={id ?? ""}
                    approverRole={record.status === "REVIEW" ? "document_approver" : "document_reviewer"}
                    stage={record.status === "REVIEW" ? "approval" : "review"}
                    value={aiRemark}
                    onRemarkChange={setAiRemark}
                    onConfirmChange={setAiRemarkConfirmed}
                  />
                  {aiRemarkConfirmed && (
                    <Typography variant="caption" color="success.main" sx={{ display: "block", mt: 1 }}>
                      ✓ Remark confirmed — copy it into the workflow action comment box below.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
            <ApprovalsPanel
              requests={record.approvalRequests || []}
              canAddReviewer={canEdit}
              onAddReviewer={() => setAssignModalOpen(true)}
            />
          </Box>
        }
        activity={
          <Box sx={{ display: "grid", gap: 3 }}>
            <ActivityLog />
            <Typography variant="h6" fontWeight={900}>
              Regulatory Audit Trail
            </Typography>
            <AuditTrailTable rows={record.audit_trail || []} />
          </Box>
        }
      />

      <UserSelectionModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSelect={() => setAssignModalOpen(false)}
        title="Assign Quality Reviewer"
      />

      <ReasonForChangeModal
        open={reasonModalOpen}
        onClose={() => setReasonModalOpen(false)}
        onConfirm={handleConfirmSave}
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
        docTitle={record.title || ""} // ✅ Fallback to empty string
        docId={record.document_id || ""} // ✅ Fallback to empty string
        version={record.latest_version?.version_number || "Draft"}
      />

      {uploadModalOpen && (
        <FileUploadModal
          docId={id!} // Pass document_id string
          onClose={() => setUploadModalOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </>
  );
}
