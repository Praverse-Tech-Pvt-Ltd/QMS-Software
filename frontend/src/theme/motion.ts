/**
 * PREMIUM MOTION DESIGN SYSTEM
 * Enterprise-grade animation constants for QMS
 * Inspired by: Linear, Stripe, Notion, Vercel
 */

// ────────────────────────────────────────────────────
// TIMING & EASING
// ────────────────────────────────────────────────────

export const motion = {
  // Duration
  duration: {
    instant: 100,
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 400,
  },

  // Easing Functions
  easing: {
    // Primary easing - soft and premium
    smooth: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    
    // Alternative easings
    easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0.0, 1, 1)",
    easeInOut: "cubic-bezier(0.4, 0.0, 0.2, 1)",
    
    // Smooth deceleration
    decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    
    // Sharp movements
    sharp: "cubic-bezier(0.4, 0.0, 0.6, 1)",
  },

  // Distance (translate amounts)
  distance: {
    micro: 2,
    small: 4,
    medium: 8,
    large: 12,
  },
} as const;

// ────────────────────────────────────────────────────
// COMPONENT TRANSITIONS
// ────────────────────────────────────────────────────

export const transitions = {
  // Card interactions
  card: {
    default: `all ${motion.duration.normal}ms ${motion.easing.smooth}`,
    hover: `all ${motion.duration.fast}ms ${motion.easing.smooth}`,
    press: `all ${motion.duration.instant}ms ${motion.easing.sharp}`,
  },

  // Button interactions
  button: {
    default: `all ${motion.duration.fast}ms ${motion.easing.smooth}`,
    press: `transform ${motion.duration.instant}ms ${motion.easing.sharp}`,
  },

  // Input interactions
  input: {
    focus: `all ${motion.duration.normal}ms ${motion.easing.smooth}`,
  },

  // Chip interactions
  chip: {
    default: `all ${motion.duration.fast}ms ${motion.easing.smooth}`,
  },

  // Table rows
  tableRow: {
    hover: `background-color ${motion.duration.fast}ms ${motion.easing.smooth}`,
    select: `all ${motion.duration.normal}ms ${motion.easing.smooth}`,
  },

  // Status changes
  status: {
    change: `all ${motion.duration.normal}ms ${motion.easing.smooth}`,
  },

  // Modal & Dialog
  modal: {
    backdrop: `opacity ${motion.duration.normal}ms ${motion.easing.smooth}`,
    content: `all ${motion.duration.normal}ms ${motion.easing.smooth}`,
  },

  // Tab indicators
  tab: {
    indicator: `all ${motion.duration.normal}ms ${motion.easing.smooth}`,
  },

  // Page transitions
  page: {
    enter: `all ${motion.duration.slow}ms ${motion.easing.smooth}`,
    exit: `all ${motion.duration.fast}ms ${motion.easing.easeIn}`,
  },

  // Sidebar
  sidebar: {
    item: `all ${motion.duration.fast}ms ${motion.easing.smooth}`,
  },

  // Generic
  default: `all ${motion.duration.normal}ms ${motion.easing.smooth}`,
  fast: `all ${motion.duration.fast}ms ${motion.easing.smooth}`,
} as const;

// ────────────────────────────────────────────────────
// ANIMATION KEYFRAMES
// ────────────────────────────────────────────────────

export const keyframes = {
  // Fade in from bottom (page enter)
  fadeInUp: {
    "@keyframes fadeInUp": {
      from: {
        opacity: 0,
        transform: `translateY(${motion.distance.medium}px)`,
      },
      to: {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
  },

  // Fade out to top (page exit)
  fadeOutUp: {
    "@keyframes fadeOutUp": {
      from: {
        opacity: 1,
        transform: "translateY(0)",
      },
      to: {
        opacity: 0,
        transform: `translateY(-${motion.distance.small}px)`,
      },
    },
  },

  // Scale fade in (modal)
  scaleIn: {
    "@keyframes scaleIn": {
      from: {
        opacity: 0,
        transform: "scale(0.98)",
      },
      to: {
        opacity: 1,
        transform: "scale(1)",
      },
    },
  },

  // Number count up (skeleton for future use)
  countUp: {
    "@keyframes countUp": {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },

  // Subtle pulse (loading states)
  pulse: {
    "@keyframes pulse": {
      "0%, 100%": { opacity: 1 },
      "50%": { opacity: 0.5 },
    },
  },

  // Shimmer (skeleton loading)
  shimmer: {
    "@keyframes shimmer": {
      "0%": {
        backgroundPosition: "-1000px 0",
      },
      "100%": {
        backgroundPosition: "1000px 0",
      },
    },
  },

  // Smooth slide down (dropdown)
  slideDown: {
    "@keyframes slideDown": {
      from: {
        opacity: 0,
        transform: `translateY(-${motion.distance.small}px)`,
      },
      to: {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
  },
} as const;

// ────────────────────────────────────────────────────
// SHADOW ELEVATIONS
// ────────────────────────────────────────────────────

export const shadows = {
  subtle: "0 1px 2px rgba(0, 0, 0, 0.04)",
  card: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
  cardHover: "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
  elevated: "0 10px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)",
  modal: "0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)",
} as const;

// ────────────────────────────────────────────────────
// REUSABLE STYLES
// ────────────────────────────────────────────────────

export const motionStyles = {
  // Card with premium hover effect
  interactiveCard: {
    transition: transitions.card.hover,
    cursor: "pointer",
    "&:hover": {
      transform: `translateY(-${motion.distance.small}px)`,
      boxShadow: shadows.cardHover,
    },
    "&:active": {
      transform: `translateY(-${motion.distance.micro}px)`,
      transition: transitions.card.press,
    },
  },

  // Premium button
  interactiveButton: {
    transition: transitions.button.default,
    "&:hover": {
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(0)",
      transition: transitions.button.press,
    },
  },

  // Table row hover
  tableRowHover: {
    transition: transitions.tableRow.hover,
    "&:hover": {
      backgroundColor: "#F7F8FA",
      cursor: "pointer",
    },
  },

  // Smooth fade in on mount
  fadeIn: {
    animation: "fadeInUp 300ms cubic-bezier(0.2, 0.8, 0.2, 1)",
    ...keyframes.fadeInUp,
  },

  // Modal entry animation
  modalEnter: {
    animation: "scaleIn 200ms cubic-bezier(0.2, 0.8, 0.2, 1)",
    ...keyframes.scaleIn,
  },

  // Skeleton shimmer
  skeleton: {
    background: "linear-gradient(90deg, #F7F8FA 0px, #E9ECEF 40px, #F7F8FA 80px)",
    backgroundSize: "1000px 100%",
    animation: "shimmer 2s infinite linear",
    ...keyframes.shimmer,
  },
} as const;

// ────────────────────────────────────────────────────
// SCROLL REVEAL
// ────────────────────────────────────────────────────

export const scrollReveal = {
  // Intersection observer options
  observerOptions: {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  },

  // Element styles before reveal
  hidden: {
    opacity: 0,
    transform: `translateY(${motion.distance.medium}px)`,
  },

  // Element styles after reveal
  visible: {
    opacity: 1,
    transform: "translateY(0)",
    transition: `all ${motion.duration.slow}ms ${motion.easing.smooth}`,
  },
} as const;

// ────────────────────────────────────────────────────
// EXPORT ALL
// ────────────────────────────────────────────────────

export default {
  motion,
  transitions,
  keyframes,
  shadows,
  motionStyles,
  scrollReveal,
};
