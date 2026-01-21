import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import DetailTabsLayout from "../../components/qms/DetailTabsLayout";
import StatusChip from "../../components/qms/StatusChip";
import WorkflowTimeline from "../../components/qms/WorkflowTimeline";
import AttachmentsUploader from "../../components/qms/AttachmentsUploader";
import ActivityLog from "../../components/qms/ActivityLog";
import ApprovalsPanel from "../../components/qms/ApprovalsPanel";
import type { WorkflowStatus } from "../../config/workflows";

export default function DeviationsDetailPage() {
  const { id } = useParams();
  const status: WorkflowStatus = "Investigation"; 

  return (
    <DetailTabsLayout
      title="Deviation / Incident Detail"
      subtitle={`Record ID: ${id}`}
      backTo="/deviations"
      statusChip={<StatusChip status={status} />}
      rightPanel={<WorkflowTimeline moduleKey="deviations" currentStatus={status} />}
      overview={
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Overview
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Deviation record placeholder. Later includes investigation, root cause
            analysis, impact assessment, and linked CAPA.
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 2, display: "block" }}
          >
            QA Review Required • Audit Trail (placeholder)
          </Typography>
        </Box>
      }
      attachments={<AttachmentsUploader />}
      activity={<ActivityLog />}
      approvals={<ApprovalsPanel />}
    />
  );
}
