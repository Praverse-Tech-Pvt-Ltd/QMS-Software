import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Chip, 
  IconButton, 
  Button, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider,
  
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import type { ApprovalRequest } from "../../types/workflow.types";

// Mock data generator for display purposes if requests are empty
const MOCK_REQUESTS: ApprovalRequest[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'Alice QA',
    role: 'QA Manager',
    stepName: 'QA Review',
    assignedDate: '2024-03-01',
    dueDate: '2024-03-05', // Due soon
    status: 'Pending'
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'Bob Production',
    role: 'Production Lead',
    stepName: 'Impact Assessment',
    assignedDate: '2024-02-28',
    dueDate: '2024-03-01', // Overdue
    status: 'Approved',
    completedDate: '2024-02-29'
  }
];

interface ApprovalsPanelProps {
  requests?: ApprovalRequest[]; // Real data
  canAddReviewer?: boolean;     // Permission check
  onAddReviewer?: () => void;   // Handler
}

export default function ApprovalsPanel({ 
  requests = MOCK_REQUESTS, 
  canAddReviewer = true,
  onAddReviewer 
}: ApprovalsPanelProps) {

  // Helper to get status color
  const getStatusColor = (status: string, dueDate?: string) => {
    if (status === 'Approved') return 'success';
    if (status === 'Rejected') return 'error';
    
    // Check overdue logic for pending items
    if (dueDate && new Date(dueDate) < new Date()) return 'error'; // Overdue
    return 'warning'; // Pending
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Approved') return <CheckCircleIcon fontSize="small" />;
    if (status === 'Rejected') return <CancelIcon fontSize="small" />;
    return <AccessTimeIcon fontSize="small" />;
  };

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        bgcolor: '#fff'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Approvals & Reviewers
        </Typography>
        
        {canAddReviewer && (
           <Button 
             size="small" 
             startIcon={<AddIcon />} 
             onClick={onAddReviewer}
             variant="outlined"
             sx={{ borderRadius: 2, textTransform: 'none' }}
           >
             Assign
           </Button>
        )}
      </Box>

      {requests.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No active approvals. Workflow is in draft or open state.
        </Typography>
      ) : (
        <List disablePadding>
          {requests.map((req, index) => {
            const isOverdue = req.status === 'Pending' && req.dueDate && new Date(req.dueDate) < new Date();
            const color = getStatusColor(req.status, req.dueDate);

            return (
              <Box key={req.id}>
                {index > 0 && <Divider variant="inset" component="li" />}
                <ListItem 
                  alignItems="flex-start"
                  secondaryAction={
                    <IconButton edge="end" size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{ px: 0 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: req.status === 'Approved' ? '#e8f5e9' : '#fff3e0', color: req.status === 'Approved' ? '#2e7d32' : '#ef6c00' }}>
                       {req.status === 'Approved' ? <CheckCircleIcon /> : <PersonIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {req.userName}
                        </Typography>
                        <Chip 
                          label={req.role} 
                          size="small" 
                          variant="outlined" 
                          sx={{ height: 20, fontSize: '0.65rem' }} 
                        />
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                           Step: {req.stepName}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Chip 
                             icon={getStatusIcon(req.status)}
                             label={isOverdue ? "Overdue" : req.status} 
                             size="small" 
                             color={color as any}
                             variant={req.status === 'Pending' ? "outlined" : "filled"}
                             sx={{ height: 20, '& .MuiChip-label': { px: 1 } }}
                           />
                           {req.dueDate && (
                             <Typography variant="caption" color={isOverdue ? "error.main" : "text.secondary"}>
                               Due: {new Date(req.dueDate).toLocaleDateString()}
                             </Typography>
                           )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </Box>
            );
          })}
        </List>
      )}
    </Paper>
  );
}