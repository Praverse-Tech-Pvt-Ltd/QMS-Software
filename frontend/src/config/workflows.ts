import type { WorkflowDefinition, WorkflowModuleKey } from '../types/workflow.types';

export const WORKFLOWS: Record<WorkflowModuleKey, WorkflowDefinition> = {
  // ---------------------------------------------------------------------------
  // 1. DMS (Document Management)
  // ---------------------------------------------------------------------------
  dms: {
    label: "SOP Workflow",
    steps: [
      { id: '1', label: 'Draft', status: 'Draft', order: 1 },
      // ✅ FIXED: Changed 'In Review' to 'Review'
      { id: '2', label: 'Review', status: 'Review', order: 2 },
      { id: '3', label: 'Approved', status: 'Approved', order: 3 },
      { id: '4', label: 'Effective', status: 'Effective', order: 4 },
    ],
    transitions: {
      'Draft': [
        { 
          // ✅ FIXED: to 'Review'
          to: 'Review', 
          label: 'Submit for Review', 
          action: 'SUBMIT', 
          requiredRole: ['Admin', 'QA', 'Production'], 
          variant: 'primary' 
        }
      ],
      // ✅ FIXED: Key is 'Review'
      'Review': [
        { 
          to: 'Approved', 
          label: 'Approve Document', 
          action: 'APPROVE', 
          requiredRole: ['QA', 'Admin'], 
          requiresEsig: true, 
          variant: 'success' 
        },
        { 
          to: 'Draft', 
          label: 'Request Changes', 
          action: 'REJECT', 
          requiredRole: ['QA', 'Admin'], 
          requiresComment: true, 
          variant: 'error' 
        }
      ],
      'Approved': [
        { 
          to: 'Effective', 
          label: 'Make Effective (Publish)', 
          action: 'PUBLISH', 
          requiredRole: ['QA'], 
          requiresEsig: true, 
          variant: 'primary' 
        }
      ],
      'Effective': [
        {
          to: 'Obsolete', // Ensure 'Obsolete' exists in your WorkflowStatus type
          label: 'Retire Document',
          action: 'RETIRE',
          requiredRole: ['QA'],
          requiresEsig: true,
          requiresComment: true,
          variant: 'error'
        }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // 2. CAPA (Corrective & Preventive Action)
  // ---------------------------------------------------------------------------
  capa: {
    label: "CAPA Workflow",
    steps: [
      { id: '1', label: 'Draft', status: 'Draft', order: 1 },
      { id: '2', label: 'Investigation', status: 'Investigation', order: 2 },
      { id: '3', label: 'Implementation', status: 'Implementation', order: 3 },
      // ✅ SUGGESTION: Checked if 'Effectiveness Check' is valid in your type. 
      // If not, use 'Verification' or 'Review'. kept as is for now based on your error log.
      { id: '4', label: 'Eff. Check', status: 'Verification', order: 4 }, 
      { id: '5', label: 'Closed', status: 'Closed', order: 5 },
    ],
    transitions: {
      'Draft': [
        { 
          to: 'Investigation', 
          label: 'Initiate CAPA', 
          action: 'START_INVESTIGATION', 
          requiredRole: ['QA', 'Admin'], 
          variant: 'primary' 
        }
      ],
      'Investigation': [
        { 
          to: 'Implementation', 
          label: 'Approve Investigation & Plan', 
          action: 'APPROVE', 
          requiredRole: ['QA'], 
          requiresEsig: true, 
          variant: 'primary' 
        },
        { 
          to: 'Draft', 
          label: 'Reject Investigation', 
          action: 'REJECT', 
          requiredRole: ['QA'], 
          requiresComment: true, 
          variant: 'error' 
        }
      ],
      'Implementation': [
        { 
          to: 'Verification', // Matched step 4
          label: 'Complete Implementation', 
          action: 'SUBMIT', 
          requiredRole: ['Production', 'QA'], 
          requiresEsig: true, 
          variant: 'primary' 
        }
      ],
      'Verification': [ // Matched step 4
        { 
          to: 'Closed', 
          label: 'Verify & Close CAPA', 
          action: 'CLOSE', 
          requiredRole: ['QA'], 
          requiresEsig: true, 
          variant: 'success' 
        },
        { 
          to: 'Implementation', 
          label: 'Failed - Re-open Implementation', 
          action: 'REJECT', 
          requiredRole: ['QA'], 
          requiresComment: true, 
          variant: 'error' 
        }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // 3. Deviations
  // ---------------------------------------------------------------------------
  deviations: {
    label: "Deviation Workflow",
    steps: [
      { id: '1', label: 'Initiation', status: 'Draft', order: 1 },
      { id: '2', label: 'Investigation', status: 'Investigation', order: 2 },
      // ✅ FIXED: Changed 'QA Review' to 'Review' to match type
      { id: '3', label: 'QA Review', status: 'Review', order: 3 },
      { id: '4', label: 'Closed', status: 'Closed', order: 4 },
    ],
    transitions: {
      'Draft': [
        { to: 'Investigation', label: 'Submit Event', action: 'SUBMIT', requiredRole: ['Production', 'QA'], variant: 'primary' }
      ],
      'Investigation': [
        // ✅ FIXED: to 'Review'
        { to: 'Review', label: 'Submit Investigation', action: 'SUBMIT', requiredRole: ['QA', 'Production'], variant: 'primary' }
      ],
      // ✅ FIXED: Key is 'Review'
      'Review': [
        { to: 'Closed', label: 'Approve & Close', action: 'CLOSE', requiredRole: ['QA'], requiresEsig: true, variant: 'success' },
        { to: 'Investigation', label: 'Reject / More Info', action: 'REJECT', requiredRole: ['QA'], requiresComment: true, variant: 'error' }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // 4. Change Control
  // ---------------------------------------------------------------------------
  change: {
    label: "Change Control",
    steps: [
       { id: '1', label: 'Draft', status: 'Draft', order: 1 },
       // ✅ FIXED: Changed 'In Review' to 'Review'
       { id: '2', label: 'In Review', status: 'Review', order: 2 },
       { id: '3', label: 'Closed', status: 'Closed', order: 3 },
    ],
    transitions: {
       // ✅ FIXED: to 'Review'
       'Draft': [{ to: 'Review', label: 'Submit', action: 'SUBMIT', requiredRole: ['QA'], variant: 'primary' }],
       // ✅ FIXED: Key is 'Review'
       'Review': [{ to: 'Closed', label: 'Approve', action: 'APPROVE', requiredRole: ['QA'], variant: 'success' }]
    }
  },

  // ---------------------------------------------------------------------------
  // 5. Training
  // ---------------------------------------------------------------------------
  training: {
    label: "Training Plan",
    steps: [
       { id: '1', label: 'Draft', status: 'Draft', order: 1 },
       { id: '2', label: 'Effective', status: 'Effective', order: 2 },
    ],
    transitions: {
       'Draft': [{ to: 'Effective', label: 'Publish Plan', action: 'PUBLISH', requiredRole: ['QA'], variant: 'primary' }]
    }
  }
};