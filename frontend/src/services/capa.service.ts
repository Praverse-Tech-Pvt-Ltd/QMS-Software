import { capaMock } from "../mock/capa.mock";
import type { CapaRecord } from "../types/capa.types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const capaService = {
  // List all
  async list(): Promise<CapaRecord[]> {
    await delay(800);
    return capaMock;
  },

  // Get Single
  async getById(id: string): Promise<CapaRecord> {
    await delay(600);
    const item = capaMock.find((c) => c.id === id);

    if (!item) {
      // Fallback Data for Demo
      const fallback: CapaRecord = {
        id,
        title: "Labeling Error Correction",
        status: "Investigation",
        moduleKey: "capa",
        source: "Deviation DEV-042",
        riskLevel: "High",
        type: "Corrective",
        targetDate: "2024-03-01",
        owner: "QA Specialist",
        description: "Incorrect expiration date printed on Batch 4599 due to manual entry error.",
        rootCause: "Human error due to lack of double-check verification step in the SOP.",
        proposedPlan: "Update SOP-005 and retrain staff.",
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