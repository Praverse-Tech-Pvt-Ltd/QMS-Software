import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

export type NavItem = {
  key: "dashboard" | "dms" | "training" | "deviations" | "capa" | "change";
  label: string;
  path: string;
  icon: React.ReactNode;
};

export const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", path: "/", icon: <DashboardOutlinedIcon /> },
  { key: "dms", label: "Document Management", path: "/dms", icon: <DescriptionOutlinedIcon /> },
  { key: "training", label: "Training / LMS", path: "/training", icon: <SchoolOutlinedIcon /> },
  { key: "deviations", label: "Deviation / Incident", path: "/deviations", icon: <ReportProblemOutlinedIcon /> },
  { key: "capa", label: "CAPA", path: "/capa", icon: <FactCheckOutlinedIcon /> },
  { key: "change", label: "Change Control", path: "/change-control", icon: <ChangeCircleOutlinedIcon /> },
];
