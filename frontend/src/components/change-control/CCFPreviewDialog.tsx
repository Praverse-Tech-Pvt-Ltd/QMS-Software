import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Divider, Alert,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

interface Props {
  open: boolean;
  ccId: string;
  filledCcf: Record<string, string> | undefined;
  onConfirm: () => void;
}

function fieldLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CCFPreviewDialog({ open, ccId, filledCcf, onConfirm }: Props) {
  const entries = Object.entries(filledCcf || {});

  return (
    <Dialog open={open} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <DescriptionOutlinedIcon sx={{ color: "#667eea" }} />
        Change Control Form Preview — {ccId}
      </DialogTitle>
      <DialogContent>
        {entries.length === 0 ? (
          <Alert severity="info">
            No CCF template is configured for this change category. The record was created without a pre-filled form.
          </Alert>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
            {entries.map(([key, value], i) => (
              <Box key={key}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  {fieldLabel(key)}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{value}</Typography>
                {i < entries.length - 1 && <Divider sx={{ mt: 1.5 }} />}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={onConfirm}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          Confirm & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
