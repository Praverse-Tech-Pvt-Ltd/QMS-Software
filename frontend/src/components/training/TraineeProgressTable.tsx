import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import type { TrainingAssignment } from "../../services/training.service";

/**
 * ✅ Prop interface matching the usage in TrainingDetailPage
 */
export interface TraineeProgressTableProps {
  rows: TrainingAssignment[];
  onRemind?: (id: number | string) => void;
}

export default function TraineeProgressTable({
  rows,
  onRemind,
}: TraineeProgressTableProps) {
  
  /**
   * ✅ GxP Status Mapping
   * Maps backend statuses to high-visibility UI chips for regulatory clarity.
   */
  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return { color: "success", label: "QUALIFIED", variant: "filled" as const };
      case "OVERDUE":
        return { color: "error", label: "OVERDUE", variant: "outlined" as const };
      case "PENDING":
        return { color: "warning", label: "IN TRAINING", variant: "outlined" as const };
      default:
        return { color: "default", label: status || "UNKNOWN", variant: "outlined" as const };
    }
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <Table size="small">
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 800, py: 2 }}>Trainee Name</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Target Date</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Completion Date</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Score</TableCell>
            <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                <Stack alignItems="center" spacing={1.5}>
                  <AssignmentIndIcon sx={{ fontSize: 40, color: "text.disabled" }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    No personnel assigned to this training module yet.
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const { color, label, variant } = getStatusConfig(row.status);
              const isOverdue = row.status?.toUpperCase() === "OVERDUE";
              
              /**
               * ✅ Handshake: Unpack nested user_details from backend
               */
              const traineeName = row.user_details 
                ? `${row.user_details.first_name} ${row.user_details.last_name}`
                : `User ID: ${row.user}`;

              return (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      {traineeName}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        {row.user_details?.role && (
                            <Typography variant="caption" color="text.secondary">
                                {row.user_details.role}
                            </Typography>
                        )}
                        {row.user_details?.department && (
                            <Typography variant="caption" color="primary.main" fontWeight={600}>
                                • {row.user_details.department}
                            </Typography>
                        )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={label}
                      size="small"
                      color={color as any}
                      variant={variant}
                      sx={{
                        fontWeight: 900,
                        fontSize: "0.6rem",
                        height: 20,
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="caption"
                      fontWeight={isOverdue ? 800 : 600}
                      color={isOverdue ? "error.main" : "text.secondary"}
                    >
                      {row.due_date ? new Date(row.due_date).toLocaleDateString() : "—"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
                      {row.completion_date ? new Date(row.completion_date).toLocaleDateString() : "—"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="caption" fontWeight={800}>
                      {row.score !== undefined && row.score !== null ? `${row.score}%` : "—"}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    {row.status === "COMPLETED" ? (
                      <CheckCircleOutlineIcon color="success" fontSize="small" sx={{ opacity: 0.8 }} />
                    ) : (
                      <Tooltip title="Send Email Reminder">
                        <IconButton
                          size="small"
                          onClick={() => onRemind?.(row.id)}
                          sx={{
                            color: "primary.main",
                            bgcolor: alpha("#4f46e5", 0.05),
                            "&:hover": { bgcolor: alpha("#4f46e5", 0.15) },
                          }}
                        >
                          <NotificationsActiveIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/**
 * Utility to handle alpha colors for MUI components
 */
function alpha(color: string, opacity: number) {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`;
}