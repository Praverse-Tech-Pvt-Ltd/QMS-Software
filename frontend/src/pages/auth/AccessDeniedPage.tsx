import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import { useNavigate } from 'react-router-dom';

const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={3}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 4,
            borderTop: '6px solid #d32f2f' // Error Red
          }}
        >
          <LockPersonIcon sx={{ fontSize: 80, color: '#d32f2f', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Access Restricted
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            You do not have the required permissions to view this resource. 
            This event has been logged for security auditing.
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/')}
            >
              Return to Dashboard
            </Button>
          </Box>

          <Typography variant="caption" sx={{ display: 'block', mt: 4, color: '#999' }}>
            Error Code: 403_FORBIDDEN | Ref: SEC-RBAC
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default AccessDeniedPage;