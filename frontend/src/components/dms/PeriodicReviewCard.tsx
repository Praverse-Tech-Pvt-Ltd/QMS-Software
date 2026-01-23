import { Box, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function PeriodicReviewCard() {
  const [frequency, setFrequency] = useState("12");
  const [nextReviewDate, setNextReviewDate] = useState("");
  const [reviewer, setReviewer] = useState("QA Manager");

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900 }}>
        Periodic Review
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
        Schedule SOP periodic review and assign QA reviewer.
      </Typography>

      <Box sx={{ display: "grid", gap: 2, mt: 2 }}>
        <TextField
          select
          label="Review Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <MenuItem value="6">Every 6 months</MenuItem>
          <MenuItem value="12">Every 12 months</MenuItem>
          <MenuItem value="24">Every 24 months</MenuItem>
        </TextField>

        <TextField
          type="date"
          label="Next Review Date"
          InputLabelProps={{ shrink: true }}
          value={nextReviewDate}
          onChange={(e) => setNextReviewDate(e.target.value)}
        />

        <TextField
          select
          label="Assigned Reviewer"
          value={reviewer}
          onChange={(e) => setReviewer(e.target.value)}
        >
          <MenuItem value="QA Manager">QA Manager</MenuItem>
          <MenuItem value="QA Lead">QA Lead</MenuItem>
          <MenuItem value="Document Controller">Document Controller</MenuItem>
        </TextField>
      </Box>

      <Typography
        variant="caption"
        sx={{ color: "text.secondary", mt: 2, display: "block" }}
      >
        Reminder notifications will be enabled after backend integration.
      </Typography>
    </Paper>
  );
}
