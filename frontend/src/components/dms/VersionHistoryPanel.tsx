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
} from "@mui/material";

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
}: {
  currentVersion: string;
  rows: SopVersionRow[];
  onView: (version: string) => void;
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
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.version} hover>
                <TableCell sx={{ fontWeight: 800 }}>{r.version}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.effectiveDate}</TableCell>
                <TableCell>{r.updatedBy}</TableCell>
                <TableCell>{r.updatedAt}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => onView(r.version)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Typography
        variant="caption"
        sx={{ color: "text.secondary", mt: 1, display: "block" }}
      >
        This is a UI-only placeholder. Version comparison and controlled copies
        will be added with backend integration.
      </Typography>
    </Paper>
  );
}
