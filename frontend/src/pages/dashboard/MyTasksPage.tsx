import { 
  Box, Typography, Paper, Tabs, Tab, List, ListItem, ListItemText, Chip, Button, Divider 
} from "@mui/material";
import { useState } from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function MyTasksPage() {
  const [tab, setTab] = useState(0);

  const TASKS = {
      approvals: [
          // ✅ FIX: Added optional 'status' property to satisfy TS
          { id: 1, title: "SOP-001: Hygiene Proc v2.0", type: "Document Approval", due: "Today", status: "Pending" },
          { id: 2, title: "CAPA-009 Plan Review", type: "CAPA Approval", due: "Tomorrow", status: "Pending" },
      ],
      training: [
          { id: 3, title: "Annual GMP Refresher", type: "Training", due: "Overdue", status: "Overdue" },
          { id: 4, title: "New SOP-022 Read & Understand", type: "Training", due: "Jan 25", status: "Pending" },
      ],
      actions: [
          // ✅ FIX: Added optional 'status' property
          { id: 5, title: "Investigate DEV-042", type: "Deviation Action", due: "Feb 10", status: "Open" },
          { id: 6, title: "Update Calibration Record", type: "Task", due: "Feb 12", status: "Open" },
      ]
  };

  // Helper to safely get the current list
  const currentList = tab === 0 ? TASKS.approvals : tab === 1 ? TASKS.training : TASKS.actions;

  return (
    <Box>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 3 }}>My Inbox</Typography>

      <Paper sx={{ borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tab label={`Approvals (${TASKS.approvals.length})`} />
            <Tab label={`Training (${TASKS.training.length})`} />
            <Tab label={`Assigned Actions (${TASKS.actions.length})`} />
        </Tabs>

        <List sx={{ p: 0 }}>
            {currentList.map((task) => (
                <div key={task.id}>
                    <ListItem sx={{ p: 2 }}>
                        <ListItemText 
                            primary={<Typography fontWeight={600}>{task.title}</Typography>}
                            secondary={`${task.type} • Due: ${task.due}`}
                        />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {/* Now TS knows 'status' exists on all task items */}
                            {task.status === 'Overdue' && <Chip label="Overdue" color="error" size="small" icon={<WarningAmberIcon />} />}
                            <Button variant="contained" size="small" disableElevation>
                                {tab === 0 ? "Review" : tab === 1 ? "Start" : "Open"}
                            </Button>
                        </Box>
                    </ListItem>
                    <Divider />
                </div>
            ))}
            
            {currentList.length === 0 && (
                <Box sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
                    <CheckCircleIcon fontSize="large" color="success" sx={{ mb: 1, opacity: 0.5 }} />
                    <Typography>All caught up! No tasks here.</Typography>
                </Box>
            )}
        </List>
      </Paper>
    </Box>
  );
}