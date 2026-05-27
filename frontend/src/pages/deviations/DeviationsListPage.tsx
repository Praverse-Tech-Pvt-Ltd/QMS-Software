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

// Filter Options matched to Django TextChoices
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
        message: `Permission Denied. Role: ${role || "Unknown"}`,
      });
      return;
    }
    navigate("/deviations/new");
  };

  // Filter Logic
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const devId = String(r.deviation_id || r.id || "");
      const searchString = searchTerm.toLowerCase();

      const matchesSearch =
        r.title.toLowerCase().includes(searchString) ||
        devId.toLowerCase().includes(searchString) ||
        r.department.toLowerCase().includes(searchString);

      let matchesStatus = true;
      if (statusFilter !== "All") {
        const backendStatus = String(r.status).toUpperCase();
        // UI Friendly Mapping
        if (statusFilter === "QA Review") {
          matchesStatus =
            backendStatus === "QA_REVIEW" || backendStatus === "UNDER_REVIEW";
        } else if (statusFilter === "Draft") {
          matchesStatus = backendStatus === "DRAFT";
        } else if (statusFilter === "Investigation") {
          matchesStatus = backendStatus === "INVESTIGATION";
        } else if (statusFilter === "Closed") {
          matchesStatus =
            backendStatus === "CLOSED" || backendStatus === "APPROVED";
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  // Helper for Severity Colors
  const getSeverityColor = (severity?: string) => {
    const s = String(severity || "MINOR").toUpperCase();
    switch (s) {
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
      field: "deviation_id",
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
          onClick={() => navigate(`/deviations/${row.deviation_id}`)}
        >
          {row.deviation_id}
        </Typography>
      ),
    },
    { field: "title", headerName: "TITLE", width: "25%" },
    { field: "department", headerName: "DEPARTMENT" },
    {
      field: "risk_level" as any, // Mapped to risk_level from backend
      headerName: "SEVERITY",
      renderCell: (row) => {
        const severity = row.risk_level || "MINOR";
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
    {
      field: "status",
      headerName: "STATUS",
      renderCell: (row) => (
        <Chip
          label={row.status.replace("_", " ")}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: "0.7rem" }}
        />
      ),
    },
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
            Regulatory compliant tracking with immutable audit logs.
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
          }}
        >
          Create New
        </Button>
      </Box>

      {/* Filters Area */}
      <Box
        sx={{
          bgcolor: "#fff",
          p: 2,
          borderRadius: 3,
          mb: 3,
          border: "1px solid #e2e8f0",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search by ID, Title, or Department..."
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
          sx={{ mb: 2 }}
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
            sx={{ fontWeight: 600, color: "#475569", mr: 1 }}
          >
            Status Filter:
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
                cursor: "pointer",
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Main Table */}
      <ModuleTable
        columns={columns}
        rows={filteredRows}
        onView={(id) => {
          const record = rows.find(
            (r) => String(r.id) === String(id) || r.deviation_id === id,
          );
          const navigateId = record?.deviation_id || id;
          navigate(`/deviations/${navigateId}`);
        }}
      />

      <PermissionDeniedDialog
        open={permissionDenied.open}
        onClose={() => setPermissionDenied({ open: false, message: "" })}
        message={permissionDenied.message}
      />
    </Box>
  );
}
