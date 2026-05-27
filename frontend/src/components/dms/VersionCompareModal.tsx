import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
} from "@mui/material";
import DifferenceIcon from "@mui/icons-material/Difference";

interface VersionCompareModalProps {
  open: boolean;
  onClose: () => void;
  oldVersion: string;
  newVersion: string;
}

export default function VersionCompareModal({
  open,
  onClose,
  oldVersion,
  newVersion,
}: VersionCompareModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid #eee",
        }}
      >
        <DifferenceIcon color="primary" />
        Compare Versions: {oldVersion} vs {newVersion}
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: "60vh" }}>
        <Grid container sx={{ height: "100%" }}>
          {/* Left: Old Version */}
          <Grid
            size={{ xs: 6 }}
            sx={{ borderRight: "1px solid #eee", p: 3, bgcolor: "#fff5f5" }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Chip label={`Version ${oldVersion}`} size="small" />
              <Typography variant="caption" color="error.main" fontWeight={700}>
                - Removed
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
            >
              1.0 PURPOSE
              <br />
              The purpose of this procedure is to define the{" "}
              <span
                style={{
                  backgroundColor: "#ffcccc",
                  textDecoration: "line-through",
                }}
              >
                basic cleaning
              </span>{" "}
              requirements for Zone A.
              <br />
              <br />
              2.0 SCOPE
              <br />
              This applies to{" "}
              <span
                style={{
                  backgroundColor: "#ffcccc",
                  textDecoration: "line-through",
                }}
              >
                all packaging staff
              </span>
              .
            </Typography>
          </Grid>

          {/* Right: New Version */}
          <Grid size={{ xs: 6 }} sx={{ p: 3, bgcolor: "#f0fff4" }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Chip
                label={`Version ${newVersion}`}
                size="small"
                color="primary"
              />
              <Typography
                variant="caption"
                color="success.main"
                fontWeight={700}
              >
                + Added
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
            >
              1.0 PURPOSE
              <br />
              The purpose of this procedure is to define the{" "}
              <span style={{ backgroundColor: "#ccffcc" }}>
                enhanced sterilization and cleaning
              </span>{" "}
              requirements for Zone A.
              <br />
              <br />
              2.0 SCOPE
              <br />
              This applies to{" "}
              <span style={{ backgroundColor: "#ccffcc" }}>
                all manufacturing and packaging personnel
              </span>
              .
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close Comparison</Button>
      </DialogActions>
    </Dialog>
  );
}
