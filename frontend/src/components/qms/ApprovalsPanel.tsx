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

import type { ApprovalRequest } from "../../services/workflow.service";

// ✅ FIXED: Aligned Mock data with the ApprovalRequest interface
const MOCK_REQUESTS: ApprovalRequest[] = [
  {
    id: '1',
    user_id: 'u1',
    username: 'Alice QA',
    role: 'QA Manager',
    status: 'PENDING',
    requested_at: '2024-03-01'
  },
  {
    id: '2',
    user_id: 'u2',
    username: 'Bob Production',
    role: 'Production Lead',
    status: 'APPROVED', // ✅ Must be uppercase to match type
    requested_at: '2024-02-28'
  }
];

interface ApprovalsPanelProps {
  requests?: ApprovalRequest[];
  canAddReviewer?: boolean;
  onAddReviewer?: () => void;
}

export default function ApprovalsPanel({ 
  requests = MOCK_REQUESTS, 
  canAddReviewer = true,
  onAddReviewer 
}: ApprovalsPanelProps) {

  // ✅ FIXED: Using Uppercase Status strings
  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'error';
    return 'warning'; // PENDING
  };

  const getStatusIcon = (status: string) => {
    if (status === 'APPROVED') return <CheckCircleIcon fontSize="small" />;
    if (status === 'REJECTED') return <CancelIcon fontSize="small" />;
    return <AccessTimeIcon fontSize="small" />;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid #e2e8f0",
        bgcolor: '#fff'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Workflow Approvals
        </Typography>
        
        {canAddReviewer && (
           <Button 
             size="small" 
             startIcon={<AddIcon />} 
             onClick={onAddReviewer}
             variant="outlined"
             sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
           >
             Assign Reviewer
           </Button>
        )}
      </Box>

      {requests.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
          No active approval requests found.
        </Typography>
      ) : (
        <List disablePadding>
          {requests.map((req, index) => {
            const color = getStatusColor(req.status);

            return (
              <Box key={req.id}>
                {index > 0 && <Divider component="li" sx={{ my: 1, borderColor: '#f1f5f9' }} />}
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
                    {/* ✅ Visual feedback based on status */}
                    <Avatar sx={{ 
                        bgcolor: req.status === 'APPROVED' ? '#f0fdf4' : '#fff7ed', 
                        color: req.status === 'APPROVED' ? '#16a34a' : '#ea580c',
                        border: req.status === 'APPROVED' ? '1px solid #bbf7d0' : '1px solid #fed7aa'
                    }}>
                       {req.status === 'APPROVED' ? <CheckCircleIcon /> : <PersonIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {req.username}
                        </Typography>
                        <Chip 
                          label={req.role} 
                          size="small" 
                          variant="outlined" 
                          sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, borderRadius: 1 }} 
                        />
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Chip 
                             icon={getStatusIcon(req.status)}
                             label={req.status} 
                             size="small" 
                             color={color as any}
                             variant={req.status === 'PENDING' ? "outlined" : "filled"}
                             sx={{ height: 20, fontWeight: 700, fontSize: '0.65rem' }}
                           />
                           <Typography variant="caption" color="text.secondary">
                             Requested: {new Date(req.requested_at).toLocaleDateString()}
                           </Typography>
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