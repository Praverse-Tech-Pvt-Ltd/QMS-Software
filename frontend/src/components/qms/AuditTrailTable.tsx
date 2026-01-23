import {
  Box,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import type { AuditTrailEntry, AuditActionType } from "../../types/audit.types";

const actionTypes: (AuditActionType | "All")[] = [
  "All",
  "CREATE",
  "UPDATE",
  "STATUS_CHANGE",
  "APPROVAL",
  "REJECT",
  "ATTACHMENT_ADD",
];

export default function AuditTrailTable({ rows }: { rows: AuditTrailEntry[] }) {
  const [user, setUser] = useState("All");
  const [actionType, setActionType] = useState<AuditActionType | "All">("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesUser = user === "All" ? true : r.user === user;
      const matchesAction =
        actionType === "All" ? true : r.actionType === actionType;

      const ts = new Date(r.timestamp).getTime();
      const fromOk = fromDate ? ts >= new Date(fromDate).getTime() : true;
      const toOk = toDate ? ts <= new Date(toDate).getTime() + 86400000 : true;

      return matchesUser && matchesAction && fromOk && toOk;
    });
  }, [rows, user, actionType, fromDate, toDate]);

  const userOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.user));
    return ["All", ...Array.from(set)];
  }, [rows]);

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
        Audit Trail
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" },
          gap: 1.5,
          mb: 2,
        }}
      >
        <TextField select label="User" value={user} onChange={(e) => setUser(e.target.value)}>
          {userOptions.map((u) => (
            <MenuItem key={u} value={u}>
              {u}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Action Type"
          value={actionType}
          onChange={(e) => setActionType(e.target.value as any)}
        >
          {actionTypes.map((a) => (
            <MenuItem key={a} value={a}>
              {a}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="From Date"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <TextField
          type="date"
          label="To Date"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
              <TableCell>Action</TableCell>
              <TableCell>Field</TableCell>
              <TableCell>Old Value</TableCell>
              <TableCell>New Value</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography variant="body2" sx={{ color: "text.secondary", p: 1 }}>
                    No audit trail entries found for current filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{r.actionType}</TableCell>
                  <TableCell>{r.field || "-"}</TableCell>
                  <TableCell>{r.oldValue || "-"}</TableCell>
                  <TableCell>{r.newValue || "-"}</TableCell>
                  <TableCell>{r.user}</TableCell>
                  <TableCell>{r.role}</TableCell>
                  <TableCell>{new Date(r.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{r.reason || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
        Audit trail is read-only in MVP. Backend integration will enforce immutability.
      </Typography>
    </Paper>
  );
}
