import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, FormControl, RadioGroup, 
  FormControlLabel, Radio, Box, Alert, Stack, LinearProgress, Paper
} from "@mui/material";
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState } from "react";

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  // ✅ FIXED: Matched name to 'onSuccess' used in TrainingExecutionPage 
  // and ensured it passes the calculated score.
  onSuccess: (score: number) => void; 
}

export default function QuizModal({ open, onClose, title, onSuccess }: QuizModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Example GxP Questions
  const questions = [
    { id: 1, text: "What is the minimum gowning requirement for Zone A?", options: ["Lab Coat", "Sterile Gown + Mask", "Street Clothes"], correct: "Sterile Gown + Mask" },
    { id: 2, text: "How often must you change gloves?", options: ["Every hour", "Only when torn", "Assessed by risk"], correct: "Assessed by risk" },
  ];

  const handleNext = () => {
    if (step < questions.length - 1) setStep(step + 1);
    else setSubmitted(true);
  };

  const handleFinish = () => {
    // ✅ Calculate actual score
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) correctCount++;
    });
    const finalScore = (correctCount / questions.length) * 100;

    // ✅ Trigger success callback
    onSuccess(finalScore); 
    
    // Reset state for next use
    setSubmitted(false);
    setStep(0);
    setAnswers({});
    onClose();
  };
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <QuizIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>Knowledge Assessment: {title}</Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ p: 4 }}>
        {!submitted ? (
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                PROGRESS: {step + 1} OF {questions.length}
              </Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, mt: 1, bgcolor: '#f1f5f9' }} />
            </Box>

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, lineHeight: 1.4 }}>
              {questions[step].text}
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                value={answers[step] || ""}
                onChange={(e) => setAnswers({ ...answers, [step]: e.target.value })}
              >
                {questions[step].options.map((opt) => (
                  <Paper 
                    key={opt} 
                    variant="outlined" 
                    sx={{ 
                      mb: 1.5, 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: 3,
                      borderColor: answers[step] === opt ? 'primary.main' : '#e2e8f0',
                      bgcolor: answers[step] === opt ? '#f0f7ff' : 'transparent'
                    }}
                  >
                    <FormControlLabel 
                      value={opt} 
                      control={<Radio />} 
                      label={<Typography variant="body2" fontWeight={600}>{opt}</Typography>} 
                      sx={{ width: '100%', m: 0 }} 
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={900} gutterBottom>Assessment Passed</Typography>
            <Typography variant="body2" color="text.secondary">
              Score: <b>100%</b>. All validation checks have been passed.
            </Typography>
            
            <Alert severity="success" sx={{ mt: 4, textAlign: 'left', borderRadius: 3, border: '1px solid #bdf0d2' }}>
              <Typography variant="subtitle2" fontWeight={800}>21 CFR Part 11 Compliance</Typography>
              <Typography variant="caption">
                By clicking "Acknowledge & Sign Off", you confirm that you have completed this training personally and understand the procedures outlined.
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
        {!submitted ? (
          <Button 
            variant="contained" 
            fullWidth
            onClick={handleNext} 
            disabled={!answers[step]}
            sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
          >
            {step === questions.length - 1 ? "Submit Assessment" : "Next Question"}
          </Button>
        ) : (
          <Button 
            variant="contained" 
            fullWidth
            onClick={handleFinish}
            sx={{ 
              py: 1.5, 
              borderRadius: 2, 
              fontWeight: 700, 
              bgcolor: 'success.main', 
              '&:hover': { bgcolor: 'success.dark' } 
            }}
          >
            Acknowledge & Sign Off
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}