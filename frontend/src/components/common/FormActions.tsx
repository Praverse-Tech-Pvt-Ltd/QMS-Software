import { Box, Button } from "@mui/material";

export default function FormActions({
  onSaveDraft,
}: {
  onSaveDraft: () => void;
}) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
      <Button variant="outlined" type="button" onClick={onSaveDraft}>
        Save Draft
      </Button>
      <Button variant="contained" type="submit">
        Submit for Review
      </Button>
    </Box>
  );
}
