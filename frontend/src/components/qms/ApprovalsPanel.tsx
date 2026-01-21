import { Box, Paper, Typography } from "@mui/material";

export default function ApprovalsPanel() {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        Approvals
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        e-Signature placeholder • Approval workflow will be connected later.
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Example: Initiator → QA Reviewer → QA Approver
        </Typography>
      </Box>
    </Paper>
  );
}
