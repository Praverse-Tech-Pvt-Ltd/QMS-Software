import { Box, Button, TextField, Typography, Chip, InputAdornment } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

// Standard Imports
import ModuleTable, {type ColumnDef } from "../../components/common/ModuleTable";
import { deviationsService } from "../../services/deviations.service";
import {type DeviationRecord } from "../../types/deviation.types";

// Filter Options matching your image
const STATUS_FILTERS = ["All", "Open", "QA Review", "In Progress", "Closed"];

export default function DeviationsListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<DeviationRecord[]>([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    deviationsService.list().then((data) => {
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
          else if (statusFilter === "Open") matchesStatus = r.status === "Open" || r.status === "Draft";
          else if (statusFilter === "In Progress") matchesStatus = r.status === "Implementation";
          else if (statusFilter === "Closed") matchesStatus = r.status === "Closed";
          else matchesStatus = r.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  // Helper for Severity Colors
  const getSeverityColor = (severity: string) => {
      switch(severity) {
          case "Critical": return { bg: "#fee2e2", color: "#991b1b" }; // Red
          case "Major": return { bg: "#ffedd5", color: "#9a3412" };    // Orange
          case "Minor": return { bg: "#fef9c3", color: "#854d0e" };    // Yellow
          default: return { bg: "#f3f4f6", color: "#374151" };
      }
  };

  // ✅ COLUMN DEFINITIONS
  const columns: ColumnDef<DeviationRecord>[] = [
    { 
      field: "id", 
      headerName: "DEVIATION ID", 
      width: 140,
      renderCell: (row) => (
        <Typography 
          variant="body2" 
          sx={{ color: "#2563eb", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
          onClick={() => navigate(`/deviations/${row.id}`)}
        >
          {row.id}
        </Typography>
      ) 
    },
    { field: "title", headerName: "TITLE", width: "25%" },
    { field: "reportedBy", headerName: "REPORTED BY" },
    { field: "department", headerName: "DEPARTMENT" },
    { 
        field: "severity", 
        headerName: "SEVERITY",
        renderCell: (row) => {
            const style = getSeverityColor(row.severity);
            return (
                <Chip 
                    label={row.severity}
                    size="small"
                    sx={{ 
                        bgcolor: style.bg, 
                        color: style.color, 
                        fontWeight: 700, 
                        fontSize: "0.75rem",
                        borderRadius: 1
                    }}
                />
            )
        }
    },
    { field: "status", headerName: "STATUS" }, // Handled automatically by ModuleTable (Status Pills)
    { field: "reportedDate", headerName: "REPORTED DATE" },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* 1. Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Deviation / Incident Management
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#64748b" }}>
            Track and investigate quality deviations and incidents with complete audit trail
            </Typography>
        </Box>
        <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate("/deviations/new")}
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
            placeholder="Search deviations and incidents..."
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
        onView={(id) => navigate(`/deviations/${id}`)}
      />
    </Box>
  );
}