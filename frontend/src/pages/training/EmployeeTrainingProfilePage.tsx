import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  CircularProgress,
  alpha,
} from "@mui/material";

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import {
  trainingService,
  type TrainingAssignment,
} from "../../services/training.service";
import PageHeader from "../../components/common/PageHeader";

// Icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QuizIcon from "@mui/icons-material/Quiz";
import HistoryIcon from "@mui/icons-material/History";

// --- SUB-COMPONENT: QUIZ MODAL ---
function QuizModal({ open, onClose, title, onPass, isSubmitting }: any) {
  const [answer, setAnswer] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Quiz, 2: E-Sign

  // Reset local state when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep(1);
      setAnswer("");
      setPassword("");
    }
  }, [open]);

  const handleNext = () => setStep(2);

  const handleSign = () => {
    // Passing 100 score (placeholder for actual quiz logic) and the signature password
    onPass(100, password);
  };

  return (
    <Dialog
      open={open}
      onClose={!isSubmitting ? onClose : undefined}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          fontWeight: 800,
          pt: 3,
        }}
      >
        <QuizIcon color="primary" />
        {step === 1 ? `Effectiveness Check: ${title}` : "Legal Certification"}
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        {step === 1 ? (
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, fontWeight: 700, color: "text.primary" }}
            >
              What is the required sanitation contact time for critical surfaces
              per the current SOP revision?
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              >
                <FormControlLabel
                  value="A"
                  control={<Radio />}
                  label="Minimum 30 Seconds"
                />
                <FormControlLabel
                  value="B"
                  control={<Radio />}
                  label="Minimum 2 Minutes (Wet Contact)"
                />
                <FormControlLabel
                  value="C"
                  control={<Radio />}
                  label="Dry wipe immediately after application"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 1 }}>
            <Box
              sx={{
                bgcolor: alpha("#ed6c02", 0.1),
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha("#ed6c02", 0.2)}`,
                mb: 3,
              }}
            >
              <Typography
                variant="body2"
                color="warning.dark"
                sx={{ fontWeight: 600 }}
              >
                By entering your password, you certify that you have read,
                understood, and successfully completed the training for {title}.
                This act constitutes your legally binding electronic signature.
              </Typography>
            </Box>
            <TextField
              fullWidth
              type="password"
              label="Confirm System Password"
              placeholder="Your login password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={isSubmitting}
          sx={{ fontWeight: 700 }}
        >
          Cancel
        </Button>
        {step === 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!answer}
            sx={{ fontWeight: 700, px: 4 }}
          >
            Next: E-Sign
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleSign}
            disabled={!password || isSubmitting}
            sx={{ fontWeight: 700, px: 4 }}
            startIcon={
              isSubmitting && <CircularProgress size={18} color="inherit" />
            }
          >
            {isSubmitting ? "Authenticating..." : "Sign & Complete"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function EmployeeTrainingProfilePage() {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] =
    useState<TrainingAssignment | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Calls /api/training/assignments/my-tasks/
      const data = await trainingService.getMyAssignments();
      setAssignments(data);
    } catch (err) {
      enqueueSnackbar("Failed to synchronize training profile", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleQuizPass = async (score: number, password: string) => {
    if (!activeAssignment) return;

    try {
      setSubmitting(true);
      // ✅ Handshake: Send completion + legal password signature to backend
      await trainingService.completeTraining(
        activeAssignment.id,
        score,
        password,
      );

      enqueueSnackbar("Compliance record updated successfully", {
        variant: "success",
      });
      setQuizOpen(false);
      loadData(); // Refresh to move task from Pending to History
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        "Signature verification failed. Incorrect password.";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 15,
          gap: 2,
        }}
      >
        <CircularProgress thickness={5} />
        <Typography color="text.secondary" fontWeight={600}>
          Loading LMS Profile...
        </Typography>
      </Box>
    );

  const pending = assignments.filter((a) => a.status !== "COMPLETED");
  const history = assignments.filter((a) => a.status === "COMPLETED");

  return (
    <Box>
      <PageHeader
        title="Training & Qualification Profile"
        subtitle={`Employee ID: ${id || "Self"}`}
        showBack
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Pending Actions */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Assigned Learning Tasks
              </Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {pending.length === 0 ? (
                <Box sx={{ p: 6, textAlign: "center" }}>
                  <CheckCircleIcon
                    color="success"
                    sx={{ fontSize: 40, mb: 1 }}
                  />
                  <Typography fontWeight={600} color="text.secondary">
                    All training cycles are currently current.
                  </Typography>
                </Box>
              ) : (
                pending.map((a) => (
                  <ListItem
                    key={a.id}
                    divider
                    sx={{ py: 2, px: 3 }}
                    secondaryAction={
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          setActiveAssignment(a);
                          setQuizOpen(true);
                        }}
                        startIcon={<PlayArrowIcon />}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: "none",
                        }}
                      >
                        Start Training
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={700}>
                          {a.user_details?.first_name ||
                            "SOP-000: Default Title"}
                        </Typography>
                      }
                      secondary={`Deadline: ${new Date(a.due_date).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* History / Completed */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <HistoryIcon color="action" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                History
              </Typography>
            </Box>
            <List dense sx={{ p: 0 }}>
              {history.length === 0 ? (
                <Typography
                  sx={{ p: 4, textAlign: "center", color: "text.disabled" }}
                >
                  No history found.
                </Typography>
              ) : (
                history.map((a) => (
                  <ListItem key={a.id} divider sx={{ py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={700}>
                          {a.user_details?.first_name || "Completed Plan"}
                        </Typography>
                      }
                      secondary={`Score: ${a.score}% • ${a.completion_date}`}
                    />
                    <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <QuizModal
        open={quizOpen}
        onClose={() => !submitting && setQuizOpen(false)}
        title={activeAssignment?.user_details?.first_name || "Required SOP"}
        onPass={handleQuizPass}
        isSubmitting={submitting}
      />
    </Box>
  );
}
