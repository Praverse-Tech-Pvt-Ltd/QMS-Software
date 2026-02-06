import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { transitions, shadows, motion } from "../../theme/motion";

// ✅ Type Definition for Columns
export interface ColumnDef<T = any> {
  field: keyof T | string;
  headerName: string;
  width?: string | number;
  align?: "left" | "right" | "center";
  renderCell?: (row: T) => React.ReactNode; // Key for custom UI like Progress Bars
}

interface ModuleTableProps {
  columns: ColumnDef[];
  rows: any[];
  onView?: (id: string) => void;
}

export default function ModuleTable({
  columns,
  rows,
  onView,
}: ModuleTableProps) {
  
  // Helper: Map Backend Status to UI Colors
  const getStatusColor = (status: string, row?: any) => {
    // Logic: If date is passed and not closed, it's overdue
    if (row?.dueDate && new Date(row.dueDate) < new Date() && status !== "Closed" && status !== "Completed") {
        return "error"; 
    }
    switch (status) {
      case "Completed": 
      case "Closed": return "success";
      case "In Progress": 
      case "Implementation": return "primary"; // Blue
      case "Open": 
      case "Draft": return "default"; // Grey
      default: return "default";
    }
  };

  const getStatusLabel = (status: string, row?: any) => {
     if (row?.dueDate && new Date(row.dueDate) < new Date() && status !== "Closed" && status !== "Completed") {
        return "Overdue";
     }
     // Map specific workflow terms to generic UI terms if needed
     if (status === "Implementation") return "In Progress";
     if (status === "Draft") return "Open";
     if (status === "Closed") return "Completed";
     return status;
  };

  return (
    <TableContainer 
      component={Paper} 
      elevation={0} 
      sx={{ 
        border: "1px solid #e2e8f0", 
        borderRadius: 3, 
        overflow: "hidden",
        boxShadow: shadows.card,
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: "#F8F9FA" }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell 
                key={String(col.field)} 
                sx={{ 
                    fontWeight: 700, 
                    color: "#64748b", 
                    fontSize: "0.75rem", 
                    textTransform: "uppercase",
                    py: 2
                }}
                align={col.align || "left"}
                width={col.width}
              >
                {col.headerName}
              </TableCell>
            ))}
            {/* Actions Column - Only show if onView is provided */}
            {onView && (
              <TableCell align="right" sx={{ fontWeight: 700, color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>
                ACTIONS
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
             <TableRow>
               <TableCell colSpan={columns.length + (onView ? 1 : 0)} align="center" sx={{ py: 4, color: "text.secondary" }}>
                 No records found.
               </TableCell>
             </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow 
                key={row.id} 
                hover 
                sx={{ 
                  "&:last-child td, &:last-child th": { border: 0 },
                  cursor: "pointer",
                  transition: transitions.tableRow.hover,
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                  },
                }}
              >
                {columns.map((col) => (
                  <TableCell key={String(col.field)} align={col.align || "left"}>
                    {/* 1. Custom Render (Progress Bar, Links) */}
                    {col.renderCell ? (
                      col.renderCell(row)
                    ) : 
                    /* 2. Status Chip Logic */
                    col.field === "status" ? (
                      <Chip 
                        label={getStatusLabel(row.status, row)} 
                        size="small" 
                        color={getStatusColor(row.status, row) as any} 
                        variant="filled"
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: "0.75rem", 
                          borderRadius: 1.5,
                          transition: transitions.status.change,
                        }}
                      />
                    ) : (
                    /* 3. Default Text */
                      <Typography variant="body2" sx={{ color: "#334155" }}>
                        {row[col.field]}
                      </Typography>
                    )}
                  </TableCell>
                ))}
                
                {/* Actions: View Icon - Only show if onView is provided */}
                {onView && (
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <IconButton 
                        size="small" 
                        onClick={() => onView(row.id)} 
                        sx={{ 
                          color: "#94a3b8",
                          transition: transitions.fast,
                          "&:hover": {
                            color: "#6366F1",
                            transform: `translateY(-${motion.distance.micro}px)`,
                            backgroundColor: "#F5F7FF",
                          },
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}