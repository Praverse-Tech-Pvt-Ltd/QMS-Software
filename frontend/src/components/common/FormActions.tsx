import { Box, Button, CircularProgress } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

// ✅ 1. Define flexible props
interface FormActionsProps {
  onSaveDraft: () => void;
  isSubmitting?: boolean;
  labels?: {
    draft?: string;
    submit?: string;
  };
}

export default function FormActions({
  onSaveDraft,
  isSubmitting = false,
  labels = { draft: "Save Draft", submit: "Submit for Review" },
}: FormActionsProps) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", mt: 2 }}>
      {/* Draft Button */}
      <Button
        variant="outlined"
        type="button"
        onClick={onSaveDraft}
        disabled={isSubmitting} // Disable during submit
        startIcon={<SaveOutlinedIcon />}
      >
        {labels.draft}
      </Button>

      {/* Submit Button */}
      <Button
        variant="contained"
        type="submit"
        disabled={isSubmitting} // Disable to prevent double-click
        endIcon={
          isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SendOutlinedIcon />
          )
        }
      >
        {isSubmitting ? "Processing..." : labels.submit}
      </Button>
    </Box>
  );
}