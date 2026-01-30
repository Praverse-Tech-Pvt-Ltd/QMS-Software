import { deviationsMock } from "../mock/deviations.mock";
import type { DeviationRecord } from "../types/deviation.types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const deviationsService = {
  // List
  async list(): Promise<DeviationRecord[]> {
    await delay(800);
    return deviationsMock;
  },

  // Get Single
  async getById(id: string): Promise<DeviationRecord> {
    await delay(600);
    const item = deviationsMock.find((d) => d.id === id);

    if (!item) {
      // ✅ Fallback matching updated interface
      const fallback: DeviationRecord = {
        id,
        title: "New Deviation Request",
        status: "Draft",
        moduleKey: "deviations",
        
        severity: "Minor",
        reportedBy: "Current User",
        department: "Production",
        reportedDate: new Date().toISOString().split('T')[0],

        type: "General",
        description: "Description of the deviation.",
        location: "Plant A",
        immediateAction: "None",
        
        approvalRequests: [],
        signatureLog: [],
        approvalsLog: []
      };
      return fallback;
    }
    return item;
  },

  // Update
  async update(id: string, data: any) {
    await delay(1000);
    console.log(`Updating Deviation (${id}):`, data);
    return { id, ...data };
  }
};