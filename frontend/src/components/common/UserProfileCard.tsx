import React from 'react';
import { Box, Typography, Avatar, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import { styled, keyframes } from '@mui/material/styles';

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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Wave = styled(Box)(({ theme }) => ({
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
}));

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
    localStorage.removeItem('qms_token');
    if (onClose) onClose();
    navigate('/login', { replace: true });
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
        background: 'transparent',
        boxShadow: '0px 8px 28px -9px rgba(0,0,0,0.45)',
      }}
    >
      {/* Animated waves */}
      <PlayingWave />
      <PlayingWave />
      <PlayingWave />

      {/* Profile Info */}
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
        {/* Icon */}
        <Box
          component="svg"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          sx={{ width: '48px', height: '48px', mb: 1.5, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
        >
          <path
            fill="currentColor"
            d="M19.4133 4.89862L14.5863 2.17544C12.9911 1.27485 11.0089 1.27485 9.41368 2.17544L4.58674 4.89862C2.99153 5.7992 2 7.47596 2 9.2763V14.7235C2 16.5238 2.99153 18.2014 4.58674 19.1012L9.41368 21.8252C10.2079 22.2734 11.105 22.5 12.0046 22.5C12.6952 22.5 13.3874 22.3657 14.0349 22.0954C14.2204 22.018 14.4059 21.9273 14.5872 21.8252L19.4141 19.1012C19.9765 18.7831 20.4655 18.3728 20.8651 17.8825C21.597 16.9894 22 15.8671 22 14.7243V9.27713C22 7.47678 21.0085 5.7992 19.4133 4.89862ZM4.10784 14.7235V9.2763C4.10784 8.20928 4.6955 7.21559 5.64066 6.68166L10.4676 3.95848C10.9398 3.69152 11.4701 3.55804 11.9996 3.55804C12.5291 3.55804 13.0594 3.69152 13.5324 3.95848L18.3593 6.68166C19.3045 7.21476 19.8922 8.20928 19.8922 9.2763V9.75997C19.1426 9.60836 18.377 9.53091 17.6022 9.53091C14.7929 9.53091 12.1041 10.5501 10.0309 12.3999C8.36735 13.8847 7.21142 15.8012 6.68783 17.9081L5.63981 17.3165C4.69466 16.7834 4.10699 15.7897 4.10699 14.7235H4.10784ZM10.4676 20.0413L8.60933 18.9924C8.94996 17.0479 9.94402 15.2665 11.4515 13.921C13.1353 12.4181 15.3198 11.5908 17.6022 11.5908C18.3804 11.5908 19.1477 11.6864 19.8922 11.8742V14.7235C19.8922 15.2278 19.7589 15.7254 19.5119 16.1662C18.7615 15.3596 17.6806 14.8528 16.4783 14.8528C14.2136 14.8528 12.3781 16.6466 12.3781 18.8598C12.3781 19.3937 12.4861 19.9021 12.68 20.3676C11.9347 20.5316 11.1396 20.4203 10.4684 20.0413H10.4676Z"
          />
        </Box>

        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 600,
            mb: 0.5,
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          {userRole}
        </Typography>

        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: 400,
            textTransform: 'lowercase',
            color: '#ffffff',
            opacity: 1,
            textShadow: '0 2px 6px rgba(0,0,0,0.4)',
            mb: 2,
          }}
        >
          {userName.replace(/\s+/g, '')}
        </Typography>

        {/* Stats Section */}
        <Box
          sx={{
            display: 'flex',
            gap: 0,
            width: '100%',
            py: 1.5,
            borderTop: '1px solid rgba(255, 255, 255, 0.4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)', fontSize: '20px' }}>
              {tasksCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#ffffff', opacity: 1, fontSize: '10px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              Tasks
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              textAlign: 'center',
              borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
              borderRight: '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)', fontSize: '20px' }}>
              {pendingCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#ffffff', opacity: 1, fontSize: '10px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              Pending
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)', fontSize: '20px' }}>
              {approvedCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#ffffff', opacity: 1, fontSize: '10px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              Approved
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<AccountCircleOutlinedIcon fontSize="small" />}
            onClick={() => handleNavigation('/settings')}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12px',
              py: 0.75,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            My Profile
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<AssignmentIndOutlinedIcon fontSize="small" />}
            onClick={() => handleNavigation('/settings')}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12px',
              py: 0.75,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            My Tasks
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<LogoutOutlinedIcon fontSize="small" />}
            onClick={handleLogout}
            sx={{
              bgcolor: 'rgba(220, 38, 38, 0.8)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12px',
              py: 0.75,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                bgcolor: 'rgba(220, 38, 38, 1)',
              },
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfileCard;
