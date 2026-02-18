import { Chip } from "@mui/material";
import type { QmsStatus } from "../../services/permission.service";
import { transitions } from "../../theme/motion";

const getStatusStyle = (status: QmsStatus) => {
  const styles: Record<QmsStatus, { bgcolor: string; color: string; borderColor: string }> = {
    Draft: {
      bgcolor: "#F3F4F6",
      color: "#5C6370",
      borderColor: "#E9ECEF",
    },
    "In Review": {
      bgcolor: "#FEF3C7",
      color: "#B45309",
      borderColor: "#FCD34D",
    },
    Approved: {
      bgcolor: "#D4EDDA",
      color: "#0A8754",
      borderColor: "#6EE7B7",
    },
    Effective: {
      bgcolor: "#D4EDDA",
      color: "#047857",
      borderColor: "#6EE7B7",
    },
    Closed: {
      bgcolor: "#F3F4F6",
      color: "#374151",
      borderColor: "#D1D5DB",
    },
  };
  return styles[status] || styles.Draft;
};

export default function StatusChip({ status }: { status: QmsStatus }) {
  const style = getStatusStyle(status);

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        ...style,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 24,
        px: 1,
        border: "1px solid",
        letterSpacing: "0.02em",
        transition: transitions.status.change,
        "& .MuiChip-label": {
          px: 1,
        },
      }}
    />
  );
}
