import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

export type ModuleKey =
  | "dashboard"
  | "dms"
  | "training"
  | "training_matrix"
  | "deviations"
  | "capa"
  | "change"
  | "audits"
  | "complaints"
  | "risks"
  | "suppliers"
  | "nonconformance"
  | "oos"
  | "laboratory"
  | "batch_records"
  | "reports"
  | "knowledge";

export type NavItem = {
  key: ModuleKey;
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
};

export const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: <DashboardOutlinedIcon />,
  },

  // --- Quality Events ---
  {
    key: "deviations",
    label: "Deviation / Incident",
    path: "/deviations",
    icon: <ReportProblemOutlinedIcon />,
  },
  {
    key: "capa",
    label: "CAPA",
    path: "/capa",
    icon: <FactCheckOutlinedIcon />,
  },
  {
    key: "nonconformance",
    label: "Non-Conformance",
    path: "/nonconformance",
    icon: <BlockOutlinedIcon />,
  },
  {
    key: "complaints",
    label: "Complaints",
    path: "/complaints",
    icon: <HeadsetMicOutlinedIcon />,
  },

  // --- Laboratory & Production ---
  {
    key: "oos",
    label: "OOS Investigations",
    path: "/oos",
    icon: <ScienceOutlinedIcon />,
  },
  {
    key: "laboratory",
    label: "Laboratory",
    path: "/laboratory",
    icon: <ScienceOutlinedIcon />,
  },
  {
    key: "batch_records",
    label: "Batch Records",
    path: "/batch-records",
    icon: <ArticleOutlinedIcon />,
  },

  // --- Risk & Compliance ---
  {
    key: "risks",
    label: "Risk Register",
    path: "/risks",
    icon: <AssessmentOutlinedIcon />,
  },
  {
    key: "audits",
    label: "Audits",
    path: "/audits",
    icon: <GavelOutlinedIcon />,
  },
  {
    key: "change",
    label: "Change Control",
    path: "/change-control",
    icon: <ChangeCircleOutlinedIcon />,
  },

  // --- Suppliers & DMS ---
  {
    key: "suppliers",
    label: "Supplier Management",
    path: "/suppliers",
    icon: <LocalShippingOutlinedIcon />,
  },
  {
    key: "dms",
    label: "Document Management",
    path: "/dms",
    icon: <DescriptionOutlinedIcon />,
  },

  // --- Training ---
  {
    key: "training",
    label: "Training / LMS",
    path: "/training",
    icon: <SchoolOutlinedIcon />,
    children: [
      {
        key: "training_matrix",
        label: "Training Matrix",
        path: "/training/matrix",
        icon: <ChecklistOutlinedIcon />,
      },
    ],
  },

  // --- Reports & Knowledge ---
  {
    key: "reports",
    label: "Management Review",
    path: "/management-review",
    icon: <BarChartOutlinedIcon />,
  },
  {
    key: "knowledge",
    label: "SOP Knowledge Base",
    path: "/knowledge",
    icon: <AutoAwesomeOutlinedIcon />,
  },
];
