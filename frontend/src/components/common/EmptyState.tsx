import { Box, Button, Typography } from "@mui/material";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { keyframes } from "@mui/material";
import { transitions } from "../../theme/motion";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "minimal" | "illustrated";
}

// Floating animation for icon
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
`;

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        px: 3,
      }}
    >
      {/* Icon with animation */}
      <Box
        sx={{
          width: variant === "minimal" ? 64 : 96,
          height: variant === "minimal" ? 64 : 96,
          borderRadius: variant === "illustrated" ? "50%" : 4,
          background: variant === "illustrated" 
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : "#F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
          animation: variant === "default" ? `${float} 3s ease-in-out infinite` : "none",
          boxShadow: variant === "illustrated" 
            ? "0 10px 30px -10px rgba(102, 126, 234, 0.4)"
            : "none",
          transition: transitions.button.default,
          "&:hover": {
            transform: variant !== "default" ? "scale(1.05)" : "none",
            boxShadow: variant === "illustrated"
              ? "0 15px 35px -10px rgba(102, 126, 234, 0.5)"
              : "none",
          },
        }}
      >
        {icon || (
          <FolderOpenOutlinedIcon 
            sx={{ 
              fontSize: variant === "minimal" ? 32 : 48, 
              color: variant === "illustrated" ? "#FFFFFF" : "#858D96",
            }} 
          />
        )}
      </Box>

      {/* Title with gradient option */}
      <Typography
        variant="h6"
        sx={{
          color: variant === "illustrated" ? "transparent" : "#2D3339",
          fontWeight: 700,
          mb: 1,
          fontSize: variant === "minimal" ? "1rem" : "1.25rem",
          ...(variant === "illustrated" && {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }),
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      {description && (
        <Typography
          variant="body2"
          sx={{
            color: "#858D96",
            mb: 3,
            maxWidth: 450,
            mx: "auto",
            lineHeight: 1.6,
            fontSize: variant === "minimal" ? "0.813rem" : "0.875rem",
          }}
        >
          {description}
        </Typography>
      )}

      {/* Action Button with enhanced styling */}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={onAction}
          sx={{
            bgcolor: "#6366F1",
            px: 3,
            py: 1.2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
            transition: transitions.button.default,
            "&:hover": {
              bgcolor: "#4F46E5",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(99, 102, 241, 0.35)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
