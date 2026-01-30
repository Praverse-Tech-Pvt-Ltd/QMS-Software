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
  Button,
  Stack,
  TableContainer
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
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

  // ✅ Export Logic
  const handleExport = () => {
    const headers = ["Timestamp,User,Role,Action,Field,Old Value,New Value,Reason"];
    const csvRows = filtered.map(r => 
      `${r.timestamp},${r.user},${r.role},${r.actionType},${r.field || '-'},"${r.oldValue || '-'}","${r.newValue || '-'}",${r.reason || '-'}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_trail_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
       {/* Toolbar */}
       <Paper 
         sx={{ 
           p: 2, 
           mb: 2, 
           display: 'flex', 
           flexWrap: 'wrap', 
           gap: 2, 
           alignItems: 'center', 
           justifyContent: 'space-between',
           border: "1px solid rgba(0,0,0,0.06)",
           borderRadius: 2
         }}
       >
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
            
            <Button 
                startIcon={<DownloadIcon />} 
                variant="outlined" 
                onClick={handleExport}
                sx={{ whiteSpace: 'nowrap' }}
            >
                Export CSV
            </Button>
          </Stack>
       </Paper>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Field Change</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">No audit entries match these filters.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {new Date(r.timestamp).toLocaleString()}
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{r.user}</Typography>
                    <Typography variant="caption" color="text.secondary">{r.role}</Typography>
                  </TableCell>
                  
                  <TableCell>
                     <Typography 
                        variant="caption" 
                        sx={{ 
                            bgcolor: r.actionType === 'STATUS_CHANGE' ? 'primary.50' : 'grey.100',
                            color: r.actionType === 'STATUS_CHANGE' ? 'primary.main' : 'text.primary',
                            px: 1, py: 0.5, borderRadius: 1, fontWeight: 700 
                        }}
                    >
                        {r.actionType}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {r.field ? (
                       <Box>
                         <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.7rem' }}>
                            {r.field}
                         </Typography>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'error.main' }}>
                                {String(r.oldValue)}
                            </Typography>
                            <span>→</span>
                            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                                {String(r.newValue)}
                            </Typography>
                         </Box>
                       </Box>
                    ) : (
                       <Typography variant="caption" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  
                  <TableCell sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    {r.reason || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
         *Timestamps are immutable. Export generated at {new Date().toLocaleTimeString()}.
      </Typography>
    </Box>
  );
}