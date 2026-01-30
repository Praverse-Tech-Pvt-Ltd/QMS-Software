import { Box, Button, TextField, Typography, Chip, InputAdornment } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

// Standard Imports
import ModuleTable, {type ColumnDef } from "../../components/common/ModuleTable";
import { capaService } from "../../services/capa.service";
import { type CapaRecord } from "../../types/capa.types";

// Filter Options matching your image
const STATUS_FILTERS = ["All", "Open", "QA Review", "In Progress", "Completed"];

export default function CapaListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<CapaRecord[]>([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    capaService.list().then((data) => {
      setRows(data);
    });
  }, []);

  // Filter Logic
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Helper to match UI status label back to backend status
      let matchesStatus = true;
      if (statusFilter !== "All") {
          if (statusFilter === "QA Review") matchesStatus = r.status === "Review";
          else if (statusFilter === "Open") matchesStatus = r.status === "Draft";
          else if (statusFilter === "In Progress") matchesStatus = r.status === "Implementation";
          else if (statusFilter === "Completed") matchesStatus = r.status === "Closed" || r.status === "Effective";
          else matchesStatus = r.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  // Helper for Priority Colors
  const getPriorityColor = (priority: string) => {
      switch(priority) {
          case "Critical": return { color: "#dc2626", fontWeight: 700 }; // Red text
          case "High": return { color: "#ea580c", fontWeight: 700 };     // Orange text
          case "Medium": return { color: "#2563eb", fontWeight: 700 };   // Blue text
          case "Low": return { color: "#16a34a", fontWeight: 700 };      // Green text
          default: return { color: "#4b5563" };
      }
  };

  // ✅ COLUMN DEFINITIONS
  const columns: ColumnDef<CapaRecord>[] = [
    { 
      field: "id", 
      headerName: "CAPA ID", 
      width: 140,
      renderCell: (row) => (
        <Typography 
          variant="body2" 
          sx={{ color: "#2563eb", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
          onClick={() => navigate(`/capa/${row.id}`)}
        >
          {row.id}
        </Typography>
      ) 
    },
    { field: "title", headerName: "TITLE", width: "30%" },
    { field: "initiator", headerName: "INITIATOR" },
    { field: "department", headerName: "DEPARTMENT" },
    { 
        field: "priority", 
        headerName: "PRIORITY",
        renderCell: (row) => (
            <Typography variant="body2" sx={{ ...getPriorityColor(row.priority), fontSize: "0.875rem" }}>
                {row.priority}
            </Typography>
        )
    },
    { field: "status", headerName: "STATUS" }, // Handled automatically by ModuleTable (Pills)
    { field: "dueDate", headerName: "DUE DATE" },
    { 
        field: "relatedTo", 
        headerName: "RELATED TO",
        renderCell: (row) => (
            <Typography 
                variant="body2" 
                sx={{ color: "#2563eb", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
                onClick={(e) => {
                    e.stopPropagation();
                    // In a real app, you might navigate to the Deviation page here
                    console.log("Navigating to related:", row.relatedTo);
                }}
            >
                {row.relatedTo}
            </Typography>
        )
    },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* 1. Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Corrective and Preventive Actions (CAPA)
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#64748b" }}>
            Manage corrective actions and preventive measures to ensure continuous improvement
            </Typography>
        </Box>
        <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate("/capa/new")}
            sx={{ 
                bgcolor: "#1e40af", 
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
        >
          Create New
        </Button>
      </Box>

      {/* 2. Search & Filter Bar */}
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
            placeholder="Search CAPA records..."
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

      {/* 3. Data Table */}
      <ModuleTable
        columns={columns}
        rows={filteredRows}
        onView={(id) => navigate(`/capa/${id}`)}
      />
    </Box>
  );
}