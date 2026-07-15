export {};

declare global {
  interface ScormAPI {
    LMSInitialize: (param: string) => string;
    LMSFinish: (param: string) => string;
    LMSGetValue: (element: string) => string;
    LMSSetValue: (element: string, value: string) => string;
    LMSCommit: (param: string) => string;
    LMSGetLastError: () => string;
    LMSGetErrorString: (code: string) => string;
    LMSGetDiagnostic: (code: string) => string;
  }

  interface Window {
    initSCORMSession?: (assignmentId: string, scormModuleId: string) => void;
    API?: ScormAPI;
  }

  interface WindowEventMap {
    "scorm:commit": CustomEvent<{
      scorm_module: string;
      assignment: string;
      score: number | null;
      completion_status: "passed" | "failed" | "incomplete" | "not_attempted";
      raw_data: Record<string, unknown>;
    }>;
  }
}
