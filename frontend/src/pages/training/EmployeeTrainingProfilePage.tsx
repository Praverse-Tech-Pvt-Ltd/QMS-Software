import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import { useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";

const employees: Record<string, { name: string; department: string; completion: number }> = {
  "EMP-1001": { name: "Rahul Patel", department: "Production", completion: 72 },
  "EMP-1002": { name: "Amit Shah", department: "Production", completion: 55 },
  "EMP-2001": { name: "Neha Mehta", department: "QC", completion: 88 },
  "EMP-2002": { name: "Kunal Jain", department: "QC", completion: 61 },
  "EMP-3001": { name: "Priya Desai", department: "QA", completion: 90 },
  "EMP-3002": { name: "Ravi Joshi", department: "QA", completion: 70 },
};

const mockTrainings = [
  { title: "SOP-001 (Gowning)", status: "Completed", due: "2026-01-05" },
  { title: "SOP-014 (Line Clearance)", status: "Due Soon", due: "2026-01-25" },
  { title: "SOP-022 (Batch Record Review)", status: "Overdue", due: "2026-01-10" },
];

export default function EmployeeTrainingProfilePage() {
  const { id } = useParams();

  const emp = employees[id || ""] || {
    name: "Employee",
    department: "N/A",
    completion: 0,
  };

  return (
    <Box>
      <PageHeader
        title="Employee Training Profile"
        subtitle={`Employee ID: ${id}`}
        showBack
      />

      <Paper
        sx={{
          mt: 2,
          p: 3,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {emp.name}
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Department: {emp.department}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
            Completion Percentage
          </Typography>

          <LinearProgress variant="determinate" value={emp.completion} />
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 0.7, display: "block" }}
          >
            {emp.completion}% completed
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
            Assigned Trainings
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                <TableCell sx={{ fontWeight: 800 }}>Training</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Due Date</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {mockTrainings.map((t) => (
                <TableRow key={t.title} hover>
                  <TableCell>{t.title}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={t.status}
                      color={
                        t.status === "Completed"
                          ? "success"
                          : t.status === "Overdue"
                          ? "error"
                          : "warning"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{t.due}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 2, display: "block" }}
          >
            Training completion and overdue calculation will be connected once
            backend integration is available.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
