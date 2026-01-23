import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";
import type { SignatureEntry } from "../../types/workflow.types";

export default function SignatureLogTable({
  rows,
}: {
  rows: SignatureEntry[];
}) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
        Signature Log
      </Typography>

      {rows.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No signatures recorded yet.
        </Typography>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                <TableCell>Meaning</TableCell>
                <TableCell>Status Before</TableCell>
                <TableCell>Status After</TableCell>
                <TableCell>Signed By</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.meaning}</TableCell>
                  <TableCell>{r.statusBefore}</TableCell>
                  <TableCell>{r.statusAfter}</TableCell>
                  <TableCell>{r.signedBy}</TableCell>
                  <TableCell>{r.role}</TableCell>
                  <TableCell>
                    {new Date(r.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
        Note: This is a UI-only placeholder for 21 CFR Part 11 compliant e-sign logs.
      </Typography>
    </Paper>
  );
}
