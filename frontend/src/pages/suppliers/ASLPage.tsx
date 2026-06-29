import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Card, CardContent, CircularProgress, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, Chip, Tooltip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import VerifiedIcon from "@mui/icons-material/Verified";
import { suppliersService, type SupplierRecord } from "../../services/suppliers.service";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  qualified: { bg: "#D1FAE5", color: "#065F46" },
  conditional: { bg: "#EEF2FF", color: "#667eea" },
  pending: { bg: "#FEF3C7", color: "#92400E" },
  suspended: { bg: "#FFEDD5", color: "#9A3412" },
  disqualified: { bg: "#FEE2E2", color: "#991B1B" },
};

export default function ASLPage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    suppliersService.list({ status: "qualified" })
      .then(setSuppliers)
      .catch(() => setError("Failed to load Approved Supplier List."))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/suppliers/asl/?format=pdf",
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ASL-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
    } catch {
      setError("PDF export failed. Ensure the backend endpoint is available.");
    }
  };

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VerifiedIcon sx={{ color: "#10B981", fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>Approved Supplier List</Typography>
            <Chip label="CURRENT" size="small" sx={{ bgcolor: "#D1FAE5", color: "#065F46", fontWeight: 700 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Effective Date: {today} · Showing currently qualified suppliers only
          </Typography>
        </Box>
        <Tooltip title="Export as PDF">
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
            Export PDF
          </Button>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>
          ) : suppliers.length === 0 ? (
            <Box sx={{ p: 4 }}><Alert severity="info">No qualified suppliers found.</Alert></Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Supplier Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Supplier Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Expiry Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map((s) => {
                  const sc = STATUS_COLORS[s.status] || { bg: "#F3F4F6", color: "#374151" };
                  return (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#667eea">{s.supplier_code}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{s.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>{s.category}</Typography>
                      </TableCell>
                      <TableCell>{s.country || "—"}</TableCell>
                      <TableCell>
                        <Chip label={s.status} size="small"
                          sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, textTransform: "capitalize" }} />
                      </TableCell>
                      <TableCell>
                        {s.expiry_status ? (
                          <Chip label={s.expiry_status.replace(/_/g, " ")} size="small"
                            sx={{
                              bgcolor: s.expiry_status === "valid" ? "#D1FAE5"
                                : s.expiry_status === "expiring_soon" ? "#FEF3C7"
                                : "#FEE2E2",
                              color: s.expiry_status === "valid" ? "#065F46"
                                : s.expiry_status === "expiring_soon" ? "#92400E"
                                : "#991B1B",
                              textTransform: "capitalize",
                            }} />
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
        This document is controlled. Printed copies are uncontrolled. Verify current version before use.
      </Typography>
    </Box>
  );
}
