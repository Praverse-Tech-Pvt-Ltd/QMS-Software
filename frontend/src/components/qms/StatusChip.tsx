import { Chip } from "@mui/material";
// ✅ FIXED: Import from types, not config
import {type WorkflowStatus } from "../../types/workflow.types"; 

export default function StatusChip({ status }: { status: WorkflowStatus | string }) {
  const getColor = () => {
    switch (status) {
      case "Draft":
        return "default";
        
      case "Review": // Updated from "In Review"
      case "QA Review": 
        return "warning";
        
      case "Investigation":
        return "info";
        
      case "Approved":
        return "success";
        
      case "Effective":
        return "success";
        
      case "Implementation": // Updated from "Implemented"
        return "info";
        
      case "Verification": // Updated from "Effectiveness Check"
        return "secondary";
        
      case "Closed":
        return "default"; // Changed to default (grey) as it's a final state
        
      case "Rejected":
      case "Obsolete":
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
      sx={{ fontWeight: 600 }}
    />
  );
}