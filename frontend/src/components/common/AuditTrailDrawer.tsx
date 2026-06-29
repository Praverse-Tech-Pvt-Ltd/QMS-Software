import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import { useState } from "react";
import api from "../../services/api";

export interface AuditEntry {
  action: string;
  user: string;
  timestamp: string;
  reason?: string;
  changes?: Record<string, { old: string; new: string }>;
}

interface AuditTrailDrawerProps {
  open: boolean;
  onClose: () => void;
  entries: AuditEntry[];
  title?: string;
  /** Django app_label used to filter the export, e.g. "audits", "quality" */
  module?: string;
  /** Record ID to filter the export to a single record */
  recordId?: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "#10B981",
  UPDATE: "#667eea",
  APPROVE: "#10B981",
  REJECT: "#EF4444",
  DELETE: "#EF4444",
  LOGIN: "#9CA3AF",
  LOGOUT: "#9CA3AF",
};

export default function AuditTrailDrawer({
  open,
  onClose,
  entries,
  title = "Audit Trail",
  module,
  recordId,
}: AuditTrailDrawerProps) {
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const handleExport = async (format: "pdf" | "excel") => {
    setExporting(format);
    try {
      const params: Record<string, string> = { format };
      if (module) params.module = module;
      if (recordId) params.record_id = recordId;
      const response = await api.get("/audit-trail/", { params, responseType: "blob" });
      const blob = new Blob([response.data], {
        type: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_trail.${format === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Export failures are non-blocking — the drawer remains usable
    } finally {
      setExporting(null);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 480 }, borderRadius: "12px 0 0 12px" } }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: "#FAFBFC",
            borderBottom: "1px solid #E9ECEF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <HistoryIcon sx={{ color: "#667eea" }} />
            <Typography variant="h6" fontWeight={700} fontSize="1rem">
              {title}
            </Typography>
            <Chip label={`${entries.length} entries`} size="small" sx={{ height: 20, fontSize: "0.68rem" }} />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Stack direction="row" spacing={1} sx={{ px: 3, py: 1.5, borderBottom: "1px solid #E9ECEF" }}>
          <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon fontSize="small" />}
            disabled={exporting !== null} onClick={() => handleExport("pdf")}>
            {exporting === "pdf" ? "Exporting..." : "Export PDF"}
          </Button>
          <Button size="small" variant="outlined" startIcon={<TableChartIcon fontSize="small" />}
            disabled={exporting !== null} onClick={() => handleExport("excel")}>
            {exporting === "excel" ? "Exporting..." : "Export Excel"}
          </Button>
        </Stack>

        {/* Entries */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          {entries.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
              No audit trail entries yet.
            </Typography>
          ) : (
            <Box>
              {entries.map((entry, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: ACTION_COLORS[entry.action] || "#667eea",
                        mt: 0.8,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={entry.action}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.65rem",
                            bgcolor: `${ACTION_COLORS[entry.action]}20` || "#EEF2FF",
                            color: ACTION_COLORS[entry.action] || "#667eea",
                            fontWeight: 700,
                          }}
                        />
                        <Typography variant="caption" fontWeight={600}>
                          {entry.user}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(entry.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                      {entry.reason && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.5, fontStyle: "italic" }}
                        >
                          {entry.reason}
                        </Typography>
                      )}
                      {entry.changes && Object.keys(entry.changes).length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          {Object.entries(entry.changes).map(([field, change]) => (
                            <Box key={field} sx={{ display: "flex", gap: 0.5, alignItems: "center", mt: 0.25 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
                                {field}:
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  textDecoration: "line-through",
                                  color: "#9CA3AF",
                                  bgcolor: "#FEE2E2",
                                  px: 0.5,
                                  borderRadius: 0.5,
                                }}
                              >
                                {String(change.old)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">→</Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#065F46",
                                  bgcolor: "#D1FAE5",
                                  px: 0.5,
                                  borderRadius: 0.5,
                                }}
                              >
                                {String(change.new)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {index < entries.length - 1 && (
                    <Box sx={{ ml: 2.5, borderLeft: "1px dashed #E9ECEF", height: 12 }} />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
