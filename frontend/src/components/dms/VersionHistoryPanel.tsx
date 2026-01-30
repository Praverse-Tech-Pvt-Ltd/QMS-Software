import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Tooltip,
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
  onCompare, // ✅ New Prop
}: {
  currentVersion: string;
  rows: SopVersionRow[];
  onView: (version: string) => void;
  onCompare: (vOld: string, vNew: string) => void; // ✅ New Prop Type
}) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            SOP Version History
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Current version:{" "}
            <Chip size="small" label={currentVersion} sx={{ ml: 1 }} />
          </Typography>
        </Box>

        <Button variant="contained" disabled>
          + New Version (Coming Soon)
        </Button>
      </Box>

      <Box sx={{ mt: 2, overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
              <TableCell>Version</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Effective Date</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r, index) => (
              <TableRow key={r.version} hover>
                <TableCell sx={{ fontWeight: 800 }}>{r.version}</TableCell>
                <TableCell>
                   <Chip 
                    label={r.status} 
                    size="small" 
                    color={r.status === 'Effective' ? 'success' : 'default'} 
                    variant={r.status === 'Effective' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>{r.effectiveDate}</TableCell>
                <TableCell>{r.updatedBy}</TableCell>
                <TableCell>{r.updatedAt}</TableCell>
                <TableCell align="right">
                  {/* View Button */}
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => onView(r.version)}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* ✅ Compare Button (Only if there is a newer version to compare against) */}
                  {index > 0 && (
                     <Tooltip title={`Compare ${r.version} vs ${rows[index-1].version}`}>
                        <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => onCompare(r.version, rows[index-1].version)}
                        >
                            <CompareArrowsIcon fontSize="small" />
                        </IconButton>
                     </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}