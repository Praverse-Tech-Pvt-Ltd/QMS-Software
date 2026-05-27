import { Box, Typography, Button, Divider } from "@mui/material";
import { useState } from "react";

// Import all new components
import {
  CardSkeleton,
  KpiCardSkeleton,
} from "../common/SkeletonLoader";
import EmptyState from "../common/EmptyState";
import ValidatedInput, { PasswordStrength } from "../common/ValidatedInput";
import { useToast } from "../common/Toast";
import SmartAvatar, { AvatarGroup } from "../common/SmartAvatar";
import RelativeTime, { StatusBadge, CopyButton } from "../common/MicroComponents";
import EnhancedStatusChip from "../common/EnhancedStatusChip";
import DarkModeToggle from "../common/DarkModeToggle";
import Breadcrumb from "../common/Breadcrumb";
import { useLoadingBar } from "../common/LoadingBar";

import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DescriptionIcon from "@mui/icons-material/Description";

/**
 * UI Components Showcase Page
 * Demonstrates all new premium UI components
 * Navigate to /ui-showcase to view
 */

export default function UIShowcase() {
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const loadingBar = useLoadingBar();

  const demoUsers = [
    { name: "Alice Johnson" },
    { name: "Bob Smith" },
    { name: "Charlie Brown" },
    { name: "Diana Prince" },
  ];

  const handleTestToast = () => {
    toast.success("This is a success toast!", {
      title: "Success",
      action: {
        label: "Undo",
        onClick: () => toast.info("Undo clicked!"),
      },
      showProgress: true,
    });
  };

  const handleTestLoading = () => {
    loadingBar.start();
    setTimeout(() => loadingBar.complete(), 2000);
  };

  return (
    <Box>
      <toast.ToastComponent />

      <Breadcrumb />

      <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
        UI Components Showcase
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        Preview of all premium UI enhancements
      </Typography>

      {/* Section 1: Skeleton Loaders */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Skeleton Loaders
        </Typography>
        <Button variant="outlined" onClick={() => setShowSkeletons(!showSkeletons)} sx={{ mb: 2 }}>
          Toggle Skeletons
        </Button>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <Box>
            {showSkeletons ? <CardSkeleton /> : <Box sx={{ p: 3, border: "1px solid #E9ECEF", borderRadius: 2 }}>
              <Typography variant="h6">Card Content</Typography>
              <Typography variant="body2" color="text.secondary">This is loaded content</Typography>
            </Box>}
          </Box>
          <Box>
            {showSkeletons ? <KpiCardSkeleton /> : <Box sx={{ p: 3, border: "1px solid #E9ECEF", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">METRIC</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>1,234</Typography>
            </Box>}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Section 2: Empty States */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Empty States
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
          <EmptyState
            variant="default"
            icon={<FolderOpenIcon sx={{ fontSize: 40 }} />}
            title="No items"
            description="Default variant with floating animation"
          />
          <EmptyState
            variant="minimal"
            title="Minimal"
            description="Compact version"
          />
          <EmptyState
            variant="illustrated"
            icon={<DescriptionIcon sx={{ fontSize: 40, color: "#FFF" }} />}
            title="Illustrated"
            description="With gradient styling"
            actionLabel="Get Started"
            onAction={() => toast.info("Action clicked!")}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Section 3: Form Inputs */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Validated Inputs
        </Typography>
        <Box sx={{ maxWidth: 500 }}>
          <ValidatedInput
            label="Email Address"
            value={email}
            onChange={setEmail}
            success={email.includes("@")}
            error={email && !email.includes("@") ? "Invalid email" : undefined}
            helperText="Enter a valid email address"
          />
          <ValidatedInput
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
          />
          <PasswordStrength password={password} />
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Section 4: Status Chips */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Enhanced Status Chips
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <EnhancedStatusChip status="Draft" showIcon />
          <EnhancedStatusChip status="Pending Review" showIcon />
          <EnhancedStatusChip status="Approved" showIcon />
          <EnhancedStatusChip status="Rejected" showIcon />
          <EnhancedStatusChip status="In Progress" showIcon />
          <EnhancedStatusChip status="Completed" showIcon />
          <EnhancedStatusChip status="Overdue" showIcon />
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Section 5: Avatars */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Smart Avatars
        </Typography>
        <Box sx={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Single Avatar
            </Typography>
            <SmartAvatar name="John Doe" size={48} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Avatar Group
            </Typography>
            <AvatarGroup users={demoUsers} max={3} size={40} />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Section 6: Micro Components */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Micro Components
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Relative Time
            </Typography>
            <RelativeTime date={new Date(Date.now() - 2 * 60 * 60 * 1000)} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Status Badge
            </Typography>
            <StatusBadge status="online" label="Online" showPulse />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Copy Button
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">DOC-12345</Typography>
              <CopyButton text="DOC-12345" />
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Section 7: Actions */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Interactive Actions
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button variant="contained" onClick={handleTestToast}>
            Show Toast
          </Button>
          <Button variant="outlined" onClick={handleTestLoading}>
            Test Loading Bar
          </Button>
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            Dark Mode:
            <DarkModeToggle />
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
          Press Cmd+K (Mac) or Ctrl+K (Windows) to open Command Palette
        </Typography>
      </Box>
    </Box>
  );
}
