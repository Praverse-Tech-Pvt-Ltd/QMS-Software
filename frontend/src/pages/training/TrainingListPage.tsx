import { Box, Button, TextField, Typography, Chip, InputAdornment, Alert, CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

// Standard Imports
import PermissionDeniedDialog from "../../components/common/PermissionDeniedDialog";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { trainingService,type TrainingPlan } from "../../services/training.service"; 
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// Filter Options
const STATUS_FILTERS = ["All", "Draft", "Active", "Obsolete"];

export default function TrainingListPage() {
  const navigate = useNavigate();
  const { role } = useRole();
  
  // Data State
  const [rows, setRows] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [permissionDenied, setPermissionDenied] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  
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
      const data = await trainingService.list();
      setRows(data);
    } catch (err) {
      console.error("Failed to load Training Plans", err);
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const canCreate = role ? permissionService.can(role, "training", "create") : false;

    if (!canCreate) {
      setPermissionDenied({
        open: true,
        message: `You don't have permission to create training records. Role: ${role || "Unknown"}`,
      });
      return;
    }
    navigate("/training/new");
  };

  // Filter Logic
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const searchString = searchTerm.toLowerCase();
      // Safe access to ID
      const idString = r.id ? r.id.toString() : "";
      
      const matchesSearch =
        r.title.toLowerCase().includes(searchString) ||
        idString.includes(searchString);

      // Status Logic
      let matchesStatus = true;
      if (statusFilter !== "All") {
          // ✅ FIX: Use simple string comparison or cast to any to avoid type overlap errors
          const currentStatus = r.status as string; 

          if (statusFilter === "Draft") {
              matchesStatus = currentStatus === "DRAFT";
          }
          else if (statusFilter === "Active") {
              matchesStatus = currentStatus === "ACTIVE";
          }
          else if (statusFilter === "Obsolete") {
              matchesStatus = currentStatus === "OBSOLETE";
          }
          else {
              matchesStatus = currentStatus === statusFilter.toUpperCase();
          }
      }

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  // COLUMN DEFINITIONS
  const columns: ColumnDef<TrainingPlan>[] = [
    { 
      field: "id", 
      headerName: "TRAINING ID", 
      width: 140,
      renderCell: (row) => (
        <Typography 
          variant="body2" 
          sx={{ color: "#6366F1", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
          onClick={() => navigate(`/training/${row.id}`)}
        >
          {row.id}
        </Typography>
      ) 
    },
    { field: "title", headerName: "TITLE", width: "25%" },
    { field: "department", headerName: "DEPARTMENT" },
    { 
        field: "status", 
        headerName: "STATUS",
        renderCell: (row) => (
            <Chip 
                label={row.status} 
                size="small" 
                sx={{ 
                    bgcolor: row.status === 'ACTIVE' ? '#dcfce7' : (row.status === 'DRAFT' ? '#f3f4f6' : '#fee2e2'),
                    color: row.status === 'ACTIVE' ? '#166534' : (row.status === 'DRAFT' ? '#374151' : '#991b1b'),
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: 1
                }} 
            />
        )
    },
    { 
        field: "duration_minutes", 
        headerName: "DURATION (MIN)", 
        // ✅ FIX: Access correct backend field
        renderCell: (row) => (row as any).duration_minutes || (row as any).duration || "-" 
    },
    { 
      // ✅ FIX: Cast completionRate to any as it's not in the strict TrainingPlan type
      field: "completionRate" as any, 
      headerName: "COMPLETION", 
      width: 200,
      renderCell: (row) => {
        const rate = (row as any).completionRate || 0;
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <div style={{ 
                    height: 8, 
                    width: '100%', 
                    backgroundColor: '#e2e8f0', 
                    borderRadius: 4 
                }}>
                    <div style={{ 
                        height: '100%', 
                        width: `${rate}%`, 
                        backgroundColor: rate === 100 ? '#16a34a' : (rate === 0 ? '#cbd5e1' : '#6366F1'), 
                        borderRadius: 4 
                    }} />
                </div>
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>
                    {`${Math.round(rate)}%`}
                </Typography>
            </Box>
            </Box>
        );
      }
    },
  ];

  if (loading) return <Box sx={{ p: 5, textAlign: "center" }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 5 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Training / Learning Management System
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#64748b" }}>
            Manage training assignments, track completion, and maintain qualification records
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
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
        >
          Create New
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ 
          bgcolor: "#fff", 
          p: 2, 
          borderRadius: 3, 
          boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
          mb: 3,
          border: "1px solid #e2e8f0"
      }}>
        <TextField
            fullWidth
            placeholder="Search training courses..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8" }} />
                    </InputAdornment>
                ),
                endAdornment: (
                    <Button 
                        startIcon={<FilterListIcon />}
                        sx={{ textTransform: "none", color: "#475569", fontWeight: 600 }}
                    >
                        Filters
                    </Button>
                )
            }}
            sx={{ 
                mb: 2,
                "& .MuiOutlinedInput-root": {
                    bgcolor: "#f8fafc",
                    borderRadius: 2,
                    "& fieldset": { borderColor: "#e2e8f0" },
                }
            }}
        />

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", mr: 1, fontSize: "0.85rem" }}>
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
                        borderColor: statusFilter === status ? "#0f172a" : "transparent",
                        "&:hover": {
                            bgcolor: statusFilter === status ? "#1e293b" : "#e2e8f0"
                        }
                    }}
                />
            ))}
        </Box>
      </Box>

      {/* Table */}
      <ModuleTable
        columns={columns}
        rows={filteredRows}
        onView={role !== "Viewer" ? (id) => navigate(`/training/${id}`) : undefined}
      />

      <PermissionDeniedDialog
        open={permissionDenied.open}
        onClose={() => setPermissionDenied({ open: false, message: "" })}
        message={permissionDenied.message}
      />
    </Box>
  );
}