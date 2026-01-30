// src/services/change.service.ts
import { changeMock } from "../mock/change.mock";
import type { ChangeRecord } from "../types/change.types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const changeService = {
  async list(): Promise<ChangeRecord[]> {
    await delay(800);
    return changeMock;
  },

  async getById(id: string): Promise<ChangeRecord> {
    await delay(600);
    const item = changeMock.find((c) => c.id === id);

    if (!item) {
      // ✅ Fallback now satisfies the extended interface
      const fallback: ChangeRecord = {
        id,
        title: "Installation of High-Speed Blender",
        status: "Impact Assessment", // Valid WorkflowStatus
        moduleKey: "change",        // ✅ REQUIRED by WorkflowMeta
        
        type: "Major",
        priority: "High",
        department: "Engineering",
        description: "Capacity expansion project for Q3.",
        owner: "Jane Engineer",
        targetDate: "2024-06-01",
        
        approvalRequests: [],
        signatureLog: [],
        approvalsLog: []            // ✅ REQUIRED by WorkflowMeta
      };
      return fallback;
    }
    return item;
  },

  async update(id: string, data: any) {
    await delay(1000);
    return { id, ...data };
  }
};