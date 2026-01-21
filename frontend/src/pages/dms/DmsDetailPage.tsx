import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ActivityLog from "../../components/qms/ActivityLog";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import type { WorkflowStatus } from "../../config/workflows";

export default function DmsDetailPage() {
  const { id } = useParams();
const status: WorkflowStatus = "In Review";

  return (
    <DetailTabsLayout
      title="Document Detail"
      subtitle={`Record ID: ${id}`}
      backTo="/dms"
      statusChip={<StatusChip status={status} />}
      rightPanel={<WorkflowTimeline moduleKey="dms" currentStatus={status} />}
      overview={
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Overview
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Controlled document record placeholder. Later includes versioning,
            effective date, reviewers, and controlled copy distribution.
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 2, display: "block" }}
          >
            Audit Trail (placeholder) • e-Signature required (placeholder)
          </Typography>
        </Box>
      }
      attachments={<AttachmentsUploader />}
      activity={<ActivityLog />}
      approvals={<ApprovalsPanel />}
    />
  );
}
