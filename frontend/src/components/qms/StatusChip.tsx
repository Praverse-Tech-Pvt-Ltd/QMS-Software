import { Chip } from "@mui/material";
import type { WorkflowStatus } from "../../config/workflows";

export default function StatusChip({ status }: { status: WorkflowStatus }) {
  const getColor = () => {
    switch (status) {
      case "Draft":
        return "default";
      case "In Review":
        return "warning";
      case "Investigation":
        return "info";
      case "Approved":
        return "success";
      case "Effective":
        return "success";
      case "Implemented":
        return "info";
      case "Effectiveness Check":
        return "secondary";
      case "Closed":
        return "secondary";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Chip
      size="small"
      label={status}
      color={getColor() as any}
      variant="outlined"
    />
  );
}
