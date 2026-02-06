import { 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography 
} from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';

interface ControlledCopyPrintModalProps {
  open: boolean;
  onClose: () => void;
  docTitle: string;
  docId: string;
  version: string;
}

export default function ControlledCopyPrintModal({
  open,
  onClose,
  docTitle,
  docId,
  version
}: ControlledCopyPrintModalProps) {

  const handlePrint = () => {
    window.print(); // Triggers browser print (which would ideally capture this view)
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
         <Box 
            sx={{ 
                p: 5, 
                border: '4px solid #000', 
                minHeight: '400px', 
                position: 'relative',
                overflow: 'hidden'
            }}
         >
            {/* WATERMARK */}
            <Typography
                variant="h1"
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                    opacity: 0.1,
                    color: 'red',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    fontSize: '4rem',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            >
                CONTROLLED COPY
            </Typography>

            {/* HEADER */}
            <Box sx={{ borderBottom: '2px solid #000', mb: 3, pb: 2, display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>{docTitle}</Typography>
                    <Typography variant="subtitle1">{docId} | Version {version}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" display="block">Print Date: {new Date().toLocaleDateString()}</Typography>
                    <Typography variant="caption" display="block">Issued To: Current User</Typography>
                    <Box sx={{ border: '1px solid red', color: 'red', px: 1, mt: 1, fontWeight: 700, fontSize: '0.7rem' }}>
                        EXPIRES IN 24 HOURS
                    </Box>
                </Box>
            </Box>

            {/* CONTENT PLACEHOLDER */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography paragraph>
                    1.0 PURPOSE<br/>
                    [Document content would be rendered here for printing...]
                </Typography>
                <Typography paragraph>
                    2.0 SCOPE<br/>
                    [More content...]
                </Typography>
                <Typography paragraph>
                     WARNING: This document is valid only if the "CONTROLLED COPY" watermark is present in red ink.
                </Typography>
            </Box>
         </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handlePrint} variant="contained" startIcon={<PrintIcon />}>
            Print Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}