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
  type QuizQuestion,
} from "../../services/training.service";
import PageHeader from "../../components/common/PageHeader";

// Icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QuizIcon from "@mui/icons-material/Quiz";
import HistoryIcon from "@mui/icons-material/History";

type QuizStep = "generate" | "quiz" | "result" | "esign";

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  assignmentId: number | undefined;
  onPass: (score: number, password: string) => void;
  isSubmitting: boolean;
}

// --- SUB-COMPONENT: QUIZ MODAL ---
function QuizModal({ open, onClose, title, assignmentId, onPass, isSubmitting }: QuizModalProps) {
  const [step, setStep] = useState<QuizStep>("generate");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score_percent: number; passed: boolean } | null>(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) {
      setStep("generate");
      setGenerating(false);
      setGenerateError(null);
      setQuestions([]);
      setCurrentQ(0);
      setSelectedAnswers([]);
      setResult(null);
      setPassword("");
    }
  }, [open]);

  const handleGenerateQuiz = async () => {
    if (!assignmentId) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await trainingService.generateQuiz(assignmentId);
      setQuestions(res.quiz_questions);
      setSelectedAnswers(new Array(res.quiz_questions.length).fill(-1));
      setStep("quiz");
    } catch (err: any) {
      setGenerateError(err.response?.data?.error || "Quiz generation failed. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectAnswer = (index: number) => {
    const next = [...selectedAnswers];
    next[currentQ] = index;
    setSelectedAnswers(next);
  };

  const handleSubmitQuiz = async () => {
    if (!assignmentId) return;
    setSubmitting(true);
    try {
      const res = await trainingService.submitQuiz(assignmentId, selectedAnswers);
      setResult(res);
      setStep("result");
    } catch {
      setGenerateError("Quiz submission failed. Try again.");
      setStep("generate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setStep("generate");
    setQuestions([]);
    setCurrentQ(0);
    setSelectedAnswers([]);
    setResult(null);
  };

  const handleSign = () => {
    onPass(result?.score_percent ?? 0, password);
  };

  return (
    <Dialog
      open={open}
      onClose={!isSubmitting && !submitting ? onClose : undefined}
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
        {step === "esign" ? "Legal Certification" : `Effectiveness Check: ${title}`}
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        {step === "generate" && (
          <Box sx={{ textAlign: "center", py: 2 }}>
            {generateError && (
              <Typography color="error" sx={{ mb: 2 }}>{generateError}</Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Generate a comprehension quiz from the SOP content for this training.
            </Typography>
            <Button
              variant="contained"
              onClick={handleGenerateQuiz}
              disabled={generating}
              startIcon={generating && <CircularProgress size={16} color="inherit" />}
            >
              {generating ? "Generating..." : "Generate Quiz"}
            </Button>
          </Box>
        )}

        {step === "quiz" && questions.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Question {currentQ + 1} of {questions.length}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ mt: 1, mb: 2, fontWeight: 700, color: "text.primary" }}
            >
              {questions[currentQ].question}
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedAnswers[currentQ] >= 0 ? String(selectedAnswers[currentQ]) : ""}
                onChange={(e) => handleSelectAnswer(Number(e.target.value))}
              >
                {questions[currentQ].options.map((opt, i) => (
                  <FormControlLabel key={i} value={String(i)} control={<Radio />} label={opt} />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {step === "result" && result && (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h5" fontWeight={800} color={result.passed ? "success.main" : "error.main"}>
              {result.passed ? "Quiz Passed" : "Quiz Failed"}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Score: {result.score_percent}% ({result.passed ? "≥" : "<"} 80% required)
            </Typography>
            {!result.passed && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You need 80% to pass. Try again.
              </Typography>
            )}
          </Box>
        )}

        {step === "esign" && (
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
          disabled={isSubmitting || submitting}
          sx={{ fontWeight: 700 }}
        >
          Cancel
        </Button>
        {step === "quiz" && currentQ < questions.length - 1 && (
          <Button
            variant="contained"
            onClick={() => setCurrentQ(currentQ + 1)}
            disabled={selectedAnswers[currentQ] < 0}
            sx={{ fontWeight: 700, px: 4 }}
          >
            Next Question
          </Button>
        )}
        {step === "quiz" && currentQ === questions.length - 1 && (
          <Button
            variant="contained"
            onClick={handleSubmitQuiz}
            disabled={selectedAnswers[currentQ] < 0 || submitting}
            startIcon={submitting && <CircularProgress size={16} color="inherit" />}
            sx={{ fontWeight: 700, px: 4 }}
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        )}
        {step === "result" && !result?.passed && (
          <Button variant="contained" onClick={handleRetry} sx={{ fontWeight: 700, px: 4 }}>
            Retry
          </Button>
        )}
        {step === "result" && result?.passed && (
          <Button variant="contained" color="success" onClick={() => setStep("esign")} sx={{ fontWeight: 700, px: 4 }}>
            Next: E-Sign
          </Button>
        )}
        {step === "esign" && (
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
        assignmentId={activeAssignment?.id}
        onPass={handleQuizPass}
        isSubmitting={submitting}
      />
    </Box>
  );
}
