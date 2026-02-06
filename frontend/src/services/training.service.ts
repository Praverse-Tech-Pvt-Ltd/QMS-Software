import api from "./api";

// 1. Interfaces matching Backend Models
export interface TrainingAssignment {
  id: number;
  plan: number; // ID of the plan
  user: number; // ID of the user
  due_date: string;
  completion_date?: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE";
  score?: number;
}

export interface TrainingPlan {
  id: number;
  title: string;
  description: string;
  department: string;
  trainer: string;
  method: string;
  duration_minutes: number;
  status: "DRAFT" | "ACTIVE" | "OBSOLETE";
  assignments?: TrainingAssignment[];
  
  // UI Helpers (Optional)
  moduleKey?: "training";
}

// 2. The Service
export const trainingService = {
  // --- Training Plans (The Courses) ---
  
  async list(): Promise<TrainingPlan[]> { // Renamed listPlans to list to match your component
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
    const response = await api.patch(`/training/plans/${id}/`, data);
    return response.data;
  },

  // --- Assignments (The Student's Work) ---

  // Get training assigned to ME (or all if Admin)
  async getMyAssignments() {
    const response = await api.get<TrainingAssignment[]>("/training/assignments/");
    return response.data;
  },

  // Assign a user to a plan
  async assignUserToPlan(planId: number, userId: number, dueDate: string) {
    const response = await api.post(`/training/plans/${planId}/assign/`, {
      user_id: userId,
      due_date: dueDate
    });
    return response.data;
  },

  // Mark as Complete
  async completeTraining(assignmentId: number, score: number = 100) {
    const response = await api.post(`/training/assignments/${assignmentId}/complete/`, {
      score: score
    });
    return response.data;
  }
};