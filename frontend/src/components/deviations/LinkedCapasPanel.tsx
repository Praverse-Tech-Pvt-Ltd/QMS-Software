import { 
  Paper, Typography, Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip 
} from "@mui/material";
import AddLinkIcon from '@mui/icons-material/AddLink';
import LaunchIcon from '@mui/icons-material/Launch';
import { useNavigate } from "react-router-dom";

export default function LinkedCapasPanel({ readOnly = false }: { readOnly?: boolean }) {
  const navigate = useNavigate();

  // Mock Data
  const links = [
    { id: "CAPA-2024-009", title: "Autoclave Sensor Calibration", status: "In Progress", type: "Corrective" }
  ];

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

       {links.length > 0 ? (
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
                {links.map(row => (
                    <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{row.type}</TableCell>
                        <TableCell>
                            <Chip label={row.status} size="small" color="warning" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                             <Button 
                                size="small" 
                                endIcon={<LaunchIcon />} 
                                onClick={() => navigate(`/capa/${row.id}`)}
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