import { 
  Table, TableHead, TableBody, TableRow, TableCell, 
  Chip, IconButton, Button, Box, Typography, Paper 
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// Mock Data
const INITIAL_ROWS = [
  { id: 1, action: "Update SOP-001", owner: "John Doe", due: "2024-03-01", status: "In Progress" },
  { id: 2, action: "Calibrate Equipment", owner: "Maintenance", due: "2024-02-20", status: "Pending" },
];

export default function ActionPlanTable({ readOnly = false, title = "Action Plan" }: { readOnly?: boolean, title?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 0, overflow: 'hidden', mb: 3 }}>
      <Box sx={{ p: 2, bgcolor: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
        {!readOnly && <Button startIcon={<AddIcon />} size="small">Add Action</Button>}
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Action Description</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Evidence</TableCell>
            {!readOnly && <TableCell align="right">Action</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {INITIAL_ROWS.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.action}</TableCell>
              <TableCell>{row.owner}</TableCell>
              <TableCell>{row.due}</TableCell>
              <TableCell>
                <Chip 
                    label={row.status} 
                    size="small" 
                    color={row.status === 'Completed' ? 'success' : 'warning'} 
                    variant="outlined"
                />
              </TableCell>
              <TableCell>
                <IconButton size="small" color="primary">
                    <UploadFileIcon fontSize="small" />
                </IconButton>
              </TableCell>
              {!readOnly && (
                <TableCell align="right">
                    <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}