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
import {
  deviationsService,
  type DeviationRecord,
} from "../../services/deviations.service";
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// Filter Options
const STATUS_FILTERS = ["All", "Draft", "Investigation", "QA Review", "Closed"];

export default function DeviationsListPage() {
  const navigate = useNavigate();
  const { role } = useRole();

  // Data State
  const [rows, setRows] = useState<DeviationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [permissionDenied, setPermissionDenied] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await deviationsService.list();
      setRows(data);
    } catch (err) {
      console.error("Failed to load Deviations", err);
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const canCreate = role
      ? permissionService.can(role, "deviations", "create")
      : false;

    if (!canCreate) {
      setPermissionDenied({
        open: true,
        message: `You don't have permission to report deviations. Role: ${role || "Unknown"}`,
      });
      return;
    }
    navigate("/deviations/new");
  };

  // Filter Logic
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const devId = String((r as any).deviation_id || "");
      const searchString = searchTerm.toLowerCase();

      const matchesSearch =
        r.title.toLowerCase().includes(searchString) ||
        devId.toLowerCase().includes(searchString);

      let matchesStatus = true;
      if (statusFilter !== "All") {
        const currentStatus = String((r as any).status)
          .toUpperCase()
          .replace("_", " ");
        matchesStatus = currentStatus.includes(statusFilter.toUpperCase());
        if (statusFilter === "QA Review") {
          matchesStatus = r.status === "QA_REVIEW";
        } else if (statusFilter === "Draft") {
          matchesStatus = r.status === "DRAFT";
        } else if (statusFilter === "Investigation") {
          matchesStatus = r.status === "INVESTIGATION";
        } else if (statusFilter === "Closed") {
          matchesStatus = r.status === "CLOSED";
        } else {
          matchesStatus = r.status === (statusFilter.toUpperCase() as any);
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  // Helper for Severity Colors
  const getSeverityColor = (severity?: string) => {
    if (!severity) return { bg: "#f3f4f6", color: "#374151" };
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return { bg: "#fee2e2", color: "#991b1b" };
      case "MAJOR":
        return { bg: "#ffedd5", color: "#9a3412" };
      case "MINOR":
        return { bg: "#fef9c3", color: "#854d0e" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  // Column Definitions
  const columns: ColumnDef<DeviationRecord>[] = [
    {
      field: "id",
      headerName: "DEVIATION ID",
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
          // ✅ FIX: Navigate using String ID
          onClick={() =>
            navigate(`/deviations/${(row as any).deviation_id || row.id}`)
          }
        >
          {(row as any).deviation_id || row.id}
        </Typography>
      ),
    },
    { field: "title", headerName: "TITLE", width: "25%" },
    { field: "department", headerName: "DEPARTMENT" },
    {
      field: "severity" as any,
      headerName: "SEVERITY",
      renderCell: (row) => {
        const severity = (row as any).severity || "Minor";
        const style = getSeverityColor(severity);
        return (
          <Chip
            label={severity}
            size="small"
            sx={{
              bgcolor: style.bg,
              color: style.color,
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: 1,
            }}
          />
        );
      },
    },
    { field: "status", headerName: "STATUS" },
    {
      field: "created_at",
      headerName: "REPORTED DATE",
      renderCell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
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
            Deviation / Incident Management
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "#64748b" }}>
            Track and investigate quality deviations and incidents with complete
            audit trail
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

      {/* Filters */}
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
          placeholder="Search deviations and incidents..."
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

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
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

      {/* Table */}
      <ModuleTable
        columns={columns}
        rows={filteredRows}
        onView={
          role !== "Viewer"
            ? (id) => {
                // ✅ FIX: Find record and navigate using String ID
                const record = rows.find((r) => String(r.id) === String(id));
                const navigateId = record
                  ? (record as any).deviation_id || record.id
                  : id;
                navigate(`/deviations/${navigateId}`);
              }
            : undefined
        }
      />

      <PermissionDeniedDialog
        open={permissionDenied.open}
        onClose={() => setPermissionDenied({ open: false, message: "" })}
        message={permissionDenied.message}
      />
    </Box>
  );
}
