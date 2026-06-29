import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  LinearProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Card,
  CardContent,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CheckIcon from "@mui/icons-material/Check";
import { aiService } from "../../services/ai.service";

interface Question {
  id: string;
  text: string;
  field: string;
  type: "text" | "choice" | "scale" | "number" | "date_range";
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
}

interface AIQuestionnaireProps {
  module: string;
  eventType?: string;
  onComplete: (answers: Record<string, string>) => void;
  onPrefill?: (prefill: Record<string, string>) => void;
}

export default function AIQuestionnaire({
  module,
  eventType = "",
  onComplete,
  onPrefill,
}: AIQuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [started, setStarted] = useState(false);

  const fetchNextQuestion = async (updatedAnswers: Record<string, string>) => {
    setLoading(true);
    try {
      const data = await aiService.getNextQuestions(module, eventType, updatedAnswers);
      if (data.complete || data.next_questions.length === 0) {
        setComplete(true);
        onComplete(updatedAnswers);
        if (onPrefill && data.prefill) {
          onPrefill(data.prefill);
        }
      } else {
        setCurrentQuestion(data.next_questions[0]);
        setCurrentAnswer("");
        setQuestionCount((c) => c + 1);
      }
    } catch {
      // Silently degrade — questionnaire becomes optional
      setComplete(true);
      onComplete(updatedAnswers);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
    fetchNextQuestion({});
  };

  const handleNext = () => {
    if (!currentQuestion || !currentAnswer) return;
    const updatedAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(updatedAnswers);
    fetchNextQuestion(updatedAnswers);
  };

  if (!started) {
    return (
      <Card sx={{ border: "1px solid #E9ECEF", borderRadius: 3, bgcolor: "#FAFBFC" }}>
        <CardContent sx={{ textAlign: "center", py: 3 }}>
          <AutoAwesomeIcon sx={{ color: "#667eea", fontSize: 36, mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            AI-Guided Intake
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Answer a few quick questions and the AI will pre-fill the form for you.
          </Typography>
          <Button
            variant="contained"
            onClick={handleStart}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}
          >
            Start AI Questionnaire
          </Button>
          <Button variant="text" onClick={() => onComplete({})} sx={{ ml: 1 }}>
            Skip
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (complete) {
    return (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <CheckIcon sx={{ color: "#10B981", fontSize: 36, mb: 1 }} />
        <Typography variant="subtitle2" fontWeight={700} color="#10B981">
          Questionnaire complete!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {questionCount} questions answered. Form has been pre-filled.
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ border: "1px solid #C7D2FE", borderRadius: 3, bgcolor: "#FAFBFC" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AutoAwesomeIcon sx={{ color: "#667eea", fontSize: 18 }} />
          <Typography variant="caption" fontWeight={700} color="#667eea">
            AI Questionnaire — Question {questionCount + 1}
          </Typography>
        </Box>

        {loading ? (
          <LinearProgress sx={{ borderRadius: 2, mb: 2 }} />
        ) : currentQuestion ? (
          <Box>
            <Typography variant="body2" fontWeight={600} mb={1.5}>
              {currentQuestion.text}
            </Typography>

            {currentQuestion.type === "choice" && currentQuestion.options && (
              <RadioGroup value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)}>
                {currentQuestion.options.map((opt) => (
                  <FormControlLabel
                    key={opt}
                    value={opt}
                    control={<Radio size="small" sx={{ color: "#667eea", "&.Mui-checked": { color: "#667eea" } }} />}
                    label={<Typography variant="body2">{opt}</Typography>}
                  />
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "text" && (
              <TextField
                fullWidth
                size="small"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Enter your answer..."
                multiline
                rows={2}
              />
            )}

            {currentQuestion.type === "scale" && (
              <Box sx={{ px: 1 }}>
                <Slider
                  value={Number(currentAnswer) || currentQuestion.min || 1}
                  onChange={(_, v) => setCurrentAnswer(String(v))}
                  min={currentQuestion.min || 1}
                  max={currentQuestion.max || 5}
                  step={1}
                  marks
                  valueLabelDisplay="on"
                  sx={{ color: "#667eea" }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">Low ({currentQuestion.min})</Typography>
                  <Typography variant="caption" color="text.secondary">High ({currentQuestion.max})</Typography>
                </Box>
              </Box>
            )}

            {currentQuestion.type === "number" && (
              <TextField
                type="number"
                size="small"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                inputProps={{ min: 0 }}
              />
            )}

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                endIcon={<NavigateNextIcon />}
                onClick={handleNext}
                disabled={!currentAnswer}
                sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a6fd8" } }}
              >
                Next
              </Button>
            </Box>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}
