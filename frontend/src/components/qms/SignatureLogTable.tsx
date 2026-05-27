import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Chip, 
  Box 
} from "@mui/material";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

// Import Types
import type { SignatureEntry } from "../../services/workflow.service";

export default function SignatureLogTable({ rows }: { rows: SignatureEntry[] }) {
  
  if (!rows || rows.length === 0) {
    return (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 3, 
            textAlign: 'center', 
            bgcolor: '#fafafa', 
            borderRadius: 2, 
            borderStyle: 'dashed' 
          }}
        >
            <Typography variant="body2" color="text.secondary">
                No electronic signatures have been recorded for this record yet.
            </Typography>
        </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Signature History
      </Typography>
      
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Date / Time (Local)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Signed By</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Meaning</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action Taken</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Verification</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {new Date(row.timestamp).toLocaleString()}
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                      {row.user} {/* ✅ FIXED: Changed from signedBy to user */}
                  </Typography>
                </TableCell>
                
                <TableCell>{row.role}</TableCell>
                
                <TableCell>
                  <Chip 
                      label={row.meaning} 
                      size="small" 
                      variant="outlined" 
                      color={row.meaning === 'Approval' ? 'success' : 'default'}
                      sx={{ height: 24, fontWeight: 700 }}
                  />
                </TableCell>
                
                <TableCell>
                   <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                      {row.action} {/* ✅ FIXED: Standardized action display */}
                   </Typography>
                   {row.comment && (
                     <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                       "{row.comment}"
                     </Typography>
                   )}
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
                      <VerifiedUserIcon fontSize="small" />
                      <Typography variant="caption" fontWeight={700}>
                          Manifested
                      </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
        *Timestamps and manifested meanings are immutable per 21 CFR Part 11 requirements.
      </Typography>
    </Box>
  );
}