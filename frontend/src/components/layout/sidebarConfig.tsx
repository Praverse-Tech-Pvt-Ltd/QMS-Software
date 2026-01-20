import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

export type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: <DashboardOutlinedIcon /> },
  { label: "Document Management", path: "/dms", icon: <DescriptionOutlinedIcon /> },
  { label: "Training / LMS", path: "/training", icon: <SchoolOutlinedIcon /> },
  { label: "Deviation / Incident", path: "/deviations", icon: <ReportProblemOutlinedIcon /> },
  { label: "CAPA", path: "/capa", icon: <FactCheckOutlinedIcon /> },
  { label: "Change Control", path: "/change-control", icon: <ChangeCircleOutlinedIcon /> },
];
