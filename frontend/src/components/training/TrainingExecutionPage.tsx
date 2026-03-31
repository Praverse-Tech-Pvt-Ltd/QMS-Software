import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSnackbar } from "notistack";

// --- SERVICES ---
import {
  trainingService,
  type TrainingPlan,
  type TrainingAssignment,
} from "../../services/training.service";

// --- COMPONENTS ---
import StatusChip from "../../components/qms/StatusChip"; // ✅ FIXED: Added missing import
import TrainingSignModal from "../../components/training/TrainingSignModal";
import QuizModal from "../../components/training/QuizModal";

export default function TrainingExecutionPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [assignment, setAssignment] = useState<TrainingAssignment | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  // ✅ Data State: Capture quiz score for the final e-signature record
  const [quizScore, setQuizScore] = useState<number>(100);

  const loadData = async () => {
    if (!assignmentId) return;
    try {
      setLoading(true);

      // Fetch user's tasks to find the specific assignment
      const myTasks = await trainingService.getMyAssignments();
      const currentTask = myTasks.find((t) => t.id === Number(assignmentId));

      if (currentTask) {
        setAssignment(currentTask);
        const planData = await trainingService.getById(currentTask.plan);
        setPlan(planData);
      } else {
        enqueueSnackbar("Training assignment not found in your task list.", {
          variant: "warning",
        });
      }
    } catch (err) {
      enqueueSnackbar("Failed to load training materials", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const handleStartCompletion = () => {
    // Determine workflow based on method
    if (plan?.method === "Online" || (plan as any).hasQuiz) {
      setQuizOpen(true);
    } else {
      setSignModalOpen(true);
    }
  };

  // ✅ Triggered after Quiz is passed
  const handleQuizSuccess = (score: number) => {
    setQuizScore(score);
    setQuizOpen(false);

    if (score >= (plan?.passScore || 80)) {
      setSignModalOpen(true);
    } else {
      enqueueSnackbar(
        `Assessment failed (${score}%). Please review and try again.`,
        { variant: "error" },
      );
    }
  };

  const handleFinalSignOff = async (password: string) => {
    if (!assignment) return;
    try {
      await trainingService.completeTraining(
        assignment.id,
        quizScore,
        password,
        "Self-certified completion of training module.",
      );

      enqueueSnackbar("Training record finalized and archived", {
        variant: "success",
      });
      navigate("/training/");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        "E-Signature failed. Please verify your password.";
      enqueueSnackbar(errorMsg, { variant: "error" });
    }
  };

  if (loading)
    return (
      <Box sx={{ p: 10, textAlign: "center" }}>
        <CircularProgress thickness={5} />
        <Typography sx={{ mt: 2, fontWeight: 600 }}>
          Syncing Training Content...
        </Typography>
      </Box>
    );

  if (!plan || !assignment)
    return (
      <Box sx={{ p: 5 }}>
        <Alert severity="error">
          Assignment Reference Invalid. Please contact your training
          coordinator.
        </Alert>
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      <Paper sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0" }}>
        {/* Header Section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={3}
        >
          <Box>
            <Typography
              variant="overline"
              color="primary"
              fontWeight={900}
              letterSpacing={1.2}
            >
              TRAINING EXECUTION
            </Typography>
            <Typography variant="h4" fontWeight={900}>
              {plan.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plan ID: {plan.id} | Version: {plan.version || "1.0"}
            </Typography>
          </Box>
          <StatusChip status={assignment.status} />
        </Stack>

        <Alert
          severity="info"
          variant="outlined"
          sx={{ mb: 4, borderRadius: 3, fontWeight: 500 }}
        >
          Compliance Requirement: Review the materials thoroughly. Your
          electronic signature will certify that you understand the procedures.
        </Alert>

        {/* Content Viewer Placeholder */}
        <Paper
          variant="outlined"
          sx={{
            bgcolor: "#f8fafc",
            p: 4,
            borderRadius: 3,
            minHeight: 500,
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderStyle: "dashed",
            borderWidth: 2,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6" color="text.secondary" fontWeight={700}>
              [ Controlled Document Viewer: {plan.title} ]
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Reference Material:{" "}
              {plan.objectives || "No specific objectives defined."}
            </Typography>
            <Button variant="text" size="small">
              Download PDF for Offline Review
            </Button>
          </Stack>
        </Paper>

        <Divider sx={{ mb: 4 }} />

        {/* Action Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ fontWeight: 700 }}
          >
            Exit to Dashboard
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<CheckCircleIcon />}
            onClick={handleStartCompletion}
            disabled={assignment.status === "COMPLETED"}
            sx={{
              borderRadius: 3,
              px: 6,
              fontWeight: 800,
              boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
            }}
          >
            {assignment.status === "COMPLETED"
              ? "Qualification Recorded"
              : "Sign & Complete Training"}
          </Button>
        </Box>
      </Paper>

      {/* --- MODALS --- */}

      {/* 21 CFR Part 11 Signature Modal */}
      <TrainingSignModal
        open={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        onConfirm={handleFinalSignOff}
        planTitle={plan.title}
      />

      {/* Knowledge Assessment Modal */}
      <QuizModal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        title={plan.title} // ✅ FIXED: Added required title prop
        onSuccess={handleQuizSuccess} // ✅ FIXED: Prop name and logic alignment
      />
    </Box>
  );
}
