import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, opacity: 0.7 }}>
      <CircularProgress size={40} thickness={4} />
      <Typography variant="body2" sx={{ mt: 2, fontWeight: 600, color: 'text.secondary' }}>
        {message}
      </Typography>
    </Box>
  );
}