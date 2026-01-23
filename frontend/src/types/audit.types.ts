export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "STATUS_CHANGE"
  | "APPROVAL"
  | "REJECT"
  | "ATTACHMENT_ADD";

export type AuditTrailEntry = {
  id: string;
  recordId: string;
  moduleKey: string;

  actionType: AuditActionType;
  field?: string;
  oldValue?: string;
  newValue?: string;

  user: string;
  role: string;
  timestamp: string;
  reason?: string;
};
