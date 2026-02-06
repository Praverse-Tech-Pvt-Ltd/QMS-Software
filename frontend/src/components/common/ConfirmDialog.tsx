import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Avatar,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

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
  open,
  title,
  message,
  onConfirm,
  onClose,
  confirmText = "Confirm",
  isDestructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 24,
        sx: {
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      {/* Dialog Title */}
      <DialogTitle
        sx={{
          px: 3,
          py: 3,
          bgcolor: isDestructive ? "#FEE2E2" : "#FAFBFC",
          borderBottom: `2px solid ${isDestructive ? "#DC2626" : "#E9ECEF"}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: isDestructive ? "#FCA5A5" : "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isDestructive ? (
              <WarningAmberRoundedIcon sx={{ color: "#DC2626", fontSize: 20 }} />
            ) : (
              <InfoOutlinedIcon sx={{ color: "#6366F1", fontSize: 20 }} />
            )}
          </Box>
          <Box>
            <DialogTitle
              sx={{
                p: 0,
                fontWeight: 600,
                fontSize: "1.125rem",
                color: "#2D3339",
              }}
            >
              {title}
            </DialogTitle>
          </Box>
        </Box>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        <DialogContentText
          sx={{
            color: "#5C6370",
            lineHeight: 1.6,
            fontSize: "0.875rem",
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: "#FAFBFC",
          borderTop: "1px solid #E9ECEF",
          gap: 1.5,
        }}
      >
        <Button
          variant="text"
          onClick={onClose}
          sx={{
            color: "#5C6370",
            "&:hover": {
              bgcolor: "#F3F4F6",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          color={isDestructive ? "error" : "primary"}
          autoFocus
          sx={{
            bgcolor: isDestructive ? "#DC2626" : "#6366F1",
            "&:hover": {
              bgcolor: isDestructive ? "#B91C1C" : "#4F46E5",
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}