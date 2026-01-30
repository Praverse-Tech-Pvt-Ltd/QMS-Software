import { capaMock } from "../mock/capa.mock";
import type { CapaRecord } from "../types/capa.types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const capaService = {
  // List
  async list(): Promise<CapaRecord[]> {
    await delay(800);
    return capaMock;
  },

  // Get Single
  async getById(id: string): Promise<CapaRecord> {
    await delay(600);
    const item = capaMock.find((c) => c.id === id);

    if (!item) {
      // ✅ Fallback matching updated interface
      const fallback: CapaRecord = {
        id,
        title: "New CAPA Request",
        status: "Draft",
        moduleKey: "capa",
        
        initiator: "Current User",
        department: "Quality Assurance",
        priority: "Medium",
        dueDate: "2026-12-31",
        relatedTo: "N/A",

        source: "Manual",
        riskLevel: "Medium",
        type: "Corrective",
        targetDate: "2026-12-31",
        owner: "QA Lead",
        description: "Description of the issue.",
        rootCause: "TBD",
        proposedPlan: "TBD",
        
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
    console.log(`Updating CAPA (${id}):`, data);
    return { id, ...data };
  }
};