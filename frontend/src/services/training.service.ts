import api from "./api";
import type { WorkflowMeta, WorkflowStatus } from "./workflow.service"; // ✅ Import from merged workflow service

// --- TYPES ---

export interface TrainingAssignment {
  id: number;
  plan: number;         // FK to TrainingPlan
  user: number;         // FK to User
  due_date: string;
  completion_date?: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE";
  score?: number;
}

/**
 * ✅ CONSOLIDATED TRAINING PLAN INTERFACE
 * Merged from training.service.ts and training.types.ts
 */
export interface TrainingPlan extends Omit<Partial<WorkflowMeta>, 'id'> {
  id: number;           // Database PK
  title: string;
  description: string;
  department: string;
  trainer: string;
  status: WorkflowStatus;
  
  // Method mapping
  method: "Classroom" | "Online" | "Read" | string;
  duration_minutes: number;
  
  // UI & Workflow Helpers
  version?: string;
  passScore?: number;
  objectives?: string;
  change_reason?: string;
  updated_at?: string;

  // Analytics Helpers (calculated or retrieved from backend)
  totalTrainees?: number;
  completionRate?: number; // 0-100
  
  moduleKey?: "training";
}

// --- SERVICE LOGIC ---

export const trainingService = {
  // --- Training Plans (Course Definitions) ---

  async list(): Promise<TrainingPlan[]> {
    const response = await api.get<TrainingPlan[]>("/training/plans/");
    return response.data;
  },

  async getById(id: string | number): Promise<TrainingPlan> {
    const response = await api.get<TrainingPlan>(`/training/plans/${id}/`);
    return response.data;
  },

  async create(data: Partial<TrainingPlan>) {
    const response = await api.post("/training/plans/", data);
    return response.data;
  },

  async update(id: string | number, data: Partial<TrainingPlan>) {
    const payload = {
      ...data,
      change_reason: (data as any).change_reason || "Training plan update",
    };
    const response = await api.patch(`/training/plans/${id}/`, payload);
    return response.data;
  },

  // --- Assignments (User Participation) ---

  /**
   * Fetches assignments for the logged-in user
   */
  async getMyAssignments(): Promise<TrainingAssignment[]> {
    const response = await api.get<TrainingAssignment[]>("/training/assignments/");
    return response.data;
  },

  async getHistory() {
    const response = await api.get("/training/history/");
    return response.data;
  },

  /**
   * Creates a new training requirement for a specific user
   */
  async assignUserToPlan(planId: number, userId: number, dueDate: string) {
    const response = await api.post(`/training/plans/${planId}/assign/`, {
      user_id: userId,
      due_date: dueDate,
    });
    return response.data;
  },

  /**
   * Finalizes an assignment with a score (GxP Compliance check)
   */
  async completeTraining(id: number, score: number, signature_password?: string) {
  const response = await api.post(`/training/assignments/${id}/complete/`, {
    score,
    signature_password // Django will verify this matches the logged-in user's password
  });
  return response.data;
}
};