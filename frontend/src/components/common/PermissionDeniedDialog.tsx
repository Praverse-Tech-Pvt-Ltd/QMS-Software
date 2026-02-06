import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Backdrop,
} from "@mui/material";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import ShieldIcon from "@mui/icons-material/Shield";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

interface PermissionDeniedDialogProps {
  open: boolean;
  onClose: () => void;
  message: string;
  title?: string;
}

export default function PermissionDeniedDialog({
  open,
  onClose,
  message,
  title = "Access Denied",
}: PermissionDeniedDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      BackdropComponent={Backdrop}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "visible",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          position: "relative",
        },
      }}
      TransitionProps={{
        timeout: 400,
      }}
    >
      {/* Animated Background Icons */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          pointerEvents: "none",
          opacity: 0.04,
        }}
      >
        <ShieldIcon
          sx={{
            position: "absolute",
            fontSize: 200,
            top: -50,
            right: -50,
            transform: "rotate(15deg)",
          }}
        />
        <VerifiedUserIcon
          sx={{
            position: "absolute",
            fontSize: 150,
            bottom: -30,
            left: -30,
            transform: "rotate(-15deg)",
          }}
        />
      </Box>

      {/* Icon Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          pt: 5,
          pb: 2,
          position: "relative",
        }}
      >
        {/* Outer glow ring */}
        <Box
          sx={{
            position: "absolute",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0) 70%)",
            animation: `ripple 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
            "@keyframes ripple": {
              "0%": {
                transform: "scale(0.8)",
                opacity: 1,
              },
              "100%": {
                transform: "scale(1.3)",
                opacity: 0,
              },
            },
          }}
        />
        
        {/* Main icon container */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: "0 10px 25px rgba(239, 68, 68, 0.25)",
            animation: `float 3s ease-in-out infinite`,
            border: "4px solid white",
            "@keyframes float": {
              "0%, 100%": {
                transform: "translateY(0px)",
              },
              "50%": {
                transform: "translateY(-10px)",
              },
            },
          }}
        >
          <LockPersonIcon
            sx={{
              fontSize: 56,
              color: "#dc2626",
              animation: `shake 0.5s ease-in-out`,
              "@keyframes shake": {
                "0%, 100%": { transform: "rotate(0deg)" },
                "25%": { transform: "rotate(-10deg)" },
                "75%": { transform: "rotate(10deg)" },
              },
            }}
          />
        </Box>
      </Box>

      {/* Title with gradient */}
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 900,
          fontSize: "1.75rem",
          background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          pb: 1,
          pt: 2,
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ textAlign: "center", pb: 3, px: 4 }}>
        <Typography
          variant="body1"
          sx={{
            color: "#475569",
            lineHeight: 1.7,
            fontSize: "1rem",
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
        
        {/* Info box */}
        <Box
          sx={{
            mt: 3,
            p: 2.5,
            borderRadius: 3,
            bgcolor: "#f1f5f9",
            border: "2px dashed #cbd5e1",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              fontSize: "0.875rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <ShieldIcon sx={{ fontSize: 18 }} />
            Need access? Contact your administrator
          </Typography>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          justifyContent: "center",
          pb: 5,
          px: 4,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            color: "white",
            fontWeight: 700,
            textTransform: "none",
            px: 5,
            py: 1.5,
            borderRadius: 3,
            fontSize: "1rem",
            boxShadow: "0 10px 25px rgba(220, 38, 38, 0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 15px 30px rgba(220, 38, 38, 0.4)",
            },
            "&:active": {
              transform: "translateY(0px)",
            },
          }}
        >
          I Understand
        </Button>
      </DialogActions>
    </Dialog>
  );
}
