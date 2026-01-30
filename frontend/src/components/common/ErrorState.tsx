import { Box, Button, Typography } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorStateProps {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = "Something went wrong", 
  subtitle = "We couldn't load the data. Please check your connection.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2, opacity: 0.8 }} />
      <Typography variant="h6" fontWeight={800} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
        {subtitle}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="primary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
}