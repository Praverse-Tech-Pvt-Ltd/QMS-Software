import { Box, Skeleton, Card } from "@mui/material";

/**
 * Reusable skeleton loader components with shimmer effect
 * Better UX than spinners - shows content structure while loading
 */

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === 0 ? "40%" : "15%"}
          height={20}
          animation="wave"
        />
      ))}
    </Box>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #E9ECEF",
      }}
    >
      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="90%" height={16} />
    </Card>
  );
}

// KPI Card Skeleton
export function KpiCardSkeleton() {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #E9ECEF",
      }}
    >
      <Skeleton variant="text" width="50%" height={16} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="30%" height={14} />
    </Card>
  );
}

// Form Field Skeleton
export function FormFieldSkeleton() {
  return (
    <Box sx={{ mb: 2 }}>
      <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
    </Box>
  );
}

// Avatar Skeleton
export function AvatarSkeleton({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      animation="wave"
    />
  );
}

// List Item Skeleton
export function ListItemSkeleton() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <AvatarSkeleton />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="40%" height={16} />
      </Box>
    </Box>
  );
}

// Dashboard Widget Skeleton
export function DashboardWidgetSkeleton() {
  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Skeleton variant="text" width="50%" height={28} sx={{ mb: 2 }} />
      <Box sx={{ display: "grid", gap: 1.5 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Skeleton variant="text" width="80%" height={18} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="50%" height={14} />
          </Box>
        ))}
      </Box>
    </Card>
  );
}

// Page Skeleton (full page loading state)
export function PageSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" height={20} />
      </Box>

      {/* KPI Cards Row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </Box>

      {/* Content Area */}
      <Box sx={{ display: "grid", gap: 2 }}>
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </Box>
    </Box>
  );
}
