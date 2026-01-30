import { Box, Typography } from "@mui/material";
import VerifiedIcon from '@mui/icons-material/Verified';

interface SignatureStampProps {
  isSigned: boolean;
  signedBy?: string;
  date?: string;
}

export default function SignatureStamp({ isSigned, signedBy, date }: SignatureStampProps) {
  if (!isSigned) return null;

  return (
    <Box
      sx={{
        border: "2px solid",
        borderColor: "success.main",
        borderRadius: 2,
        p: 1,
        px: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        bgcolor: "success.50",
        color: "success.dark",
      }}
    >
      <VerifiedIcon fontSize="large" />
      <Box>
        <Typography variant="caption" sx={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, display: "block", lineHeight: 1 }}>
          Digitally Signed
        </Typography>
        <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
          By: <b>{signedBy || "Unknown"}</b>
        </Typography>
        <Typography variant="caption" sx={{ display: "block" }}>
          Date: {date || "N/A"}
        </Typography>
      </Box>
    </Box>
  );
}