import { 
  Box, Typography, Paper, Tabs, Tab, List, ListItem, ListItemText, Chip, Button, Divider, CircularProgress
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


import { fetchMyTasks } from "../../services/api";

interface Task {
  display_id: string;  // e.g. "CC-2026-001" - WE WILL USE THIS FOR URL
  title: string;
  type: 'CAPA' | 'Change Control' | 'Training' | 'Deviation' | 'Deviation Action';
  status: string;
  due_date?: string;
}

export default function MyTasksPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Task[]>([]); 

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const rawData = await fetchMyTasks();
        
        // ✅ MAP DATA: Ensure we capture the String ID
        const processedData: Task[] = rawData.map((t: any) => {
            // Priority: Explicit string fields > generic 'id' string > fallback
            const stringId = t.change_id || t.capa_id || t.deviation_id || t.document_id || t.id;

            return {
                display_id: stringId, // This is now your navigation ID
                title: t.title,
                type: t.type || "Task",
                status: t.status,
                due_date: t.due_date
            };
        });

        setAllTasks(processedData);
      } catch (error) {
        console.error("Failed to fetch my tasks", error);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  // ✅ NAVIGATION HANDLER: Uses String ID
  const handleTaskClick = (stringId: string, type: string) => {
    if (!stringId) return;

    switch (type) {
      case 'CAPA': 
        navigate(`/capa/${stringId}`);
        break;
      case 'Change Control': 
        navigate(`/change-control/${stringId}`);
        break;
      case 'Training': 
        navigate(`/training/${stringId}`);
        break;
      case 'Deviation': 
        navigate(`/deviations/${stringId}`);
        break;
      default: 
        navigate(`/tasks/${stringId}`);
        break;
    }
  };

  const filteredTasks = {
      approvals: allTasks.filter(t => ['Change Control', 'QA Review', 'Review', 'EVALUATION', 'APPROVAL'].includes(t.type) || ['QA Review', 'Review', 'EVALUATION', 'APPROVAL'].includes(t.status)),
      training: allTasks.filter(t => t.type === 'Training'),
      actions: allTasks.filter(t => t.type === 'CAPA' || t.type === 'Deviation Action'),
  };

  const currentList = tab === 0 ? filteredTasks.approvals : tab === 1 ? filteredTasks.training : filteredTasks.actions;

  const getStatusColor = (status: string) => {
      const s = status ? status.toUpperCase() : "";
      if (s === 'OVERDUE') return "error";
      if (s === 'PENDING' || s === 'REVIEW') return "warning";
      if (s === 'ACTIVE' || s === 'OPEN') return "primary";
      return "default";
  };

  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 3, color: '#1e293b' }}>My Inbox</Typography>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: '#f8fafc' }}>
            <Tab label={`Approvals (${filteredTasks.approvals.length})`} />
            <Tab label={`Training (${filteredTasks.training.length})`} />
            <Tab label={`Actions (${filteredTasks.actions.length})`} />
        </Tabs>

        <List sx={{ p: 0 }}>
            {currentList.map((task) => (
                <div key={task.display_id}>
                    <ListItem 
                        component="div"
                        sx={{ p: 2.5, cursor: 'pointer', '&:hover': { bgcolor: '#f1f5f9' } }}
                        // ✅ Pass string ID to handler
                        onClick={() => handleTaskClick(task.display_id, task.type)}
                    >
                        <ListItemText 
                            primary={<Typography fontWeight={600} color="#334155">{task.title}</Typography>}
                            secondaryTypographyProps={{ component: "div" }}
                            secondary={
                                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                                        {task.display_id} {/* Shows: CAPA-2026-001 */}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">• {task.type}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        • Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No Date"}
                                    </Typography>
                                </Box>
                            }
                        />
                        <Chip label={task.status} color={getStatusColor(task.status) as any} size="small" variant="outlined" />
                        <Button 
                            variant="contained" 
                            size="small" 
                            sx={{ ml: 2 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleTaskClick(task.display_id, task.type);
                            }}
                        >
                            Open
                        </Button>
                    </ListItem>
                    <Divider component="li" />
                </div>
            ))}
        </List>
      </Paper>
    </Box>
  );
}