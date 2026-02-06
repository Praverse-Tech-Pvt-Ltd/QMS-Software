import { Box, Button, Typography } from "@mui/material";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        px: 3,
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 4,
          bgcolor: "#F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        {icon || <FolderOpenOutlinedIcon sx={{ fontSize: 40, color: "#858D96" }} />}
      </Box>

      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          color: "#2D3339",
          fontWeight: 600,
          mb: 1,
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
            maxWidth: 400,
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={onAction}
          sx={{
            bgcolor: "#6366F1",
            "&:hover": {
              bgcolor: "#4F46E5",
            },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
