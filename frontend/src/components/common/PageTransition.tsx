import { Box } from "@mui/material";
import { ReactNode } from "react";
import { keyframes, motion } from "../../theme/motion";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition Component
 * Wraps pages with a smooth fade-in animation
 * Premium, enterprise-grade motion design
 */
export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <Box
      sx={{
        animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth}`,
        ...keyframes.fadeInUp,
      }}
    >
      {children}
    </Box>
  );
}
