import api from "./api";

export interface Logbook {
  id: string;
  name: string;
  logbook_type: "equipment" | "area" | "instrument";
  logbook_type_display: string;
  equipment_id: string;
  location: string;
  department: string;
  last_entry_date: string | null;
  entry_count: number;
  created_at: string;
  updated_at: string;
}

export interface LogbookEntry {
  id: string;
  logbook: string;
  entry_date: string;
  entry_time: string;
  activity: string;
  performed_by: string;
  performed_by_name: string;
  usage_hours: string | null;
  batch_lot: string;
  condition: "normal" | "abnormal" | "out_of_service";
  condition_display: string;
  ai_remark_draft: string;
  created_at: string;
  updated_at: string;
}

export interface NewLogbookEntry {
  entry_date: string;
  entry_time: string;
  activity: string;
  usage_hours?: string;
  batch_lot?: string;
  condition: "normal" | "abnormal" | "out_of_service";
  esig_password: string;
}

export const logbooksService = {
  async list(): Promise<Logbook[]> {
    const response = await api.get<Logbook[]>("/v1/logbooks/");
    return response.data;
  },

  async getById(id: string): Promise<Logbook> {
    const response = await api.get<Logbook>(`/v1/logbooks/${id}/`);
    return response.data;
  },

  async create(data: Partial<Logbook>): Promise<Logbook> {
    const response = await api.post<Logbook>("/v1/logbooks/", data);
    return response.data;
  },

  async listEntries(logbookId: string, params?: { date_from?: string; date_to?: string }): Promise<LogbookEntry[]> {
    const response = await api.get<LogbookEntry[]>(`/v1/logbooks/${logbookId}/entries/`, { params });
    return response.data;
  },

  async addEntry(logbookId: string, data: NewLogbookEntry): Promise<LogbookEntry> {
    const response = await api.post<LogbookEntry>(`/v1/logbooks/${logbookId}/entries/`, data);
    return response.data;
  },

  async updateEntryRemarkDraft(entryId: string, aiRemarkDraft: string): Promise<LogbookEntry> {
    const response = await api.patch<LogbookEntry>(`/v1/logbooks/entries/${entryId}/`, {
      ai_remark_draft: aiRemarkDraft,
    });
    return response.data;
  },
};
