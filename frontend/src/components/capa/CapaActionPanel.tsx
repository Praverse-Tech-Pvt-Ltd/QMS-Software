import {
  Paper,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Divider,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

interface CapaAction {
  id: number;
  description: string;
  owner: string;
  due_date: string;
  status: string; // PENDING, IN_PROGRESS, DONE
}

interface CapaActionPanelProps {
  actions: CapaAction[];
  readOnly?: boolean;
  onUpdateActionStatus?: (actionId: number, newStatus: string) => void;
}

export default function CapaActionPanel({
  actions = [],
  readOnly = false,
  onUpdateActionStatus,
}: CapaActionPanelProps) {
  
  const isOverdue = (date: string, status: string) => {
    return status !== 'DONE' && new Date(date) < new Date();
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'DONE') return 'success';
    if (isOverdue(dueDate, status)) return 'error';
    if (status === 'IN_PROGRESS') return 'info';
    return 'warning';
  };

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0" }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ bgcolor: 'secondary.light', p: 1, borderRadius: 2, display: 'flex' }}>
            <FactCheckIcon color="secondary" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>
              Execution & Verification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track implementation of corrective tasks and assess final effectiveness.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* 1. ACTION PLAN TABLE */}
      <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem' }}>
        A. CORRECTIVE & PREVENTIVE ACTIONS
      </Typography>
      
      <Box sx={{ border: '1px solid #f1f5f9', borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 800, py: 2 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Assignee</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              {!readOnly && <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {actions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={readOnly ? 4 : 5} align="center" sx={{ py: 4 }}>
                  <Stack alignItems="center" spacing={1}>
                    <AssignmentTurnedInIcon sx={{ color: 'text.disabled', fontSize: 40 }} />
                    <Typography variant="body2" color="text.secondary">No action items defined for this plan.</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              actions.map((row) => {
                const overdue = isOverdue(row.due_date, row.status);
                return (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>{row.description}</TableCell>
                    <TableCell>{row.owner}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {overdue && <WarningAmberIcon sx={{ fontSize: 16, color: 'error.main' }} />}
                        <Typography variant="body2" color={overdue ? 'error.main' : 'inherit'} fontWeight={overdue ? 700 : 400}>
                          {row.due_date}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={overdue ? "OVERDUE" : row.status} 
                        size="small" 
                        color={getStatusColor(row.status, row.due_date)}
                        sx={{ fontWeight: 900, borderRadius: 1.5, fontSize: '0.65rem' }} 
                      />
                    </TableCell>
                    {!readOnly && (
                      <TableCell align="right">
                        {row.status !== 'DONE' && (
                          <Tooltip title="Mark Task as Done">
                            <IconButton 
                              size="small" 
                              color="success" 
                              onClick={() => onUpdateActionStatus?.(row.id, 'DONE')}
                            >
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>

      <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

      {/* 2. EFFECTIVENESS CHECK */}
      <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem' }}>
        B. CLOSURE & EFFECTIVENESS ASSESSMENT
      </Typography>

      {actions.some(a => a.status !== 'DONE') && !readOnly && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
          Assessment can only be finalized once all <b>{actions.length} action items</b> are verified as DONE.
        </Alert>
      )}

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <TextField
          label="Success Criteria / Verification Plan"
          placeholder="Define how effectiveness will be measured..."
          fullWidth
          multiline
          rows={2}
          disabled={readOnly}
          sx={{ gridColumn: "1 / -1" }}
        />
        <TextField
          type="date"
          label="Assessment Due Date"
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
          disabled={readOnly}
        />
        <TextField
          select
          label="Final Outcome"
          defaultValue="Pending"
          fullWidth
          size="small"
          disabled={readOnly}
        >
          <MenuItem value="Pending">Pending Verification</MenuItem>
          <MenuItem value="Effective">Effective - Documented Result</MenuItem>
          <MenuItem value="Ineffective">Ineffective - Re-open Investigation</MenuItem>
        </TextField>
        <TextField
          label="Objective Evidence Summary"
          placeholder="Document batch numbers, test results, or audit findings..."
          fullWidth
          multiline
          rows={3}
          disabled={readOnly}
          sx={{ gridColumn: "1 / -1" }}
        />
      </Box>
    </Paper>
  );
}