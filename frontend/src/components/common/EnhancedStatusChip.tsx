import { Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { transitions } from "../../theme/motion";

/**
 * Enhanced Status Chip with Icons and Animations
 * Consistent styling across all modules
 */

export type StatusType =
  | "Draft"
  | "Pending Review"
  | "In Review"
  | "Approved"
  | "Rejected"
  | "Active"
  | "Inactive"
  | "Completed"
  | "Overdue"
  | "Open"
  | "Closed"
  | "In Progress";

interface EnhancedStatusChipProps {
  status: StatusType;
  size?: "small" | "medium";
  showIcon?: boolean;
}

export default function EnhancedStatusChip({
  status,
  size = "small",
  showIcon = true,
}: EnhancedStatusChipProps) {
  const statusConfig: Record<
    StatusType,
    { color: string; bgcolor: string; icon?: React.ReactNode }
  > = {
    Draft: {
      color: "#858D96",
      bgcolor: "#F3F4F6",
      icon: <HourglassEmptyIcon />,
    },
    "Pending Review": {
      color: "#F59E0B",
      bgcolor: "#FEF3C7",
      icon: <ScheduleIcon />,
    },
    "In Review": {
      color: "#3B82F6",
      bgcolor: "#DBEAFE",
      icon: <ScheduleIcon />,
    },
    Approved: {
      color: "#10B981",
      bgcolor: "#D1FAE5",
      icon: <CheckCircleIcon />,
    },
    Rejected: {
      color: "#DC2626",
      bgcolor: "#FEE2E2",
      icon: <ErrorIcon />,
    },
    Active: {
      color: "#10B981",
      bgcolor: "#D1FAE5",
      icon: <CheckCircleIcon />,
    },
    Inactive: {
      color: "#858D96",
      bgcolor: "#F3F4F6",
    },
    Completed: {
      color: "#10B981",
      bgcolor: "#D1FAE5",
      icon: <CheckCircleIcon />,
    },
    Overdue: {
      color: "#DC2626",
      bgcolor: "#FEE2E2",
      icon: <ErrorIcon />,
    },
    Open: {
      color: "#3B82F6",
      bgcolor: "#DBEAFE",
    },
    Closed: {
      color: "#858D96",
      bgcolor: "#F3F4F6",
    },
    "In Progress": {
      color: "#6366F1",
      bgcolor: "#E0E7FF",
      icon: <ScheduleIcon />,
    },
  };

  const config = statusConfig[status];

  return (
    <Chip
      label={status}
      size={size}
      icon={showIcon && config.icon ? config.icon as any : undefined}
      sx={{
        fontWeight: 600,
        color: config.color,
        bgcolor: config.bgcolor,
        border: `1px solid ${config.color}20`,
        transition: transitions.chip.default,
        "& .MuiChip-icon": {
          color: config.color,
          fontSize: size === "small" ? 16 : 18,
        },
        "&:hover": {
          bgcolor: config.bgcolor,
          boxShadow: `0 0 0 3px ${config.color}15`,
        },
      }}
    />
  );
}
