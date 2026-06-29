import api from "./api";

export interface Sample {
  id: string;
  sample_number: string;
  sample_type: string;
  product_name: string;
  batch_number?: string;
  status: string;
  received_date: string;
  expiry_date?: string;
  created_at: string;
}

export interface TestRequest {
  id: string;
  request_number: string;
  sample: string;
  sample_detail?: Pick<Sample, "sample_number" | "product_name">;
  test_name: string;
  status: string;
  assigned_to?: string;
  due_date?: string;
  results?: TestResult[];
}

export interface TestResult {
  id: string;
  test_request: string;
  parameter: string;
  specification?: string;
  result_value: string;
  unit?: string;
  pass_fail: "pass" | "fail" | "inconclusive";
  oos_triggered?: boolean;
}

export const laboratoryService = {
  async listSamples(params?: Record<string, string>): Promise<Sample[]> {
    const response = await api.get<Sample[]>("/laboratory/samples/", { params });
    return response.data;
  },

  async getSample(id: string): Promise<Sample> {
    const response = await api.get<Sample>(`/laboratory/samples/${id}/`);
    return response.data;
  },

  async createSample(data: Partial<Sample>): Promise<Sample> {
    const response = await api.post<Sample>("/laboratory/samples/", data);
    return response.data;
  },

  async listTestRequests(params?: Record<string, string>): Promise<TestRequest[]> {
    const response = await api.get<TestRequest[]>("/laboratory/test-requests/", { params });
    return response.data;
  },

  async getTestRequest(id: string): Promise<TestRequest> {
    const response = await api.get<TestRequest>(`/laboratory/test-requests/${id}/`);
    return response.data;
  },

  async createTestRequest(data: Partial<TestRequest>): Promise<TestRequest> {
    const response = await api.post<TestRequest>("/laboratory/test-requests/", data);
    return response.data;
  },

  async submitResult(requestId: string, data: Partial<TestResult>): Promise<TestResult> {
    const response = await api.post<TestResult>(
      `/laboratory/test-requests/${requestId}/submit-result/`,
      data
    );
    return response.data;
  },

  async generateCOA(sampleId: string): Promise<Blob> {
    const response = await api.post(`/laboratory/samples/${sampleId}/coa/`, {}, { responseType: "blob" });
    return response.data;
  },

  async transition(sampleId: string, action: string, reason?: string, esigPassword?: string): Promise<Sample> {
    const response = await api.post<Sample>(`/laboratory/samples/${sampleId}/transition/`, {
      action,
      reason,
      esig_password: esigPassword,
    });
    return response.data;
  },
};
