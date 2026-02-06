import { Box, Button, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface ErrorStateProps {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  subtitle = "We couldn't load the data. Please check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        px: 3,
      }}
    >
      {/* Error Icon */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 4,
          bgcolor: "#FEE2E2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 40, color: "#DC2626" }} />
      </Box>

      {/* Error Title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: "#2D3339",
          mb: 1,
        }}
      >
        {title}
      </Typography>

      {/* Error Description */}
      <Typography
        variant="body2"
        sx={{
          color: "#5C6370",
          maxWidth: 480,
          mx: "auto",
          mb: 3,
          lineHeight: 1.6,
        }}
      >
        {subtitle}
      </Typography>

      {/* Retry Button */}
      {onRetry && (
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{
            bgcolor: "#6366F1",
            "&:hover": {
              bgcolor: "#4F46E5",
            },
          }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
}