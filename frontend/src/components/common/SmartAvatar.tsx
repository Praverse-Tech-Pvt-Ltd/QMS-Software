import { Box, Chip, Avatar } from "@mui/material";
import { transitions } from "../../theme/motion";

/**
 * Smart Avatar with Gradient Backgrounds
 * Generates unique gradient based on user name
 */

interface SmartAvatarProps {
  name: string;
  size?: number;
  src?: string;
  onClick?: () => void;
}

// Generate consistent color from string
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    ["#667eea", "#764ba2"],
    ["#f093fb", "#f5576c"],
    ["#4facfe", "#00f2fe"],
    ["#43e97b", "#38f9d7"],
    ["#fa709a", "#fee140"],
    ["#30cfd0", "#330867"],
    ["#a8edea", "#fed6e3"],
    ["#ff9a9e", "#fecfef"],
    ["#ffecd2", "#fcb69f"],
    ["#ff6e7f", "#bfe9ff"],
  ];
  
  const index = Math.abs(hash) % colors.length;
  return `linear-gradient(135deg, ${colors[index][0]} 0%, ${colors[index][1]} 100%)`;
}

export default function SmartAvatar({ name, size = 40, src, onClick }: SmartAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar
      src={src}
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        background: !src ? stringToColor(name) : undefined,
        fontSize: size * 0.4,
        fontWeight: 700,
        cursor: onClick ? "pointer" : "default",
        transition: transitions.button.default,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        "&:hover": onClick ? {
          transform: "scale(1.1)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        } : {},
      }}
    >
      {!src && initials}
    </Avatar>
  );
}

/**
 * Avatar Group with Overflow Indicator
 */

interface AvatarGroupProps {
  users: Array<{ name: string; avatar?: string }>;
  max?: number;
  size?: number;
}

export function AvatarGroup({ users, max = 3, size = 32 }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {displayUsers.map((user, index) => (
        <Box
          key={index}
          sx={{
            ml: index > 0 ? -1 : 0,
            transition: transitions.button.default,
            "&:hover": {
              transform: "translateY(-2px)",
              zIndex: 10,
            },
          }}
        >
          <SmartAvatar name={user.name} src={user.avatar} size={size} />
        </Box>
      ))}
      
      {overflow > 0 && (
        <Chip
          label={`+${overflow}`}
          size="small"
          sx={{
            ml: 0.5,
            height: size * 0.7,
            fontSize: size * 0.3,
            fontWeight: 700,
            bgcolor: "#F3F4F6",
            color: "#5C6370",
          }}
        />
      )}
    </Box>
  );
}
