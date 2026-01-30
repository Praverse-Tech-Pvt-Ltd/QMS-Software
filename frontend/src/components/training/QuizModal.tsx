import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  FormControl, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Box,
  Alert
} from "@mui/material";
import QuizIcon from '@mui/icons-material/Quiz';
import { useState } from "react";

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
}

export default function QuizModal({ open, onClose, title }: QuizModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Mock Questions
  const questions = [
    { id: 1, text: "What is the minimum gowning requirement for Zone A?", options: ["Lab Coat", "Sterile Gown + Mask", "Street Clothes"] },
    { id: 2, text: "How often must you change gloves?", options: ["Every hour", "Only when torn", "Assessed by risk"] },
  ];

  const handleNext = () => {
    if (step < questions.length - 1) {
        setStep(step + 1);
    } else {
        setSubmitted(true);
    }
  };

  const handleFinish = () => {
      setSubmitted(false);
      setStep(0);
      setAnswers({});
      onClose(); // In real app, pass score back
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <QuizIcon color="primary" />
        Effectiveness Check: {title}
      </DialogTitle>
      
      <DialogContent>
        {!submitted ? (
            <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">Question {step + 1} of {questions.length}</Typography>
                <Typography variant="h6" sx={{ mt: 1, mb: 3, fontWeight: 700 }}>
                    {questions[step].text}
                </Typography>

                <FormControl component="fieldset">
                    <RadioGroup
                        value={answers[step] || ""}
                        onChange={(e) => setAnswers({ ...answers, [step]: e.target.value })}
                    >
                        {questions[step].options.map((opt) => (
                            <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} sx={{ mb: 1 }} />
                        ))}
                    </RadioGroup>
                </FormControl>
            </Box>
        ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h5" color="success.main" fontWeight={800} gutterBottom>
                    Passed!
                </Typography>
                <Typography variant="body1">
                    You answered {Object.keys(answers).length}/{questions.length} questions correctly.
                </Typography>
                <Alert severity="success" sx={{ mt: 3, textAlign: 'left' }}>
                    Training record TRN-2024-005 updated to <b>Complete</b>.
                </Alert>
            </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        {!submitted ? (
            <Button 
                variant="contained" 
                onClick={handleNext} 
                disabled={!answers[step]}
            >
                {step === questions.length - 1 ? "Submit" : "Next Question"}
            </Button>
        ) : (
            <Button variant="contained" onClick={handleFinish}>
                Close & Sign Off
            </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}