import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  InputAdornment,
  Alert,
  CircularProgress,
  Stack,
  Paper,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

import PermissionDeniedDialog from "../../components/common/PermissionDeniedDialog";
import ModuleTable, {
  type ColumnDef,
} from "../../components/common/ModuleTable";
import {
  changeService,
  type ChangeRecord,
} from "../../services/change.service";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

const STATUS_FILTERS = ["All", "Draft", "Review", "Approved", "Closed"];

export default function ChangeControlListPage() {
  const navigate = useNavigate();
  const { role } = useRole();

  const [rows, setRows] = useState<ChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [permissionDenied, setPermissionDenied] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await changeService.list();
      setRows(data);
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const canCreate = role ? permissionService.can(role, "change", "create") : false;

    if (!canCreate) {
      setPermissionDenied({
        open: true,
        message: `You don't have permission to initiate change control. Role: ${role || "Unknown"}`,
      });
      return;
    }
    navigate("/change-control/new");
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const changeId = String(r.cc_id || r.id || "");
      const searchString = searchTerm.toLowerCase();

      const matchesSearch =
        r.title.toLowerCase().includes(searchString) ||
        changeId.toLowerCase().includes(searchString);

      let matchesStatus = true;
      if (statusFilter !== "All") {
        const currentStatus = String(r.status).toUpperCase();
        const targetFilter = statusFilter.toUpperCase();

        if (targetFilter === "REVIEW") {
          matchesStatus = currentStatus === "EVALUATION" || currentStatus === "APPROVAL";
        } else {
          matchesStatus = currentStatus === targetFilter;
        }
      }
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  const columns: ColumnDef<ChangeRecord>[] = [
    {
      field: "cc_id",
      headerName: "CHANGE ID",
      width: 140,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{
            color: "#4f46e5",
            fontWeight: 800,
            cursor: "pointer",
            fontSize: "0.85rem",
            "&:hover": { textDecoration: "underline" }
          }}
          // ✅ Standardized Navigation: Use Business ID (cc_id)
          onClick={() => navigate(`/change-control/${row.cc_id || row.id}`)}
        >
          {row.cc_id || row.id}
        </Typography>
      ),
    },
    { field: "title", headerName: "TITLE", width: "30%" },
    { 
        field: "department", 
        headerName: "DEPARTMENT",
        renderCell: (row) => (
            <Typography variant="body2" sx={{ fontWeight: 500, color: "#475569" }}>
                {row.department}
            </Typography>
        )
    },
    {
      field: "change_type",
      headerName: "TYPE",
      renderCell: (row) => (
        <Chip
          label={row.change_type}
          size="small"
          sx={{
            bgcolor: row.change_type === 'EMERGENCY' ? '#fee2e2' : '#f1f5f9',
            color: row.change_type === 'EMERGENCY' ? '#991b1b' : '#475569',
            fontWeight: 700,
            fontSize: "0.7rem",
            borderRadius: 1,
          }}
        />
      ),
    },
    { 
        field: "status", 
        headerName: "STATUS",
        renderCell: (row) => (
            <Chip 
                label={row.status} 
                size="small" 
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.65rem', borderRadius: 1.5 }}
            />
        )
    },
    {
      field: "target_date",
      headerName: "TARGET DATE",
      renderCell: (row) => row.target_date || "-",
    },
  ];

  if (loading) return <Box sx={{ p: 10, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 5 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Page Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Change Control Management
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "#64748b", fontWeight: 500 }}>
            Formalized lifecycle management for GxP-critical modifications
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{
            bgcolor: "#4f46e5",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2.5,
            px: 3,
            py: 1,
            boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
            "&:hover": { bgcolor: "#4338ca" }
          }}
        >
          Initiate CC
        </Button>
      </Stack>

      {/* Filters Area */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 4,
          mb: 4,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}
      >
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            placeholder="Search by ID or Title..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#fcfcfc",
                borderRadius: 3,
              },
            }}
          />

          <Stack direction="row" spacing={1.5} alignItems="center">
            <FilterListIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#475569", textTransform: 'uppercase' }}>
              Filter Status:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {STATUS_FILTERS.map((status) => (
                <Chip
                  key={status}
                  label={status}
                  onClick={() => setStatusFilter(status)}
                  sx={{
                    borderRadius: 2,
                    height: 28,
                    bgcolor: statusFilter === status ? "#0f172a" : "#fff",
                    color: statusFilter === status ? "#fff" : "#64748b",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    border: "1px solid",
                    borderColor: statusFilter === status ? "#0f172a" : "#e2e8f0",
                    "&:hover": { bgcolor: statusFilter === status ? "#0f172a" : "#f1f5f9" }
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Main Table */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #e2e8f0", overflow: 'hidden' }}>
        <ModuleTable
          columns={columns}
          rows={filteredRows}
          onView={(id) => {
            // ✅ FIX: Match the row by ID but navigate using its cc_id
            const record = rows.find((r) => String(r.id) === String(id));
            navigate(`/change-control/${record?.cc_id || id}`);
          }}
        />
      </Paper>

      <PermissionDeniedDialog
        open={permissionDenied.open}
        onClose={() => setPermissionDenied({ open: false, message: "" })}
        message={permissionDenied.message}
      />
    </Box>
  );
}