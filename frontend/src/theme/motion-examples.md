/**
 * PREMIUM MOTION DESIGN - QUICK REFERENCE
 * Copy-paste patterns for common UI elements
 */

import { motion, transitions, shadows, keyframes } from '../theme/motion';

// ════════════════════════════════════════════════════════
// BUTTONS
// ════════════════════════════════════════════════════════

// Standard Premium Button
<Button
  sx={{
    transition: transitions.button.default,
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: shadows.subtle,
    },
    '&:active': {
      transform: 'translateY(0)',
      transition: transitions.button.press,
    },
  }}
>

// ════════════════════════════════════════════════════════
// CARDS
// ════════════════════════════════════════════════════════

// Interactive Card with Hover
<Paper
  sx={{
    transition: transitions.card.hover,
    boxShadow: shadows.card,
    '&:hover': {
      transform: `translateY(-${motion.distance.small}px)`,
      boxShadow: shadows.cardHover,
      cursor: 'pointer',
    },
  }}
>

// Card with Fade-In Animation
<Paper
  sx={{
    animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth}`,
    ...keyframes.fadeInUp,
  }}
>

// Staggered Card (use in map)
{items.map((item, index) => (
  <Paper
    key={item.id}
    sx={{
      animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth} ${index * 50}ms both`,
      ...keyframes.fadeInUp,
    }}
  />
))}

// ════════════════════════════════════════════════════════
// TABLE ROWS
// ════════════════════════════════════════════════════════

// Premium Table Row
<TableRow
  hover
  sx={{
    cursor: 'pointer',
    transition: transitions.tableRow.hover,
    '&:hover': {
      backgroundColor: '#f8fafc',
    },
  }}
>

// ════════════════════════════════════════════════════════
// ICON BUTTONS
// ════════════════════════════════════════════════════════

// Icon with Micro-Interaction
<IconButton
  sx={{
    transition: transitions.fast,
    '&:hover': {
      color: '#6366F1',
      transform: `translateY(-${motion.distance.micro}px)`,
      backgroundColor: '#F5F7FF',
    },
  }}
>

// ════════════════════════════════════════════════════════
// STATUS CHIPS
// ════════════════════════════════════════════════════════

// Status Chip with Smooth Transitions
<Chip
  sx={{
    transition: transitions.status.change,
  }}
/>

// ════════════════════════════════════════════════════════
// INPUT FIELDS
// ════════════════════════════════════════════════════════

// Premium Text Field
<TextField
  sx={{
    '& .MuiOutlinedInput-root': {
      transition: transitions.fast,
      '&.Mui-focused': {
        boxShadow: shadows.subtle,
      },
    },
  }}
/>

// ════════════════════════════════════════════════════════
// NAVIGATION ITEMS
// ════════════════════════════════════════════════════════

// Sidebar Menu Item
<ListItemButton
  sx={{
    transition: transitions.sidebar.item,
    '&:hover': {
      transform: `translateX(${motion.distance.micro}px)`,
    },
  }}
>

// ════════════════════════════════════════════════════════
// PAGE WRAPPERS
// ════════════════════════════════════════════════════════

// Page with Fade-In
<Box
  sx={{
    animation: `fadeInUp ${motion.duration.slow}ms ${motion.easing.smooth}`,
    ...keyframes.fadeInUp,
  }}
>
  {/* Page content */}
</Box>

// ════════════════════════════════════════════════════════
// MODALS / DIALOGS
// ════════════════════════════════════════════════════════

// Modal Content with Scale-In
<Box
  sx={{
    animation: `scaleIn ${motion.duration.normal}ms ${motion.easing.smooth}`,
    ...keyframes.scaleIn,
  }}
>

// Modal Backdrop
<Box
  sx={{
    transition: transitions.modal.backdrop,
  }}
>

// ════════════════════════════════════════════════════════
// CONTAINERS WITH SCROLL SHADOW
// ════════════════════════════════════════════════════════

const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 10);
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

<Box
  sx={{
    transition: transitions.fast,
    boxShadow: scrolled ? shadows.card : 'none',
  }}
>

// ════════════════════════════════════════════════════════
// LOADING STATES
// ════════════════════════════════════════════════════════

// Skeleton Shimmer
<Box
  sx={{
    ...motionStyles.skeleton,
  }}
/>

// Pulse Animation
<Box
  sx={{
    animation: 'pulse 2s ease-in-out infinite',
    ...keyframes.pulse,
  }}
/>

// ════════════════════════════════════════════════════════
// DROPDOWN MENUS
// ════════════════════════════════════════════════════════

<Menu
  TransitionProps={{
    timeout: motion.duration.normal,
  }}
>

// Menu Item with Hover
<MenuItem
  sx={{
    transition: transitions.fast,
    '&:hover': {
      backgroundColor: '#f8fafc',
    },
  }}
>
