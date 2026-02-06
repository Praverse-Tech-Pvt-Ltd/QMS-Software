import { Box, Button, TextField, Typography, Chip, InputAdornment, Alert, CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

// Standard Imports
import PermissionDeniedDialog from "../../components/common/PermissionDeniedDialog";
import ModuleTable, { type ColumnDef } from "../../components/common/ModuleTable";
import { changeService, type ChangeRecord } from "../../services/change.service"; 
import { useRole } from "../../app/providers/RoleProvider";
import { permissionService } from "../../services/permission.service";

// Filter Options matching your backend statuses
const STATUS_FILTERS = ["All", "Draft", "Review", "Approved", "Closed"];

export default function ChangeControlListPage() {
  const navigate = useNavigate();
  const { role } = useRole();
  
  // ✅ State for Real Data
  const [rows, setRows] = useState<ChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [permissionDenied, setPermissionDenied] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ✅ Fetch Data on Mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await changeService.list();
      setRows(data);
    } catch (err) {
      console.error("Failed to load Change records", err);
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

  // Filter Logic
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      // ✅ Fix: Cast to any to access 'change_id' if it's missing from type definition
      const changeId = (r as any).change_id || "";
      const searchString = searchTerm.toLowerCase();
      
      const matchesSearch =
        r.title.toLowerCase().includes(searchString) ||
        changeId.toLowerCase().includes(searchString);

      let matchesStatus = true;
      if (statusFilter !== "All") {
          // ✅ Fix: Map "Review" filter to valid Backend Statuses (EVALUATION / APPROVAL)
          if (statusFilter === "Review") {
              matchesStatus = r.status === "EVALUATION" || r.status === "APPROVAL";
          }
          // ✅ Fix: Map "Approved" to "APPROVAL" or check logic depending on backend
          else if (statusFilter === "Approved") {
               matchesStatus = r.status === "APPROVAL"; // Or whatever final approved state is
          }
          else if (statusFilter === "Closed") {
              matchesStatus = r.status === "CLOSED";
          }
          else if (statusFilter === "Draft") {
              matchesStatus = r.status === "DRAFT";
          }
          else {
              matchesStatus = r.status === statusFilter.toUpperCase() as any;
          }
      }

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  // Helper for Change Type Colors
  const getTypeColor = (type?: string) => {
      if (!type) return { bg: "#f3f4f6", color: "#374151" };
      switch(type.toUpperCase()) {
          case "CRITICAL": return { bg: "#fee2e2", color: "#991b1b" }; // Red
          case "MAJOR": return { bg: "#ffedd5", color: "#9a3412" };    // Orange
          case "MINOR": return { bg: "#EEF2FF", color: "#4F46E5" };    // Blue
          default: return { bg: "#f3f4f6", color: "#374151" };
      }
  };

  // ✅ COLUMN DEFINITIONS
  const columns: ColumnDef<ChangeRecord>[] = [
    { 
      // ✅ Fix: Use 'id' (number) for the field key if change_id isn't in type
      field: "id", 
      headerName: "CHANGE ID", 
      width: 140,
      renderCell: (row) => (
        <Typography 
          variant="body2" 
          sx={{ color: "#6366F1", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
          onClick={() => navigate(`/change-control/${row.id}`)}
        >
          {/* ✅ Fix: Cast to any to display the string ID */}
          {(row as any).change_id || row.id}
        </Typography>
      ) 
    },
    { field: "title", headerName: "TITLE", width: "30%" },
    { field: "owner", headerName: "INITIATOR" }, 
    { field: "department", headerName: "DEPARTMENT" },
    { 
        // ✅ Fix: Cast to any to access 'priority'
        field: "priority" as any, 
        headerName: "CHANGE TYPE",
        renderCell: (row) => {
            const priority = (row as any).priority;
            const style = getTypeColor(priority);
            return (
                <Chip 
                    label={priority || "Standard"}
                    size="small"
                    sx={{ 
                        bgcolor: style.bg, 
                        color: style.color, 
                        fontWeight: 700, 
                        fontSize: "0.75rem",
                        borderRadius: 1,
                        height: 24
                    }}
                />
            )
        }
    },
    { field: "status", headerName: "STATUS" }, // Handled automatically by ModuleTable (Pills)
    { 
        // ✅ Fix: Cast to any or map to a known field like 'created_at' if target_date missing
        field: "target_date" as any, 
        headerName: "TARGET DATE",
        renderCell: (row) => (row as any).target_date || "-"
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
            Change Control Management
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#64748b" }}>
            Control and document all changes to processes, equipment, and documentation
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

      {/* Search & Filter Bar */}
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
            placeholder="Search change control records..."
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

        {/* Status Pills */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
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

      {/* Data Table */}
      <ModuleTable
        columns={columns}
        rows={filteredRows}
        onView={role !== "Viewer" ? (id) => navigate(`/change-control/${id}`) : undefined}
      />

      <PermissionDeniedDialog
        open={permissionDenied.open}
        onClose={() => setPermissionDenied({ open: false, message: "" })}
        message={permissionDenied.message}
      />
    </Box>
  );
}