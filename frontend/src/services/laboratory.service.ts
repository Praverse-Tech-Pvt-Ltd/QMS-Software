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
  status_display?: string;
  assigned_to?: string;
  due_date?: string;
  results?: TestResult[];
  /** Real backend field (TestRequestSerializer.result) — null until a result is entered. */
  result?: TestResult | null;
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
  specification_lower?: string | null;
  specification_upper?: string | null;
}

export interface EnterResultResponse {
  result: TestResult;
  pass_fail: "pass" | "fail";
  oos_triggered: boolean;
  oos_id: string | null;
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
  // Note: these calls now use the /v1/ prefix — the real backend mount point
  // (config/urls.py registers laboratory.urls under api/v1/laboratory/). They
  // were previously missing it (a pre-existing bug making every call on this
  // page 404), fixed here since Block 12's result-entry flow depends on the
  // sample/test-request reads actually working.
  async listSamples(params?: Record<string, string>): Promise<Sample[]> {
    const response = await api.get<Sample[]>("/v1/laboratory/samples/", { params });
    return response.data;
  },

  async getSample(id: string): Promise<Sample> {
    const response = await api.get<Sample>(`/v1/laboratory/samples/${id}/`);
    return response.data;
  },

  async createSample(data: Partial<Sample>): Promise<Sample> {
    const response = await api.post<Sample>("/v1/laboratory/samples/", data);
    return response.data;
  },

  async listTestRequests(params?: Record<string, string>): Promise<TestRequest[]> {
    const response = await api.get<TestRequest[]>("/v1/laboratory/test-requests/", { params });
    return response.data;
  },

  async getTestRequest(id: string): Promise<TestRequest> {
    const response = await api.get<TestRequest>(`/v1/laboratory/test-requests/${id}/`);
    return response.data;
  },

  async createTestRequest(data: Partial<TestRequest>): Promise<TestRequest> {
    const response = await api.post<TestRequest>("/v1/laboratory/test-requests/", data);
    return response.data;
  },

  /**
   * Enter a result for a pending test request (Phase 6 Block 12).
   * Real backend contract: POST /v1/laboratory/samples/:sampleId/results/
   * with {test_request_id, result_value, unit}, via SampleViewSet.add_result —
   * there is no standalone /laboratory/results/ endpoint.
   */
  async enterResult(
    sampleId: string,
    data: { test_request_id: string; result_value: string; unit: string }
  ): Promise<EnterResultResponse> {
    const response = await api.post<EnterResultResponse>(
      `/v1/laboratory/samples/${sampleId}/results/`,
      data
    );
    return response.data;
  },

  async generateCOA(sampleId: string): Promise<Blob> {
    const response = await api.post(`/v1/laboratory/samples/${sampleId}/coa/`, {}, { responseType: "blob" });
    return response.data;
  },

  async transition(sampleId: string, action: string, reason?: string, esigPassword?: string): Promise<Sample> {
    const response = await api.post<Sample>(`/v1/laboratory/samples/${sampleId}/transition/`, {
      action,
      reason,
      esig_password: esigPassword,
    });
    return response.data;
  },
};
