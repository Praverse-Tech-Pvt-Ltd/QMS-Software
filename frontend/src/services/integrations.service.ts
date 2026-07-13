import api from "./api";

export type ERPSystemType = "sap" | "oracle" | "generic_rest";
export type SyncDirection = "inbound" | "outbound";
export type SyncStatus = "success" | "failed" | "partial";

export interface IntegrationConfig {
  id: number;
  system_type: ERPSystemType;
  system_type_display: string;
  name: string;
  base_url: string;
  is_active: boolean;
  // Non-credential integration settings only (e.g. endpoint paths, timeouts).
  // NEVER put credentials, API keys, or tokens in this object — use env vars.
  config: Record<string, unknown>;
  created_at: string;
}

export interface IntegrationSyncLog {
  id: number;
  config: number;
  direction: SyncDirection;
  direction_display: string;
  entity_type: string;
  status: SyncStatus;
  status_display: string;
  records_synced: number;
  error_message: string;
  started_at: string;
  completed_at: string | null;
}

export const integrationsService = {
  async listConfigs(): Promise<IntegrationConfig[]> {
    const response = await api.get<IntegrationConfig[]>("/v1/integrations/configs/");
    return response.data;
  },

  async createConfig(data: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
    const response = await api.post<IntegrationConfig>("/v1/integrations/configs/", data);
    return response.data;
  },

  async updateConfig(id: number, data: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
    const response = await api.patch<IntegrationConfig>(`/v1/integrations/configs/${id}/`, data);
    return response.data;
  },

  async listSyncLog(): Promise<IntegrationSyncLog[]> {
    const response = await api.get<IntegrationSyncLog[]>("/v1/integrations/sync-log/");
    return response.data;
  },

  async fetchMaterial(code: string): Promise<Record<string, unknown>> {
    const response = await api.post(`/v1/integrations/configs/fetch-material/`, null, {
      params: { code },
    });
    return response.data;
  },

  async fetchBatch(batch: string): Promise<Record<string, unknown>> {
    const response = await api.post(`/v1/integrations/configs/fetch-batch/`, null, {
      params: { batch },
    });
    return response.data;
  },
};
