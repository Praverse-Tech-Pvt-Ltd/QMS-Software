import api from "./api";

export interface QuestionnaireResponse {
  next_questions: Question[];
  complete: boolean;
  prefill: Record<string, string>;
}

export interface Question {
  id: string;
  text: string;
  field: string;
  type: "text" | "choice" | "scale" | "number" | "date_range";
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
}

export interface ClassifierResult {
  event_type: string;
  sub_category: string;
  risk_level: "Low" | "Medium" | "High" | "Critical";
}

export interface RemarkResult {
  remark_draft: string;
  sop_citations: string[];
  risk_flags: string[];
}

export interface ActionResult {
  action: string;
  category: string;
  suggested_owner_role: string;
  suggested_due_date: string;
}

export interface ActionItemRecord {
  id: string;
  record_type: string;
  record_id: string;
  action: string;
  category: string;
  suggested_owner_role: string;
  assigned_to: string | null;
  assigned_to_detail: { id: string; username: string; full_name: string } | null;
  due_date: string | null;
  status: "open" | "in_progress" | "closed" | "extended";
  evidence_note: string;
  extension_reason: string;
  source_remark: string;
  created_at: string;
  updated_at: string;
}

export interface ActionMatrixItem {
  id?: string;
  action: string;
  category: string;
  suggested_owner_role: string;
  suggested_due_date: string;
  status?: "open" | "in_progress" | "closed" | "extended";
}

/** Normalizes either raw algorithm output or persisted ActionItem records into a common shape. */
export function toActionMatrixItems(
  results: ActionResult[] | ActionItemRecord[]
): ActionMatrixItem[] {
  return results.map((r) => {
    if ("due_date" in r) {
      return {
        action: r.action,
        category: r.category,
        suggested_owner_role: r.suggested_owner_role,
        suggested_due_date: r.due_date || "",
        id: r.id,
        status: r.status,
      };
    }
    return { ...r };
  });
}

export const aiService = {
  async getNextQuestions(
    module: string,
    eventType: string,
    answers: Record<string, string>
  ): Promise<QuestionnaireResponse> {
    const response = await api.post<QuestionnaireResponse>("/v1/ai/questionnaire/", {
      module,
      event_type: eventType,
      answers,
    });
    return response.data;
  },

  async classifyEvent(description: string): Promise<ClassifierResult> {
    const response = await api.post<ClassifierResult>("/v1/ai/classify/", { description });
    return response.data;
  },

  async generateRemark(params: {
    module: string;
    record_id: string;
    approver_role: string;
    stage: string;
    risk_level?: string;
  }): Promise<RemarkResult> {
    const response = await api.post<RemarkResult>("/v1/ai/remark/", params);
    return response.data;
  },

  /**
   * If recordType/recordId are provided, the backend persists the extracted actions as
   * ActionItem records (get_or_create — safe to re-run) and returns those persisted
   * records. Without them, returns the raw (unpersisted) algorithm output.
   */
  async extractActions(
    remarkTexts: string[],
    recordType?: string,
    recordId?: string
  ): Promise<ActionResult[] | ActionItemRecord[]> {
    const payload: Record<string, unknown> = { remark_texts: remarkTexts };
    if (recordType && recordId) {
      payload.record_type = recordType;
      payload.record_id = recordId;
    }
    const response = await api.post<ActionResult[] | { actions: ActionResult[] }>("/v1/ai/extract-actions/", payload);
    const data = response.data;
    return Array.isArray(data) ? data : data.actions;
  },
};

export const actionItemsService = {
  async list(recordType: string, recordId: string): Promise<ActionItemRecord[]> {
    const response = await api.get<ActionItemRecord[]>("/v1/ai/action-items/", {
      params: { record_type: recordType, record_id: recordId },
    });
    return response.data;
  },

  async update(id: string, payload: Record<string, string>): Promise<ActionItemRecord> {
    const response = await api.patch<ActionItemRecord>(`/v1/ai/action-items/${id}/`, payload);
    return response.data;
  },

  async close(id: string, evidenceNote: string): Promise<ActionItemRecord> {
    const response = await api.post<ActionItemRecord>(`/v1/ai/action-items/${id}/close/`, {
      evidence_note: evidenceNote,
    });
    return response.data;
  },

  async extend(id: string, dueDate: string, extensionReason: string): Promise<ActionItemRecord> {
    const response = await api.post<ActionItemRecord>(`/v1/ai/action-items/${id}/extend/`, {
      due_date: dueDate,
      extension_reason: extensionReason,
    });
    return response.data;
  },
};
