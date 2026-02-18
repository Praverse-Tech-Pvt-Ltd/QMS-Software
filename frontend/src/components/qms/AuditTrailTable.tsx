import {
  Box, MenuItem, Paper, Table, TableBody, TableCell, TableHead,
  TableRow, TextField, Typography, Button, Stack, TableContainer, Chip
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useMemo, useState } from "react";
import type { AuditTrailEntry, AuditActionType } from "../../services/audit.service";

const actionTypes: (AuditActionType | "All")[] = [
  "All", "CREATE", "UPDATE", "STATUS_CHANGE", "APPROVAL", "REJECT", "ATTACHMENT_ADD", "FIELD_EDIT"
];

export default function AuditTrailTable({ rows }: { rows: AuditTrailEntry[] }) {
  const [user, setUser] = useState("All");
  const [actionType, setActionType] = useState<AuditActionType | "All">("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesUser = user === "All" ? true : r.user === user;
      const matchesAction = actionType === "All" ? true : r.actionType === actionType;
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

  const handleExport = () => {
    const headers = ["Timestamp,User,Role,Action,Details,Reason"];
    const csvRows = filtered.map(r => {
      let details = r.field ? `${r.field}: ${r.oldValue} -> ${r.newValue}` : "Multiple changes";
      if (r.changes) {
        details = Object.entries(r.changes)
          .map(([f, d]) => `${f}: ${d.old} -> ${d.new}`)
          .join(" | ");
      }
      return `${r.timestamp},${r.user},${r.role},${r.actionType},"${details}",${r.reason || '-'}`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...csvRows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `audit_trail_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', border: "1px solid rgba(0,0,0,0.06)", borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
            <FilterListIcon color="action" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Filters:</Typography>
          </Box>
          <TextField select label="User" size="small" value={user} onChange={(e) => setUser(e.target.value)} sx={{ minWidth: 120 }}>
            {userOptions.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
          <TextField select label="Action" size="small" value={actionType} onChange={(e) => setActionType(e.target.value as any)} sx={{ minWidth: 150 }}>
            {actionTypes.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </TextField>
          <TextField type="date" label="From" size="small" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <TextField type="date" label="To" size="small" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <Box sx={{ flexGrow: 1 }} />
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={handleExport}>Export CSV</Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Details / Changes</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No audit entries found.</TableCell></TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(r.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {/* ✅ Handles the user_details object from your JSON */}
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                      {(r as any).user_details?.username || r.user || "System"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(r as any).user_details?.role || r.role || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={r.actionType} 
                      size="small" 
                      sx={{ 
                        fontSize: '0.65rem', fontWeight: 800,
                        bgcolor: r.actionType === 'STATUS_CHANGE' ? '#e0f2fe' : '#f1f5f9',
                        color: r.actionType === 'STATUS_CHANGE' ? '#0369a1' : '#475569',
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    {r.changes ? Object.entries(r.changes).map(([field, delta]) => (
                      <Box key={field} sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, color: 'text.secondary', fontSize: '0.65rem', display: 'block' }}>
                          {field.replace('_', ' ')}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'error.light' }}>
                            {String(delta.old || 'None')}
                          </Typography>
                          <ArrowForwardIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                            {String(delta.new || 'None')}
                          </Typography>
                        </Stack>
                      </Box>
                    )) : (
                      <Typography variant="caption">{r.field ? `${r.field}: ${r.oldValue} → ${r.newValue}` : "-"}</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'text.secondary' }}>
                    {r.reason || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}