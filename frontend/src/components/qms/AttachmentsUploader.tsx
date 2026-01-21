import { Box, Button, Paper, Typography } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

export default function AttachmentsUploader() {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        Attachments
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Upload supporting files (UI only — no backend yet)
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" startIcon={<UploadFileOutlinedIcon />}>
          Upload File
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Accepted: PDF, DOCX, JPG • Max size: placeholder
        </Typography>
      </Box>
    </Paper>
  );
}
