import { Chip } from "@mui/material";
import { type WorkflowStatus } from "../../services/workflow.service";

interface StatusChipProps {
  status: WorkflowStatus | string;
}

export default function StatusChip({ status }: StatusChipProps) {
  // ✅ Convert to UPPERCASE for internal logic to match backend union types
  const normalizedStatus = status.toUpperCase();

  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case "DRAFT":
        return { color: "default", label: "Draft" };

      case "REVIEW":
      case "QA_REVIEW":
      case "UNDER_REVIEW":
      case "EVALUATION":
        return { color: "warning", label: "In Review" };

      case "INVESTIGATION":
        return { color: "info", label: "Investigation" };

      case "PLANNING":
        return { color: "info", label: "Planning" };

      case "IMPLEMENTATION":
      case "IN_PROGRESS":
        return { color: "primary", label: "In Progress" };

      case "APPROVED":
      case "EFFECTIVE":
      case "VERIFIED":
      case "COMPLETED":
        return { color: "success", label: normalizedStatus === "EFFECTIVE" ? "Effective" : "Approved" };

      case "VERIFICATION":
        return { color: "secondary", label: "Verification" };

      case "CLOSED":
        return { color: "default", label: "Closed" };

      case "REJECTED":
      case "OBSOLETE":
      case "OVERDUE":
        return { color: "error", label: normalizedStatus.charAt(0) + normalizedStatus.slice(1).toLowerCase() };

      default:
        return { color: "default", label: status };
    }
  };

  const { color, label } = getStatusConfig();

  return (
    <Chip
      size="small"
      label={label}
      color={color as any}
      variant="filled" // ✅ Changed to filled for better readability in high-contrast mode
      sx={{ 
        fontWeight: 800, 
        fontSize: '0.7rem',
        borderRadius: 1.5,
        textTransform: 'uppercase', // Maintains a professional GxP look
        height: 24,
        px: 0.5
      }}
    />
  );
}