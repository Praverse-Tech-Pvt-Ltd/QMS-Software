import { dmsMock } from "../mock/dms.mock";
import type { DmsDocument } from "../types/dms.types"; // ✅ Import the Type

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dmsService = {
  // ✅ Explicitly return DmsDocument[]
  async list(): Promise<DmsDocument[]> {
    await delay(800);
    return dmsMock as DmsDocument[]; 
  },

  // ✅ Explicitly return a single DmsDocument
  async getById(id: string): Promise<DmsDocument> {
    await delay(600);
    const item = dmsMock.find((d: any) => d.id === id);

    if (!item) {
      // Fallback object must match DmsDocument interface
      const fallback: DmsDocument = {
        id,
        title: "Standard Hygiene Procedure for Zone A",
        status: "Effective",
        type: "SOP",
        updatedAt: new Date().toISOString(), // Required by interface
        version: "v1.1",
        effectiveDate: "2024-01-10",
        description: "This document details the cleaning and gowning procedures...",
        owner: "Quality Assurance",
        nextReview: "2025-01-15",
        approvalRequests: [],
        signatureLog: []
      };
      return fallback;
    }
    
    return item as DmsDocument;
  },

  async create(data: any) {
    await delay(1000);
    return { id: `SOP-${Math.floor(Math.random() * 10000)}`, ...data };
  },

  async update(id: string, data: any) {
    await delay(1000);
    return { id, ...data };
  }
};