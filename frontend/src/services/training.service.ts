import { trainingMock } from "../mock/training.mock";
import type { TrainingPlan } from "../types/training.types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const trainingService = {
  // List
  async list(): Promise<TrainingPlan[]> {
    await delay(800);
    return trainingMock;
  },

  // Get Single
  async getById(id: string): Promise<TrainingPlan> {
    await delay(600);
    const item = trainingMock.find((t) => t.id === id);

    if (!item) {
      // ✅ Fallback matching updated interface
      const fallback: TrainingPlan = {
        id,
        title: "Annual GMP Refresher",
        status: "Draft",
        moduleKey: "training",
        
        assignedTo: "All Staff",
        department: "Quality Assurance",
        dueDate: "2026-12-31",
        completionRate: 0,

        method: "Classroom",
        duration: 60,
        passScore: 80,
        objectives: "Refresh knowledge on GMP standards.",
        trainer: "John Doe",
        version: "v2.0",
        totalTrainees: 0,
        
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
    console.log(`Updating Training Plan (${id}):`, data);
    return { id, ...data };
  }
};