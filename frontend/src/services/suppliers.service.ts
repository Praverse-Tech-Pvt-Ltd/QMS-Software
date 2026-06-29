import api from "./api";

export interface SupplierRecord {
  id: string;
  supplier_code: string;
  name: string;
  category: string;
  status: string;
  country: string;
  contact_name?: string;
  contact_email?: string;
  qualification_status: string;
  qualification_expiry?: string;
  days_to_expiry?: number;
  expiry_status?: "valid" | "expiring_soon" | "expired" | "not_qualified";
  risk_rating?: "Low" | "Medium" | "High" | "Critical";
  created_at: string;
}

export interface ASLEntry {
  id: string;
  supplier: string;
  supplier_name?: string;
  approved_materials: string;
  approval_date: string;
  expiry_date?: string;
  is_current: boolean;
  approved_by_detail?: { full_name: string };
}

export interface Scorecard {
  id: string;
  supplier: string;
  period: string;
  quality_score: number;
  delivery_score: number;
  service_score: number;
  overall_score: number;
  notes?: string;
}

export const suppliersService = {
  async list(params?: Record<string, string>): Promise<SupplierRecord[]> {
    const response = await api.get<SupplierRecord[]>("/suppliers/", { params });
    return response.data;
  },

  async getById(id: string): Promise<SupplierRecord> {
    const response = await api.get<SupplierRecord>(`/suppliers/${id}/`);
    return response.data;
  },

  async create(data: Partial<SupplierRecord>): Promise<SupplierRecord> {
    const response = await api.post<SupplierRecord>("/suppliers/", data);
    return response.data;
  },

  async update(id: string, data: Partial<SupplierRecord>): Promise<SupplierRecord> {
    const response = await api.patch<SupplierRecord>(`/suppliers/${id}/`, data);
    return response.data;
  },

  async transition(id: string, action: string, reason?: string, esig_password?: string) {
    const response = await api.post(`/suppliers/${id}/transition/`, {
      action,
      reason,
      esig_password,
    });
    return response.data;
  },

  async getASL(): Promise<ASLEntry[]> {
    const response = await api.get<ASLEntry[]>("/suppliers/asl/");
    return response.data;
  },

  async getExpiring(): Promise<SupplierRecord[]> {
    const response = await api.get<SupplierRecord[]>("/suppliers/expiring/");
    return response.data;
  },

  async addScorecard(id: string, data: Partial<Scorecard>): Promise<Scorecard> {
    const response = await api.post<Scorecard>(`/suppliers/${id}/scorecard/`, data);
    return response.data;
  },
};
