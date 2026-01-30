import { Box, Button, TextField, Typography, Chip, InputAdornment } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

// Standard Imports
import ModuleTable, {type ColumnDef } from "../../components/common/ModuleTable";
import { trainingService } from "../../services/training.service";
import {type TrainingPlan } from "../../types/training.types";

// Filter Options matching your image
const STATUS_FILTERS = ["All", "Open", "In Progress", "Completed", "Overdue"];

export default function TrainingListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<TrainingPlan[]>([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    trainingService.list().then((data) => {
      setRows(data);
    });
  }, []);

  // Filter Logic
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Status Logic (Handling "Overdue" computed state)
      let matchesStatus = true;
      if (statusFilter !== "All") {
          const isOverdue = r.dueDate && new Date(r.dueDate) < new Date() && r.status !== "Closed";
          
          if (statusFilter === "Overdue") matchesStatus = !!isOverdue;
          else if (statusFilter === "Completed") matchesStatus = r.status === "Closed";
          else if (statusFilter === "Open") matchesStatus = r.status === "Draft";
          else if (statusFilter === "In Progress") matchesStatus = r.status === "Implementation";
          // If none match specific maps, check direct value
          else if (!matchesStatus) matchesStatus = r.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  // ✅ COLUMN DEFINITIONS (Matches Image)
  const columns: ColumnDef<TrainingPlan>[] = [
    { 
      field: "id", 
      headerName: "TRAINING ID", 
      width: 140,
      renderCell: (row) => (
        <Typography 
          variant="body2" 
          sx={{ color: "#2563eb", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
          onClick={() => navigate(`/training/${row.id}`)}
        >
          {row.id}
        </Typography>
      ) 
    },
    { field: "title", headerName: "TITLE", width: "25%" },
    { field: "assignedTo", headerName: "ASSIGNED TO" },
    { field: "department", headerName: "DEPARTMENT" },
    { field: "status", headerName: "STATUS" }, // Handled automatically by ModuleTable
    { field: "dueDate", headerName: "DUE DATE" },
    { 
      field: "completionRate", 
      headerName: "COMPLETION", 
      width: 200,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            {/* Custom Progress Bar matching design */}
            <div style={{ 
                height: 8, 
                width: '100%', 
                backgroundColor: '#e2e8f0', // Light Grey Background
                borderRadius: 4 
            }}>
                <div style={{ 
                    height: '100%', 
                    width: `${row.completionRate}%`, 
                    // Green if 100%, Blue otherwise, Grey if 0
                    backgroundColor: row.completionRate === 100 ? '#16a34a' : (row.completionRate === 0 ? '#cbd5e1' : '#2563eb'), 
                    borderRadius: 4 
                }} />
            </div>
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>
                {`${Math.round(row.completionRate)}%`}
            </Typography>
          </Box>
        </Box>
      )
    },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* 1. Header Section */}
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
            onClick={() => navigate("/training/new")}
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
                        // Active State vs Inactive State
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
        onView={(id) => navigate(`/training/${id}`)}
      />
    </Box>
  );
}