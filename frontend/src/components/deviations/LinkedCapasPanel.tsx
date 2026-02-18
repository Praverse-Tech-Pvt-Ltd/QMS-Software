import { 
  Paper, Typography, Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip 
} from "@mui/material";
import AddLinkIcon from '@mui/icons-material/AddLink';
import LaunchIcon from '@mui/icons-material/Launch';
import { useNavigate } from "react-router-dom";

// Define the shape based on your JSON
interface LinkedCapa {
  id: number;
  capa_id: string;
  title: string;
  status: string;
  action_type: string;
}

export default function LinkedCapasPanel({ 
  capas = [], 
  readOnly = false 
}: { 
  capas?: LinkedCapa[], 
  readOnly?: boolean 
}) {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>Linked CAPAs</Typography>
          {!readOnly && (
              <Button startIcon={<AddLinkIcon />} variant="outlined" size="small">
                Link / Create CAPA
              </Button>
          )}
       </Box>

       {capas.length > 0 ? (
         <Table size="small">
            <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <TableCell sx={{ fontWeight: 800 }}>CAPA ID</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {capas.map(row => (
                    <TableRow key={row.id}>
                        {/* ✅ Use capa_id from your JSON */}
                        <TableCell sx={{ fontWeight: 600 }}>{row.capa_id}</TableCell>
                        <TableCell>{row.title}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {row.action_type.toLowerCase()}
                        </TableCell>
                        <TableCell>
                            <Chip 
                              label={row.status} 
                              size="small" 
                              color={row.status === 'VERIFIED' ? 'success' : 'warning'} 
                              variant="outlined" 
                              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                            />
                        </TableCell>
                        <TableCell align="right">
                             <Button 
                                size="small" 
                                endIcon={<LaunchIcon />} 
                                // ✅ Navigate using the business ID
                                onClick={() => navigate(`/capa/${row.capa_id}`)}
                             >
                                Open
                             </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
         </Table>
       ) : (
           <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
               No CAPAs linked to this deviation.
           </Typography>
       )}
    </Paper>
  );
}