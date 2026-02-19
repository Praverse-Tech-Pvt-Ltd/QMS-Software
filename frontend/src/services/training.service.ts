// src/services/training.service.ts
import api from "./api";
import type { SignatureEntry, WorkflowMeta, WorkflowStatus } from "./workflow.service";
import { type AuditTrailEntry } from "./audit.service";

export interface TrainingAssignment {
  id: number;
  plan: number;
  user: number;
  user_name?: string; // For UI display
  due_date: string;
  completion_date?: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE";
  score?: number;
}

export interface TrainingPlan extends Omit<Partial<WorkflowMeta>, "id"> {
  id: number;
  title: string;
  description: string;
  department: string;
  trainer: string;
  status: WorkflowStatus;
  method: "Classroom" | "Online" | "Read" | string;
  duration_minutes: number;
  version?: string;
  passScore?: number;
  objectives?: string;
  change_reason?: string;
  updated_at?: string;
  totalTrainees?: number;
  audit_trail?: AuditTrailEntry[];
  // ✅ Changed to match WorkflowMeta standard used in other modules
  signatureLog?: SignatureEntry[]; 
  completionRate?: number;
  moduleKey?: "training";
}

export const trainingService = {
  async list(): Promise<TrainingPlan[]> {
    const response = await api.get<TrainingPlan[]>("/training/plans/");
    return response.data;
  },

  async getById(id: string | number): Promise<TrainingPlan> {
    const response = await api.get<TrainingPlan>(`/training/plans/${id}/`);
    return response.data;
  },

  // ✅ NEW: Fetch trainees assigned to this specific plan
  async getAssignmentsByPlan(
    planId: string | number,
  ): Promise<TrainingAssignment[]> {
    const response = await api.get<TrainingAssignment[]>(
      `/training/plans/${planId}/assignments/`,
    );
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
  async getMyAssignments(): Promise<TrainingAssignment[]> {
    const response = await api.get<TrainingAssignment[]>(
      "/training/assignments/my-tasks/",
    );
    return response.data;
  },
  
  async recordCompletion(
    assignmentId: number,
    data: {
      score?: number;
      evidence_url?: string;
      signature_password: string;
      comments?: string;
    },
  ) {
    const response = await api.post(
      `/training/assignments/${assignmentId}/complete/`,
      data,
    );
    return response.data;
  },

  async assignUserToPlan(planId: number, userId: number, dueDate: string) {
    const response = await api.post(`/training/plans/${planId}/assign/`, {
      user_id: userId,
      due_date: dueDate,
    });
    return response.data;
  },

  async initiateRetraining(planId: number, reason: string) {
    const response = await api.post(
      `/training/plans/${planId}/initiate-retraining/`,
      { reason },
    );
    return response.data;
  },

  async completeTraining(
    id: number,
    score: number,
    signature_password?: string,
  ) {
    const response = await api.post(`/training/assignments/${id}/complete/`, {
      score,
      signature_password,
    });
    return response.data;
  },
};
