import { 
  Box, Typography, Paper, Tabs, Tab, List, ListItem, ListItemText, Chip, Button, Divider, CircularProgress
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { fetchMyTasks } from "../../services/api";

export default function MyTasksPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<any[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchMyTasks();
        setAllTasks(data);
      } catch (error) {
        console.error("Failed to fetch my tasks", error);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  // ✅ FIXED: Using id and type directly
  const handleTaskClick = (id: string, type: string) => {
    switch (type) {
      case 'CAPA': 
        navigate(`/capa/${id}`);
        break;
      case 'Change Control': 
        navigate(`/change-control/${id}`);
        break;
      case 'Training': 
        navigate(`/training/${id.replace('TRN-', '')}`);
        break;
      case 'Deviation': 
        navigate(`/deviations/${id}`);
        break;
      default: 
        navigate(`/tasks/${id}`);
        break;
    }
  };

  const filteredTasks = {
      approvals: allTasks.filter(t => t.type === 'Change Control' || t.status === 'QA Review' || t.status === 'Review'),
      training: allTasks.filter(t => t.type === 'Training'),
      actions: allTasks.filter(t => t.type === 'CAPA' || t.type === 'Deviation Action'),
  };

  const currentList = tab === 0 ? filteredTasks.approvals : tab === 1 ? filteredTasks.training : filteredTasks.actions;

  const getStatusColor = (status: string) => {
      if (status === 'OVERDUE' || status === 'Overdue') return "error";
      if (status === 'PENDING' || status === 'Pending') return "warning";
      if (status === 'ACTIVE' || status === 'Active') return "primary";
      return "default";
  };

  if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
        </Box>
      );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 3 }}>My Inbox</Typography>

      <Paper sx={{ borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tab label={`Approvals (${filteredTasks.approvals.length})`} />
            <Tab label={`Training (${filteredTasks.training.length})`} />
            <Tab label={`Assigned Actions (${filteredTasks.actions.length})`} />
        </Tabs>

        <List sx={{ p: 0 }}>
            {currentList.map((task) => (
                <div key={task.id}>
                    <ListItem 
                        component="div"
                        sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#f8fafc' },
                            transition: 'background-color 0.2s'
                        }}
                        // ✅ FIXED: Passing id and type explicitly
                        onClick={() => handleTaskClick(task.id, task.type)}
                    >
                        <ListItemText 
                            primary={<Typography fontWeight={600}>{task.title}</Typography>}
                            secondary={
                                <Typography variant="body2" color="text.secondary">
                                    <span style={{ fontWeight: 600 }}>{task.id}</span> • {task.type} • Due: {task.due_date || "N/A"}
                                </Typography>
                            }
                        />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip 
                                label={task.status} 
                                color={getStatusColor(task.status) as any} 
                                size="small" 
                                variant={task.status === 'OVERDUE' ? "filled" : "outlined"}
                                icon={task.status === 'OVERDUE' ? <WarningAmberIcon /> : undefined} 
                            />
                            <Button 
                                variant="contained" 
                                size="small" 
                                disableElevation
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskClick(task.id, task.type);
                                }}
                            >
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