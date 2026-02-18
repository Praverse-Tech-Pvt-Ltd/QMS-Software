import { 
  Paper, Typography, Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip 
} from "@mui/material";
import AddLinkIcon from '@mui/icons-material/AddLink';
import LaunchIcon from '@mui/icons-material/Launch';
import { useNavigate } from "react-router-dom";

// Define the shape based on your CAPA Service interface
interface LinkedCapa {
  id: number;          // Numeric Database PK
  capa_id: string;      // Formatted ID: CAPA-2026-001
  title: string;
  status: string;
  action_type: string;
}

export default function LinkedCapasPanel({ 
  capas = [], 
  readOnly = false,
  onInitiate, // ✅ Added prop to trigger the initiation logic in parent
}: { 
  capas?: LinkedCapa[], 
  readOnly?: boolean,
  onInitiate?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mt: 3, 
        borderRadius: 4, 
        border: "1px solid #e2e8f0",
        bgcolor: "#ffffff" 
      }}
    >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
           <Box>
             <Typography variant="h6" fontWeight={800}>Linked Corrective Actions</Typography>
             <Typography variant="caption" color="text.secondary">
               CAPAs spawned from this investigation to prevent recurrence
             </Typography>
           </Box>
           {!readOnly && (
               <Button 
                startIcon={<AddLinkIcon />} 
                variant="contained" 
                size="small" 
                onClick={onInitiate}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
               >
                 Initiate CAPA
               </Button>
           )}
        </Box>

        {capas.length > 0 ? (
          <Box sx={{ mt: 2, overflowX: 'auto' }}>
            <Table size="small">
               <TableHead>
                   <TableRow sx={{ bgcolor: '#f8fafc' }}>
                       <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem' }}>CAPA ID</TableCell>
                       <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem' }}>TITLE</TableCell>
                       <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem' }}>TYPE</TableCell>
                       <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem' }}>STATUS</TableCell>
                       <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.75rem' }}>ACTION</TableCell>
                   </TableRow>
               </TableHead>
               <TableBody>
                   {capas.map(row => (
                       <TableRow key={row.id} hover>
                           <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                             {row.capa_id}
                           </TableCell>
                           <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                             {row.title}
                           </TableCell>
                           <TableCell>
                             <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                               {row.action_type}
                             </Typography>
                           </TableCell>
                           <TableCell>
                               <Chip 
                                 label={row.status} 
                                 size="small" 
                                 sx={{ 
                                   fontWeight: 800, 
                                   fontSize: '0.65rem',
                                   bgcolor: row.status === 'VERIFIED' || row.status === 'CLOSED' ? '#dcfce7' : '#fef9c3',
                                   color: row.status === 'VERIFIED' || row.status === 'CLOSED' ? '#15803d' : '#854d0e',
                                   border: 'none'
                                 }}
                               />
                           </TableCell>
                           <TableCell align="right">
                                <Button 
                                   size="small" 
                                   variant="text"
                                   endIcon={<LaunchIcon sx={{ fontSize: '1rem !important' }} />} 
                                   // ✅ Use numeric ID for the route path to match getById expectations
                                   onClick={() => navigate(`/capa/${row.capa_id}`)}
                                   sx={{ fontWeight: 700, textTransform: 'none' }}
                                >
                                   View Detail
                                </Button>
                           </TableCell>
                       </TableRow>
                   ))}
               </TableBody>
            </Table>
          </Box>
        ) : (
            <Box sx={{ 
              py: 4, 
              textAlign: 'center', 
              bgcolor: '#f8fafc', 
              borderRadius: 3, 
              border: '1px dashed #e2e8f0',
              mt: 2
            }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    No CAPAs have been initiated for this deviation yet.
                </Typography>
            </Box>
        )}
    </Paper>
  );
}