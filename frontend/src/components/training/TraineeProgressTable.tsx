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
  
} from "@mui/material";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { TrainingAssignment } from "../../services/training.service";

interface TraineeProgressTableProps {
  rows: TrainingAssignment[];
  onRemind?: (id: number | string) => void;
}

export default function TraineeProgressTable({ rows, onRemind }: TraineeProgressTableProps) {
  
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return { color: "success", label: "Qualified" };
      case "OVERDUE":
        return { color: "error", label: "Overdue" };
      case "PENDING":
        return { color: "warning", label: "In Training" };
      default:
        return { color: "default", label: status };
    }
  };

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Trainee Name</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Target Date</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Completion Date</TableCell>
            <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                <Typography variant="body2" fontStyle="italic">
                  No personnel assigned to this training module yet.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const { color, label } = getStatusConfig(row.status);
              return (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.user_name || `User ID: ${row.user}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={label} 
                      size="small" 
                      color={color as any}
                      sx={{ fontWeight: 700, fontSize: '0.65rem', height: 22 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color={row.status === "OVERDUE" ? "error.main" : "text.secondary"}>
                      {new Date(row.due_date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      {row.completion_date ? new Date(row.completion_date).toLocaleDateString() : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {row.status === "COMPLETED" ? (
                      <CheckCircleOutlineIcon color="success" fontSize="small" sx={{ opacity: 0.7 }} />
                    ) : (
                      <Tooltip title="Send Reminder Notification">
                        <IconButton 
                          size="small" 
                          onClick={() => onRemind?.(row.id)}
                          sx={{ color: 'primary.main' }}
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