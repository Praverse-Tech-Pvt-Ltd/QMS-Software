import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const mockMatrix = [
  {
    role: "Production",
    requiredSops: [
      "SOP-001 (Gowning)",
      "SOP-014 (Line Clearance)",
      "SOP-022 (Batch Record Review)",
    ],
    employees: [
      { id: "EMP-1001", name: "Rahul Patel" },
      { id: "EMP-1002", name: "Amit Shah" },
    ],
  },
  {
    role: "QC",
    requiredSops: [
      "SOP-005 (Sampling)",
      "SOP-009 (OOS Handling)",
      "SOP-020 (Equipment Calibration)",
    ],
    employees: [
      { id: "EMP-2001", name: "Neha Mehta" },
      { id: "EMP-2002", name: "Kunal Jain" },
    ],
  },
  {
    role: "QA",
    requiredSops: [
      "SOP-002 (Document Control)",
      "SOP-010 (Deviation Handling)",
      "SOP-011 (CAPA Management)",
    ],
    employees: [
      { id: "EMP-3001", name: "Priya Desai" },
      { id: "EMP-3002", name: "Ravi Joshi" },
    ],
  },
];

export default function TrainingMatrixPage() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(mockMatrix[0].role);

  const selectedData = useMemo(() => {
    return mockMatrix.find((x) => x.role === selectedRole)!;
  }, [selectedRole]);

  return (
    <Box>
      <PageHeader
        title="Training Matrix"
        subtitle="Role → SOP mapping and employee training access (UI only)"
        showBack
      />

      {/* Role Selection */}
      <Paper
        sx={{
          mt: 2,
          p: 3,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
          Select Role
        </Typography>

        <TextField
          select
          label="Role"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          sx={{ minWidth: 260 }}
        >
          {mockMatrix.map((r) => (
            <MenuItem key={r.role} value={r.role}>
              {r.role}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* SOP Mapping */}
      <Paper
        sx={{
          mt: 2,
          p: 3,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
          Required SOPs for {selectedRole}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {selectedData.requiredSops.map((sop) => (
            <Chip key={sop} label={sop} variant="outlined" />
          ))}
        </Box>

        <Typography
          variant="caption"
          sx={{ color: "text.secondary", mt: 2, display: "block" }}
        >
          Later this will link to DMS SOP versions + periodic review compliance.
        </Typography>
      </Paper>

      {/* Employee List */}
      <Paper
        sx={{
          mt: 2,
          p: 3,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
          Employees ({selectedRole})
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                <TableCell sx={{ fontWeight: 800 }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {selectedData.employees.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{emp.id}</TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => navigate(`/training/employees/${emp.id}`)}
                    >
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Typography
          variant="caption"
          sx={{ color: "text.secondary", mt: 2, display: "block" }}
        >
          Employee completion and overdue logic will be connected after backend
          integration.
        </Typography>
      </Paper>
    </Box>
  );
}
