import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Grid, // ✅ Standardized Grid
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import OjtChecklist from "../../components/training/OjtChecklist";
// Icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import QuizIcon from "@mui/icons-material/Quiz";

// --- MOCK DATA ---
const employees: Record<
  string,
  { name: string; department: string; completion: number }
> = {
  "EMP-1001": { name: "Rahul Patel", department: "Production", completion: 72 },
  "EMP-1002": { name: "Amit Shah", department: "Production", completion: 55 },
  "EMP-2001": { name: "Neha Mehta", department: "QC", completion: 88 },
  "EMP-2002": { name: "Kunal Jain", department: "QC", completion: 61 },
  "EMP-3001": { name: "Priya Desai", department: "QA", completion: 90 },
  "EMP-3002": { name: "Ravi Joshi", department: "QA", completion: 70 },
};

const initialTrainings = [
  {
    id: 1,
    title: "SOP-001 (Gowning)",
    status: "Completed",
    due: "2026-01-05",
    score: "95%",
  },
  {
    id: 2,
    title: "SOP-014 (Line Clearance)",
    status: "Due Soon",
    due: "2026-01-25",
    score: null,
  },
  {
    id: 3,
    title: "SOP-022 (Batch Record Review)",
    status: "Overdue",
    due: "2026-01-10",
    score: null,
  },
];

// --- SUB-COMPONENT: QUIZ MODAL ---
function QuizModal({ open, onClose, title, onPass }: any) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFinish = () => {
    setSubmitted(false);
    setAnswer("");
    onPass(); // Trigger completion in parent
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <QuizIcon color="primary" />
        Effectiveness Check: {title}
      </DialogTitle>
      <DialogContent>
        {!submitted ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              What is the critical parameter for this step?
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              >
                <FormControlLabel
                  value="A"
                  control={<Radio />}
                  label="Temperature must be < 25°C"
                />
                <FormControlLabel
                  value="B"
                  control={<Radio />}
                  label="Speed must be > 100 rpm"
                />
                <FormControlLabel
                  value="C"
                  control={<Radio />}
                  label="Visual inspection only"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Passed!
            </Typography>
            <Typography>Score: 100%</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!submitted ? (
          <Button
            variant="contained"
            onClick={() => setSubmitted(true)}
            disabled={!answer}
          >
            Submit Answer
          </Button>
        ) : (
          <Button variant="contained" onClick={handleFinish}>
            Close & Update Record
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function EmployeeTrainingProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [trainings, setTrainings] = useState(initialTrainings);
  const [quizOpen, setQuizOpen] = useState(false);
  const [activeTrainingId, setActiveTrainingId] = useState<number | null>(null);

  const emp = employees[id || ""] || {
    name: "Unknown Employee",
    department: "N/A",
    completion: 0,
  };

  // Handlers
  const handleStart = (tId: number) => {
    setActiveTrainingId(tId);
    setQuizOpen(true);
  };

  const handleQuizPass = () => {
    if (activeTrainingId === null) return;
    setTrainings((prev) =>
      prev.map((t) =>
        t.id === activeTrainingId
          ? { ...t, status: "Completed", score: "100%" }
          : t,
      ),
    );
  };

  return (
    <Box>
      <Button onClick={() => navigate(-1)} sx={{ mb: 1 }}>
        &larr; Back to Matrix
      </Button>
      <PageHeader
        title="Employee Training Profile"
        subtitle={`LMS Record for: ${id}`}
        showBack={false}
      />

      {/* Header Card */}
      <Paper
        sx={{
          p: 3,
          mt: 2,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: "primary.main",
            fontSize: "2rem",
          }}
        >
          {emp.name.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={800}>
            {emp.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {emp.department} Department
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mt: 1.5,
              maxWidth: 400,
            }}
          >
            <LinearProgress
              variant="determinate"
              value={emp.completion}
              sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
            />
            <Typography fontWeight={700}>{emp.completion}% Trained</Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* LEFT COL: Actionable Items */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Box
              sx={{ p: 2, bgcolor: "#f8f9fa", borderBottom: "1px solid #eee" }}
            >
              <Typography variant="h6" fontWeight={800}>
                Pending Assignments
              </Typography>
            </Box>
            <List>
              {trainings.filter((t) => t.status !== "Completed").length ===
                0 && (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <CheckCircleIcon color="success" />
                  <Typography>All training complete!</Typography>
                </Box>
              )}

              {trainings
                .filter((t) => t.status !== "Completed")
                .map((t) => (
                  <ListItem
                    key={t.id}
                    divider
                    secondaryAction={
                      <Button
                        variant="contained"
                        size="small"
                        color={t.status === "Overdue" ? "error" : "primary"}
                        startIcon={
                          t.status === "Overdue" ? (
                            <WarningAmberIcon />
                          ) : (
                            <PlayArrowIcon />
                          )
                        }
                        onClick={() => handleStart(t.id)}
                      >
                        {t.status === "Overdue" ? "Retrain" : "Start"}
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography fontWeight={600}>{t.title}</Typography>
                          {t.status === "Overdue" && (
                            <Chip label="OVERDUE" color="error" size="small" />
                          )}
                        </Box>
                      }
                      secondary={`Due Date: ${t.due}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Paper>
        </Grid>

        {/* RIGHT COL: History */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ borderRadius: 3, height: "100%" }}>
            <Box
              sx={{
                p: 2,
                bgcolor: "#f8f9fa",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <HistoryIcon color="action" />
              <Typography variant="h6" fontWeight={800}>
                History
              </Typography>
            </Box>
            <List dense>
              {trainings
                .filter((t) => t.status === "Completed")
                .map((t) => (
                  <ListItem key={t.id} divider>
                    <ListItemText
                      primary={t.title}
                      secondary={
                        <Typography variant="caption" color="success.main">
                          Passed • Score: {t.score}
                        </Typography>
                      }
                    />
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItem>
                ))}
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              On-The-Job (OJT) Tasks
            </Typography>
            <OjtChecklist />
          </Box>
        </Grid>
      </Grid>

      {/* QUIZ MODAL */}
      <QuizModal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        title={
          activeTrainingId
            ? trainings.find((t) => t.id === activeTrainingId)?.title
            : ""
        }
        onPass={handleQuizPass}
      />
    </Box>
  );
}