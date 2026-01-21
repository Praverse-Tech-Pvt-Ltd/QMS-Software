import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ActivityLog from "../../components/qms/ActivityLog";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import type { WorkflowStatus } from "../../config/workflows";

export default function ChangeControlDetailPage() {
  const { id } = useParams();
  const status: WorkflowStatus = "Implemented";

  return (
    <DetailTabsLayout
      title="Change Control Detail"
      subtitle={`Record ID: ${id}`}
      backTo="/change-control"
      statusChip={<StatusChip status={status} />}
      rightPanel={<WorkflowTimeline moduleKey="change" currentStatus={status} />}
      overview={
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Overview
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Change Control record placeholder. Later includes impact assessment,
            risk evaluation, approvals, implementation verification, and closure.
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 2, display: "block" }}
          >
            Impact Assessment (placeholder) • QA Approval Required
          </Typography>
        </Box>
      }
      attachments={<AttachmentsUploader />}
      activity={<ActivityLog />}
      approvals={<ApprovalsPanel />}
    />
  );
}
