import { changeMock } from "../mock/change.mock";
import type { ChangeRecord } from "../types/change.types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const changeService = {
  // List
  async list(): Promise<ChangeRecord[]> {
    await delay(800);
    return changeMock;
  },

  // Get Single
  async getById(id: string): Promise<ChangeRecord> {
    await delay(600);
    const item = changeMock.find((c) => c.id === id);

    if (!item) {
      // ✅ Fallback matching updated interface
      const fallback: ChangeRecord = {
        id,
        title: "New Change Request",
        status: "Draft",
        moduleKey: "change",
        
        initiator: "Current User",
        department: "Production",
        changeType: "Minor",
        submittedDate: new Date().toISOString().split('T')[0],
        targetDate: "2026-12-31",

        type: "Minor",
        priority: "Low",
        description: "Description of change.",
        owner: "Change Owner",
        
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
    console.log(`Updating Change Control (${id}):`, data);
    return { id, ...data };
  }
};