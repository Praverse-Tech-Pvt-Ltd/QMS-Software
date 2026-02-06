import { Box, CircularProgress, Skeleton, Typography } from "@mui/material";

export default function LoadingState({
  message = "Loading...",
  variant = "spinner",
}: {
  message?: string;
  variant?: "spinner" | "skeleton";
}) {
  if (variant === "skeleton") {
    return (
      <Box sx={{ width: "100%" }}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 400,
        gap: 2,
      }}
    >
      <CircularProgress size={48} thickness={3.5} sx={{ color: "#6366F1" }} />
      <Typography
        variant="body1"
        sx={{
          fontWeight: 500,
          color: "#5C6370",
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}