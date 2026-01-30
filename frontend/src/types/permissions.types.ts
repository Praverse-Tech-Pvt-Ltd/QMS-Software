export type UserRole = 
  | 'Admin' 
  | 'QA' 
  | 'QC' 
  | 'Production' 
  | 'Warehouse' 
  | 'Viewer';

export type ModuleKey =
  | "dashboard"
  | "dms"
  | "training"
  | "training_matrix"
  | "deviations"
  | "capa"
  | "change"
  | "settings"
  | "reports";

export type PermissionAction = 
  | "view" 
  | "create" 
  | "edit" 
  | "delete" 
  | "approve" 
  | "export"
  | "close"
  | "reopen";

export type PermissionMatrix = Record<
  UserRole, 
  Partial<Record<ModuleKey, PermissionAction[]>>
>;