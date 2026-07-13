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

export interface Instrument {
  id: string;
  instrument_id: string;
  name: string;
  model: string;
  manufacturer: string;
  location: string;
  department: string;
  calibration_frequency_days: number;
  last_calibration_date: string | null;
  next_calibration_date: string | null;
  status: "active" | "due" | "overdue" | "out_of_service";
  status_display: string;
  calibration_records?: CalibrationRecord[];
  created_at: string;
  updated_at: string;
}

export interface CalibrationRecord {
  id: string;
  instrument: string;
  calibration_date: string;
  performed_by: string;
  performed_by_name: string;
  calibration_type: "internal" | "external";
  calibration_type_display: string;
  result: "pass" | "fail" | "adjusted";
  result_display: string;
  certificate_number: string;
  next_due_date: string;
  created_at: string;
}

export interface NewCalibrationRecord {
  calibration_date: string;
  calibration_type: "internal" | "external";
  result: "pass" | "fail" | "adjusted";
  certificate_number?: string;
  next_due_date: string;
  esig_password: string;
}

// Note: instrument endpoints use the /v1/ prefix — the real backend mount point
// (config/urls.py registers laboratory.urls under api/v1/laboratory/). The
// sample/test-request calls above omit it; that's a pre-existing mismatch,
// out of scope for the Phase 6 Instrument Calibration addition.
export const instrumentsService = {
  async list(): Promise<Instrument[]> {
    const response = await api.get<Instrument[]>("/v1/laboratory/instruments/");
    return response.data;
  },

  async getById(id: string): Promise<Instrument> {
    const response = await api.get<Instrument>(`/v1/laboratory/instruments/${id}/`);
    return response.data;
  },

  async create(data: Partial<Instrument>): Promise<Instrument> {
    const response = await api.post<Instrument>("/v1/laboratory/instruments/", data);
    return response.data;
  },

  async overdue(): Promise<Instrument[]> {
    const response = await api.get<Instrument[]>("/v1/laboratory/instruments/overdue/");
    return response.data;
  },

  async listCalibrations(instrumentId: string): Promise<CalibrationRecord[]> {
    const response = await api.get<CalibrationRecord[]>(`/v1/laboratory/instruments/${instrumentId}/calibrations/`);
    return response.data;
  },

  async recordCalibration(instrumentId: string, data: NewCalibrationRecord): Promise<CalibrationRecord> {
    const response = await api.post<CalibrationRecord>(
      `/v1/laboratory/instruments/${instrumentId}/calibrations/`,
      data
    );
    return response.data;
  },
};

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
