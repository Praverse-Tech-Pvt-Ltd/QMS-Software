import { Box, Button, CircularProgress } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { transitions, shadows, motion } from "../../theme/motion";

// ✅ 1. Define flexible props
interface FormActionsProps {
  onCancel?: () => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
  labels?: {
    cancel?: string;
    draft?: string;
    submit?: string;
  };
}

export default function FormActions({
  onCancel,
  onSaveDraft,
  isSubmitting = false,
  labels = { cancel: "Cancel", draft: "Save Draft", submit: "Submit for Review" },
}: FormActionsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        justifyContent: "flex-end",
        pt: 3,
        mt: 3,
        borderTop: "1px solid #E9ECEF",
      }}
    >
      {/* Cancel Button */}
      {onCancel && (
        <Button
          variant="text"
          size="large"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          sx={{
            px: 3,
            color: "#5C6370",
            transition: transitions.button.default,
            "&:hover": {
              bgcolor: "#F3F4F6",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
              transition: transitions.button.press,
            },
          }}
        >
          {labels.cancel}
        </Button>
      )}

      {/* Draft Button */}
      {onSaveDraft && (
        <Button
          variant="outlined"
          size="large"
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          startIcon={<SaveOutlinedIcon />}
          sx={{
            px: 3,
            borderColor: "#DFE2E6",
            color: "#2D3339",
            transition: transitions.button.default,
            "&:hover": {
              borderColor: "#858D96",
              bgcolor: "#FAFBFC",
              transform: "translateY(-1px)",
              boxShadow: shadows.subtle,
            },
            "&:active": {
              transform: "translateY(0)",
              transition: transitions.button.press,
            },
          }}
        >
          {labels.draft}
        </Button>
      )}

      {/* Submit Button */}
      <Button
        variant="contained"
        size="large"
        type="submit"
        disabled={isSubmitting}
        endIcon={
          isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SendOutlinedIcon />
          )
        }
        sx={{
          px: 3,
          bgcolor: "#6366F1",
          boxShadow: shadows.subtle,
          transition: transitions.button.default,
          "&:hover": {
            bgcolor: "#4F46E5",
            boxShadow: shadows.card,
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
            transition: transitions.button.press,
          },
          "&:disabled": {
            bgcolor: "#E9ECEF",
          },
        }}
      >
        {isSubmitting ? "Processing..." : labels.submit}
      </Button>
    </Box>
  );
}