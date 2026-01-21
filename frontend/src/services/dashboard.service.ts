import { dashboardKPIs, myTasksMock } from "../mock/dashboard.mock";

export const dashboardService = {
  async getKPIs() {
    return dashboardKPIs;
  },

  async getMyTasks() {
    return myTasksMock;
  },
};
