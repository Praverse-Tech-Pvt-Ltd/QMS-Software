import { 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button 
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  isDestructive?: boolean;
}

export default function ConfirmDialog({ 
  open, title, message, onConfirm, onClose, 
  confirmText = "Confirm", isDestructive = false 
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          onClick={() => { onConfirm(); onClose(); }} 
          variant="contained" 
          color={isDestructive ? "error" : "primary"}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}