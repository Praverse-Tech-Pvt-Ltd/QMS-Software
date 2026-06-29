import React from 'react';
import { Box, Typography, Button, Stack} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import { styled, keyframes } from '@mui/material/styles';
import { authService } from '../../services/auth.service';

interface UserProfileCardProps {
  userName?: string;
  userRole?: string;
  userInitials?: string;
  tasksCount?: number;
  pendingCount?: number;
  approvedCount?: number;
  onClose?: () => void;
}

const waveAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Wave = styled(Box)({
  position: 'absolute',
  width: '540px',
  height: '700px',
  opacity: 0.6,
  left: 0,
  top: 0,
  marginLeft: '-50%',
  marginTop: '-70%',
  background: 'linear-gradient(744deg, #af40ff, #5b42f3 60%, #00ddeb)',
  borderRadius: '40%',
  animation: `${waveAnimation} 55s infinite linear`,
  '&:nth-of-type(2)': {
    top: '210px',
    animationDuration: '50s',
  },
  '&:nth-of-type(3)': {
    top: '210px',
    animationDuration: '45s',
  },
});

const PlayingWave = styled(Wave)({
  '&:nth-of-type(1)': {
    animation: `${waveAnimation} 3000ms infinite linear`,
  },
  '&:nth-of-type(2)': {
    animationDuration: '4000ms',
  },
  '&:nth-of-type(3)': {
    animationDuration: '5000ms',
  },
});

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userName = 'Alexander Pierce',
  userRole = 'Chief Quality Officer',
  userInitials = 'AP',
  tasksCount = 12,
  pendingCount = 8,
  approvedCount = 32,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onClose) onClose();
    authService.logout();
  };

  const handleNavigation = (path: string) => {
    if (onClose) onClose();
    navigate(path);
  };

  return (
    <Box
      sx={{
        width: '280px',
        height: '420px',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        background: '#1a1a1a', // Fallback color
        boxShadow: '0px 8px 28px -9px rgba(0,0,0,0.45)',
      }}
    >
      <PlayingWave />
      <PlayingWave />
      <PlayingWave />

      <Box
        sx={{
          position: 'absolute',
          top: '50px',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'white',
          zIndex: 1,
          px: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Profile Initial Circle */}
        <Box
          sx={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            mb: 2,
            fontSize: '24px',
            fontWeight: 800,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          {userInitials}
        </Box>

        <Typography sx={{ fontSize: '18px', fontWeight: 600, mb: 0.5, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          {userRole}
        </Typography>

        <Typography sx={{ fontSize: '13px', fontWeight: 400, textTransform: 'lowercase', opacity: 0.9, mb: 2 }}>
          @{userName.replace(/\s+/g, '').toLowerCase()}
        </Typography>

        {/* Stats Section */}
        <Box sx={{ display: 'flex', width: '100%', py: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.3)', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>{tasksCount}</Typography>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>Tasks</Typography>
          </Box>
          <Box sx={{ flex: 1, borderLeft: '1px solid rgba(255, 255, 255, 0.3)', borderRight: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>{pendingCount}</Typography>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>Pending</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>{approvedCount}</Typography>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>Approved</Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Stack spacing={1} sx={{ width: '100%' }}>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<AccountCircleOutlinedIcon sx={{ fontSize: '16px' }} />}
            onClick={() => handleNavigation('/settings')}
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', textTransform: 'none', fontWeight: 600, fontSize: '12px', border: '1px solid rgba(255, 255, 255, 0.3)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
          >
            My Profile
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<AssignmentIndOutlinedIcon sx={{ fontSize: '16px' }} />}
            onClick={() => handleNavigation('/tasks')}
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', textTransform: 'none', fontWeight: 600, fontSize: '12px', border: '1px solid rgba(255, 255, 255, 0.3)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
          >
            My Tasks
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<LogoutOutlinedIcon sx={{ fontSize: '16px' }} />}
            onClick={handleLogout}
            sx={{ bgcolor: 'rgba(220, 38, 38, 0.8)', textTransform: 'none', fontWeight: 600, fontSize: '12px', '&:hover': { bgcolor: 'rgba(220, 38, 38, 1)' } }}
          >
            Sign Out
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default UserProfileCard;