import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from "@mui/material";
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import VisibilityIcon from '@mui/icons-material/Visibility';

export type SopVersionRow = {
  version: string;
  status: string;
  effectiveDate: string;
  updatedBy: string;
  updatedAt: string;
};

export default function VersionHistoryPanel({
  currentVersion,
  rows,
  onView,
  onCompare,
}: {
  currentVersion: string;
  rows: any[]; // Ideally link to DocumentVersion[]
  onView: (v: string) => void;
  onCompare: (v1: string, v2: string) => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={800} gutterBottom>
        Version History
      </Typography>
      <Table size="small">
        <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Version</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Changes</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 2, color: 'text.disabled' }}>
                No previous versions recorded.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r, idx) => (
              <TableRow key={r.version_number}>
                <TableCell>
                   <Chip label={r.version_number} size="small" variant={r.version_number === currentVersion ? "filled" : "outlined"} color="primary" />
                </TableCell>
                <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.change_log}
                </TableCell>
                <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                   <IconButton size="small" onClick={() => onView(r.file)}><VisibilityIcon fontSize="inherit"/></IconButton>
                   {idx < rows.length - 1 && (
                     <IconButton size="small" color="primary" onClick={() => onCompare(r.version_number, rows[idx+1].version_number)}>
                        <CompareArrowsIcon fontSize="inherit"/>
                     </IconButton>
                   )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}