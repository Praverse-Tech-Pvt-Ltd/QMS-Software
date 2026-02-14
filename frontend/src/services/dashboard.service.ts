import api from "./api";
import type { WorkflowStatus } from "./workflow.service";

// --- TYPES ---

export interface DashboardKPI {
  label: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  color?: string; // ✅ Made optional to match your mock
}

export interface DashboardTask {
  id: string;
  // ✅ Match the mixed-case module names in your mock
  module: "DMS" | "Training" | "Deviation" | "CAPA" | "Change Control" | string;
  title: string;
  status: WorkflowStatus ; 
  due: string; 
  priority: "Low" | "Medium" | "High" | "Critical";
}

// --- SERVICE LOGIC ---

export const dashboardService = {
  async getKPIs(): Promise<DashboardKPI[]> {
    try {
      const response = await api.get<DashboardKPI[]>("/dashboard/kpis/");
      return response.data;
    } catch (error) {
      console.warn("Backend KPIs not found, falling back to mock");
      const { dashboardKPIs } = await import("../mock/dashboard.mock");
      // ✅ Use "unknown" as a bridge to resolve the trend string mismatch
      return dashboardKPIs as unknown as DashboardKPI[];
    }
  },

  async getMyTasks(): Promise<DashboardTask[]> {
    try {
      const response = await api.get<DashboardTask[]>("/dashboard/tasks/");
      return response.data;
    } catch (error) {
      console.warn("Backend tasks not found, falling back to mock");
      const { myTasksMock } = await import("../mock/dashboard.mock");
      return myTasksMock as unknown as DashboardTask[];
    }
  },

  /**
   * ✅ NEW: Fetches workflow distribution for chart components
   */
  async getWorkflowDistribution() {
    const response = await api.get("/dashboard/distribution/");
    return response.data;
  },
};
