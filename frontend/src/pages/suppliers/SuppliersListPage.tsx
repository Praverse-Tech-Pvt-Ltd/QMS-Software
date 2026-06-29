import { Box, Button, Typography, Chip, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { suppliersService, type SupplierRecord } from "../../services/suppliers.service";

const EXPIRY_COLORS: Record<string, { bg: string; color: string }> = {
  valid: { bg: "#D1FAE5", color: "#065F46" },
  expiring_soon: { bg: "#FEF3C7", color: "#92400E" },
  expired: { bg: "#FEE2E2", color: "#991B1B" },
  not_qualified: { bg: "#F3F4F6", color: "#374151" },
};

const COLUMNS: ColumnDef<SupplierRecord>[] = [
  { field: "supplier_code", headerName: "Code", width: 120 },
  { field: "name", headerName: "Supplier Name", width: 240 },
  { field: "category", headerName: "Category", width: 140 },
  { field: "country", headerName: "Country", width: 110 },
  {
    field: "expiry_status",
    headerName: "Qualification",
    width: 150,
    renderCell: (row) => {
      const style = EXPIRY_COLORS[row.expiry_status || "not_qualified"];
      return (
        <Chip label={row.expiry_status?.replace(/_/g, " ") || "N/A"} size="small"
          sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, textTransform: "capitalize" }} />
      );
    },
  },
  { field: "qualification_expiry", headerName: "Expiry", width: 120 },
];

export default function SuppliersListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<SupplierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    suppliersService.list()
      .then(setRows)
      .catch(() => setError("Failed to load suppliers."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Supplier Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/suppliers/new")}
          sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}>
          Add Supplier
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <ModuleTable columns={COLUMNS} rows={rows} onView={(id) => navigate(`/suppliers/${id}`)} />
      )}
    </Box>
  );
}
