import { Paper, Typography, List, ListItem, ListItemIcon, Checkbox, ListItemText, Alert } from "@mui/material";

const CHECKS = [
    "All Action Items completed and verified.",
    "Effectiveness Check performed and passed.",
    "Related SOPs and Training updated.",
    "Attachments/Evidence uploaded.",
];

export default function ClosureChecklist() {
  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 3, bgcolor: '#fcfcfc' }}>
        <Typography variant="h6" fontWeight={800} gutterBottom>
            Closure Verification
        </Typography>
        <List dense>
            {CHECKS.map((check, i) => (
                <ListItem key={i} disablePadding>
                    <ListItemIcon><Checkbox checked /></ListItemIcon>
                    <ListItemText primary={check} />
                </ListItem>
            ))}
        </List>
        <Alert severity="success" sx={{ mt: 2 }}>Ready for Closure Approval</Alert>
    </Paper>
  );
}