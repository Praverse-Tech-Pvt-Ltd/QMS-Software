// src/services/training.service.ts
import api from "./api";
import type {
  SignatureEntry,
  WorkflowMeta,
  WorkflowStatus,
} from "./workflow.service";
import { type AuditTrailEntry } from "./audit.service";

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

export interface TrainingAssignment {
  id: number;
  status: string;
  due_date: string;
  completion_date?: string;
  score?: number;
  user: number;
  // ✅ Matches your UserSerializer nested inside TrainingAssignmentSerializer
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
    department?: string;
  };
  plan: number;
  quiz_questions?: QuizQuestion[];
  quiz_passed?: boolean;
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
  due_date: string; 
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

  async getAssignmentsByPlan(
    planId: string | number,
  ): Promise<TrainingAssignment[]> {
    // ✅ Change from nested path to query parameter
    const response = await api.get<TrainingAssignment[]>(
      `/training/assignments/?plan=${planId}`,
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
  
  // src/services/training.service.ts

async completeTraining(
  id: number,
  score: number,
  signature_password: string, 
  comments?: string
) {
  const response = await api.post(`/training/assignments/${id}/complete/`, {
    score,
    signature_password,
    comments: comments || "Qualification completed via electronic signature."
  });
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

  async generateQuiz(assignmentId: number): Promise<{ quiz_questions: QuizQuestion[] }> {
    const response = await api.post(`/training/assignments/${assignmentId}/generate-quiz/`);
    return response.data;
  },

  async submitQuiz(
    assignmentId: number,
    answers: number[]
  ): Promise<{ score_percent: number; passed: boolean; correct: boolean[] }> {
    const response = await api.post(`/training/assignments/${assignmentId}/submit-quiz/`, { answers });
    return response.data;
  },
};
