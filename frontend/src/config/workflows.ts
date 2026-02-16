import type { WorkflowDefinition, WorkflowModuleKey } from '../services/workflow.service';

export const WORKFLOWS: Record<WorkflowModuleKey, WorkflowDefinition> = {
  dms: {
    label: "SOP Workflow",
    steps: [
      { id: '1', label: 'Draft', status: 'DRAFT', order: 1 },
      { id: '2', label: 'Review', status: 'REVIEW', order: 2 },
      { id: '3', label: 'Approved', status: 'APPROVED', order: 3 },
      { id: '4', label: 'Effective', status: 'EFFECTIVE', order: 4 },
    ],
    transitions: {
      'DRAFT': [{ to: 'REVIEW', label: 'Submit for Review', action: 'SUBMIT', requiredRole: ['Admin', 'QA'], variant: 'primary' }],
      'REVIEW': [
        { to: 'APPROVED', label: 'Approve Document', action: 'APPROVE', requiredRole: ['QA'], requiresEsig: true, variant: 'success' },
        { to: 'DRAFT', label: 'Request Changes', action: 'REJECT', requiredRole: ['QA'], requiresComment: true, variant: 'error' }
      ],
      'APPROVED': [{ to: 'EFFECTIVE', label: 'Publish', action: 'PUBLISH', requiredRole: ['QA'], requiresEsig: true, variant: 'primary' }]
    }
  },

  capa: {
    label: "CAPA Workflow",
    steps: [
      { id: '1', label: 'Draft', status: 'DRAFT', order: 1 },
      { id: '2', label: 'Investigation', status: 'INVESTIGATION', order: 2 },
      { id: '3', label: 'Implementation', status: 'IMPLEMENTATION', order: 3 },
      { id: '4', label: 'Verification', status: 'VERIFICATION', order: 4 }, 
      { id: '5', label: 'Closed', status: 'CLOSED', order: 5 },
    ],
    transitions: {
      'DRAFT': [{ to: 'INVESTIGATION', label: 'Initiate CAPA', action: 'START_INVESTIGATION', requiredRole: ['QA'], variant: 'primary' }],
      'INVESTIGATION': [{ to: 'IMPLEMENTATION', label: 'Approve Plan', action: 'APPROVE', requiredRole: ['QA'], requiresEsig: true, variant: 'primary' }],
      'IMPLEMENTATION': [{ to: 'VERIFICATION', label: 'Complete', action: 'SUBMIT', requiredRole: ['Production', 'QA'], variant: 'primary' }],
      'VERIFICATION': [{ to: 'CLOSED', label: 'Verify & Close', action: 'CLOSE', requiredRole: ['QA'], requiresEsig: true, variant: 'success' }]
    }
  },

  deviations: {
    label: "Deviation Workflow",
    steps: [
      { id: '1', label: 'Initiation', status: 'DRAFT', order: 1 },
      { id: '2', label: 'Investigation', status: 'INVESTIGATION', order: 2 },
      { id: '3', label: 'QA Review', status: 'QA_REVIEW', order: 3 },
      { id: '4', label: 'Closed', status: 'CLOSED', order: 4 },
    ],
    transitions: {
      'DRAFT': [{ to: 'INVESTIGATION', label: 'Submit Event', action: 'SUBMIT', requiredRole: ['QA'], variant: 'primary' }],
      'INVESTIGATION': [{ to: 'QA_REVIEW', label: 'Submit Investigation', action: 'SUBMIT', requiredRole: ['QA'], variant: 'primary' }],
      'QA_REVIEW': [{ to: 'CLOSED', label: 'Approve & Close', action: 'CLOSE', requiredRole: ['QA'], requiresEsig: true, variant: 'success' }]
    }
  },

  training: {
    label: "Training Plan",
    steps: [
       { id: '1', label: 'Draft', status: 'DRAFT', order: 1 },
       { id: '2', label: 'Active', status: 'ACTIVE', order: 2 },
    ],
    transitions: {
       'DRAFT': [{ to: 'ACTIVE', label: 'Publish Plan', action: 'PUBLISH', requiredRole: ['QA'], variant: 'primary' }]
    }
  },

  change: {
    label: "Change Control",
    steps: [
       { id: '1', label: 'Draft', status: 'DRAFT', order: 1 },
       { id: '2', label: 'Evaluation', status: 'EVALUATION', order: 2 },
       { id: '3', label: 'Closed', status: 'CLOSED', order: 3 },
    ],
    transitions: {
       'DRAFT': [{ to: 'EVALUATION', label: 'Submit', action: 'SUBMIT', requiredRole: ['QA'], variant: 'primary' }],
       'EVALUATION': [{ to: 'CLOSED', label: 'Approve', action: 'APPROVE', requiredRole: ['QA'], variant: 'success' }]
    }
  }
};