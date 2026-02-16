import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

// Standard Imports
import PermissionDeniedDialog from "../../components/common/PermissionDeniedDialog";
import ModuleTable, {
  type ColumnDef,
} from "../../components/common/ModuleTable";
import { capaService, type CapaRecord } from "../../services/capa.service";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// Adjusted Filter Options to match available Backend Statuses
const STATUS_FILTERS = ["All", "Open", "In Progress", "Verification", "Closed"];

export default function CapaListPage() {
  const navigate = useNavigate();
  const { role } = useRole();

  // State
  const [rows, setRows] = useState<CapaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [permissionDenied, setPermissionDenied] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await capaService.list();
      setRows(data);
    } catch (err) {
      console.error("Failed to load CAPA records", err);
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const canCreate = role
      ? permissionService.can(role, "capa", "create")
      : false;

    if (!canCreate) {
      setPermissionDenied({
        open: true,
        message: `You don't have permission to create CAPA records. Role: ${role || "Unknown"}`,
      });
      return;
    }
    navigate("/capa/new");
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const searchString = searchTerm.toLowerCase();
      const matchesSearch =
        r.title.toLowerCase().includes(searchString) ||
        String(r.capa_id || "")
          .toLowerCase()
          .includes(searchString);

      let matchesStatus = true;

      if (statusFilter !== "All") {
        // Map "Friendly" UI names to valid 'CapaRecord' statuses
        const currentStatus = String((r as any).status).toUpperCase();
        const targetStatus =
          statusFilter === "Open"
            ? "PLANNING"
            : statusFilter.toUpperCase().replace(" ", "_");
        matchesStatus = currentStatus.includes(targetStatus);
        if (statusFilter === "Open") {
          matchesStatus = r.status === "PLANNING";
        } else if (statusFilter === "In Progress") {
          matchesStatus =
            r.status === "PENDING" || r.status === "IMPLEMENTATION";
        } else if (statusFilter === "Verification") {
          matchesStatus = r.status === "VERIFICATION";
        } else if (statusFilter === "Closed") {
          matchesStatus = r.status === "CLOSED";
        } else {
          // Fallback for exact matches if you add more filters later
          matchesStatus = r.status === (statusFilter as any);
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  // COLUMN DEFINITIONS
  const columns: ColumnDef<CapaRecord>[] = [
    {
      field: "capa_id",
      headerName: "CAPA ID",
      width: 140,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{
            color: "#6366F1",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
          // ✅ FIX: Navigate using the String ID (capa_id)
          onClick={() => navigate(`/capa/${row.capa_id || row.id}`)}
        >
          {row.capa_id}
        </Typography>
      ),
    },
    { field: "title", headerName: "TITLE", width: "30%" },
    { field: "department", headerName: "DEPARTMENT" },
    {
      field: "action_type",
      headerName: "TYPE",
      renderCell: (row) => (
        <Chip
          label={row.action_type}
          size="small"
          sx={{
            bgcolor: row.action_type === "CORRECTIVE" ? "#fee2e2" : "#dcfce7",
            color: row.action_type === "CORRECTIVE" ? "#991b1b" : "#166534",
            fontWeight: 600,
            fontSize: "0.7rem",
          }}
        />
      ),
    },
    { field: "status", headerName: "STATUS" }, // ModuleTable handles status pills automatically
    { field: "due_date", headerName: "DUE DATE" },
  ];

  if (loading)
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Corrective and Preventive Actions (CAPA)
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "#64748b" }}>
            Manage corrective actions and preventive measures to ensure
            continuous improvement
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{
            bgcolor: "#4F46E5",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          Create New
        </Button>
      </Box>

      {/* Search & Filter Bar */}
      <Box
        sx={{
          bgcolor: "#fff",
          p: 2,
          borderRadius: 3,
          boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
          mb: 3,
          border: "1px solid #e2e8f0",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search CAPA records..."
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
              endAdornment: (
                <Button
                  startIcon={<FilterListIcon />}
                  sx={{
                    textTransform: "none",
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  Filters
                </Button>
              ),
            },
          }}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              bgcolor: "#f8fafc",
              borderRadius: 2,
              "& fieldset": { borderColor: "#e2e8f0" },
            },
          }}
        />

        {/* Status Pills */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "#475569",
              mr: 1,
              fontSize: "0.85rem",
            }}
          >
            Status:
          </Typography>
          {STATUS_FILTERS.map((status) => (
            <Chip
              key={status}
              label={status}
              onClick={() => setStatusFilter(status)}
              sx={{
                borderRadius: 2,
                height: 28,
                bgcolor: statusFilter === status ? "#0f172a" : "#f1f5f9",
                color: statusFilter === status ? "#fff" : "#64748b",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                border: "1px solid",
                borderColor:
                  statusFilter === status ? "#0f172a" : "transparent",
                "&:hover": {
                  bgcolor: statusFilter === status ? "#1e293b" : "#e2e8f0",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Data Table */}
      <ModuleTable
        columns={columns}
        rows={filteredRows}
        // ✅ FIX: Navigate using string ID when clicking "Eye" icon or row action
        onView={
          role !== "Viewer"
            ? (id) => {
                const record = rows.find((r) => String(r.id) === String(id));
                const navigateId = record ? record.capa_id || record.id : id;
                navigate(`/capa/${navigateId}`);
              }
            : undefined
        }
      />

      {/* Permission Denied Dialog */}
      <PermissionDeniedDialog
        open={permissionDenied.open}
        onClose={() => setPermissionDenied({ open: false, message: "" })}
        message={permissionDenied.message}
      />
    </Box>
  );
}
