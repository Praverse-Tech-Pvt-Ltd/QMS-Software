import type { RoleKey } from './users'
import type { SystemKey } from './knowledge'

export type Severity = 'critical' | 'major' | 'minor'

export interface Gap {
  id: string
  system: SystemKey
  title: string
  detail: string
  severity: Severity
  ownerRole: RoleKey
  cfr: string
  sopRef: string
  inspectorQuestion: string
  guidance: string[]
  status: 'open' | 'resolved'
  resolvedBy?: string
}

const g = (id: string, system: SystemKey, severity: Severity, ownerRole: RoleKey, title: string, detail: string,
  cfr: string, sopRef: string, inspectorQuestion: string, guidance: string[]): Gap =>
  ({ id, system, severity, ownerRole, title, detail, cfr, sopRef, inspectorQuestion, guidance, status: 'open' })

export const SEED_GAPS: Gap[] = [
  g('G-01', 'quality', 'major', 'qa_exec', '3 deviations open beyond 30 days',
    'DEV-2026-021, -024 and -027 have passed the closure limit with no approved extension.',
    '21 CFR 211.192', 'SOP-QA-005 §5.6',
    'Show me your open deviations. Why are these three past your own SOP limit?',
    ['Get a written extension with justification approved by the Head of Quality today.',
     'Record the interim risk assessment for the batches involved.',
     'Close the investigation with evidence of the check on other batches.']),
  g('G-02', 'quality', 'major', 'qa_head', '2 CAPA effectiveness checks overdue',
    'CAPA-2026-009 and -011 were implemented over 90 days ago with no effectiveness review.',
    '21 CFR 211.22(d)', 'SOP-QA-008 §5.5',
    'How do you know this CAPA worked? Show me the effectiveness check.',
    ['Pull the recurrence data for the last 90 days.', 'Document pass or fail against the criteria set when the CAPA opened.',
     'If not effective, re-open the CAPA rather than closing it.']),
  g('G-03', 'laboratory', 'critical', 'qc', 'Audit trail review missing for HPLC-04',
    'No audit trail review record for 6 batches released in the last two weeks.',
    '21 CFR 211.68(b)', 'SOP-QC-030 §5.1',
    'Show me the audit trail review for this batch before it was released.',
    ['Perform and document the review for all 6 batches now, marked as late.',
     'Raise a deviation for the missed reviews and assess impact on the released batches.',
     'Add the audit trail review as a hard stop in the release checklist.']),
  g('G-04', 'laboratory', 'major', 'qc', 'OOS Phase I ran 5 days',
    'OOS-2026-014 (assay) took 5 working days against the 2-day limit; a retest was run on day 3.',
    '21 CFR 211.160(b)', 'SOP-QC-014 §5.1',
    'When was the retest performed, and who approved it?',
    ['Document why Phase I was late.', 'Confirm QA approval of the retest plan is on record and dated before the retest.',
     'Keep the original result in the record.']),
  g('G-05', 'production', 'major', 'hod', 'Second-person verification missing in 1 batch record',
    'Batch B-2610-07, dispensing step: "Verified by" is blank for two materials.',
    '21 CFR 211.188', 'SOP-QA-020 §5.2',
    'Who verified this weighing? Why is the signature missing?',
    ['Do not back-date. Raise a deviation and record a dated late entry with explanation.',
     'Check balance printouts and the dispensing log as supporting evidence.',
     'Retrain the dispensing team on contemporaneous signatures.']),
  g('G-06', 'facilities', 'major', 'hod', 'Balance BAL-07 calibration overdue by 6 days',
    'BAL-07 in dispensing was used for 3 batches after its due date.',
    '21 CFR 211.68(a)', 'SOP-EN-017 §5.2',
    'This balance is past due. Which batches were weighed on it?',
    ['Tag the balance "Do not use" now.', 'Calibrate and record as-found results.',
     'QA to assess impact on the 3 batches weighed since the due date.']),
  g('G-07', 'materials', 'major', 'qa_exec', 'Supplier requalification expired',
    'The lactose supplier qualification expired last month; one lot has been received since.',
    '21 CFR 211.84', 'SOP-WH-009 §5.3',
    'Is this supplier on your approved list today? Show me the qualification.',
    ['Put the received lot on hold.', 'Complete the requalification questionnaire and review audit status.',
     'Update the approved supplier list only after QA approval.']),
  g('G-08', 'packaging', 'minor', 'qa_exec', 'Label reconciliation discrepancy not investigated',
    'Batch B-2610-03: 12 labels unaccounted for, within limit, but no note in the record.',
    '21 CFR 211.125', 'SOP-QA-020 §5.5',
    'Your reconciliation shows a difference. Where is the explanation?',
    ['Add a signed, dated note with the limit and the result.', 'Confirm the discrepancy is within the approved limit.']),
  g('G-09', 'quality', 'minor', 'hod', '4 operators not trained on revised line clearance SOP',
    'SOP-PR-021 v2.2 became effective 9 days ago; 4 packing operators have no training record.',
    '21 CFR 211.25(a)', 'SOP-HR-003 §5.4',
    'Was this operator trained on the current version before doing line clearance?',
    ['Train the 4 operators this shift and record it.', 'Check whether they performed line clearance since the effective date.']),
]

export type Stage = 'hod_review' | 'qa_assessment' | 'qa_head_approval' | 'capa_open' | 'closed' | 'returned'

export const STAGE_LABEL: Record<Stage, string> = {
  hod_review: 'With HOD', qa_assessment: 'QA assessment', qa_head_approval: 'With Head of Quality',
  capa_open: 'Actions open', closed: 'Closed', returned: 'Returned to initiator',
}
export const STAGE_OWNER: Record<Stage, RoleKey | null> = {
  hod_review: 'hod', qa_assessment: 'qa_exec', qa_head_approval: 'qa_head', capa_open: 'qa_exec', closed: null, returned: null,
}

export interface Signature { userId: string; meaning: string; at: string; remark: string }

export interface QEvent {
  id: string
  title: string
  description: string
  area: string
  type: string
  batch: string
  severity: Severity
  stage: Stage
  raisedBy: string
  raisedAt: string
  immediateAction: string
  repeat: boolean
  regulatoryFlag: boolean
  precedentId: string
  rootCauses: string[]
  signatures: Signature[]
  actions: { text: string; owner: string; done: boolean }[]
}

export const SEED_EVENTS: QEvent[] = [
  {
    id: 'DEV-2026-041', title: 'Compression machine stopped mid-batch; restart without QA information',
    description: 'During compression of Batch B-2611-02 the machine tripped on overload at 14:10. The operator restarted after clearing the feed frame. QA was not informed before restart and tablet weight checks for the 20 minutes after restart were recorded 35 minutes late.',
    area: 'Production', type: 'Equipment malfunction', batch: 'B-2611-02', severity: 'major', stage: 'hod_review',
    raisedBy: 'priya', raisedAt: '2026-11-10T15:20:00', immediateAction: 'Tablets from restart to first in-limit check segregated and held.',
    repeat: true, regulatoryFlag: false, precedentId: 'p1',
    rootCauses: ['Equipment: feed frame overload (maintenance history to be checked)', 'Procedure: restart rule not followed', 'Training: operator awareness of in-process check timing'],
    signatures: [], actions: [],
  },
  {
    id: 'DEV-2026-039', title: 'Assay OOS on stability sample — 3 month accelerated',
    description: 'Assay result of 93.8% (limit 95.0–105.0%) on the 3-month accelerated stability sample of Batch B-2607-11. Phase I found no assignable laboratory cause.',
    area: 'QC Lab', type: 'OOS/OOT result', batch: 'B-2607-11', severity: 'critical', stage: 'qa_head_approval',
    raisedBy: 'rohan', raisedAt: '2026-11-06T11:05:00', immediateAction: 'Sample preparations retained; QC supervisor informed.',
    repeat: false, regulatoryFlag: true, precedentId: 'p4',
    rootCauses: ['Product: degradation under accelerated condition', 'Packaging: moisture ingress', 'Method: sample preparation variability'],
    signatures: [
      { userId: 'vikram', meaning: 'I have reviewed this event and agree with the description and immediate action.', at: '2026-11-07T10:00:00', remark: 'Agreed. Production to support Phase II review of the batch record and packing details.' },
      { userId: 'priya', meaning: 'I have completed the QA impact assessment.', at: '2026-11-08T16:30:00', remark: 'Phase II opened. Market batches of the same packing configuration identified for review. Regulatory Affairs informed.' },
    ],
    actions: [],
  },
  {
    id: 'DEV-2026-036', title: 'Temperature excursion in raw material store',
    description: 'Store RM-2 recorded 27.4°C for 3 hours against a limit of 25°C after an AHU trip.',
    area: 'Warehouse', type: 'Environmental excursion', batch: '', severity: 'minor', stage: 'closed',
    raisedBy: 'priya', raisedAt: '2026-10-21T08:40:00', immediateAction: 'AHU reset; materials assessed against storage statements.',
    repeat: false, regulatoryFlag: false, precedentId: 'p5', rootCauses: ['Utilities: AHU trip'],
    signatures: [
      { userId: 'vikram', meaning: 'Reviewed.', at: '2026-10-21T12:00:00', remark: 'Agreed.' },
      { userId: 'priya', meaning: 'QA assessment complete.', at: '2026-10-22T10:00:00', remark: 'No impact; all materials within labelled excursion allowance.' },
      { userId: 'anita', meaning: 'Approved for closure.', at: '2026-10-23T09:00:00', remark: 'Approved.' },
    ],
    actions: [{ text: 'Add AHU trip alarm to the BMS escalation list', owner: 'Engineering', done: true }],
  },
]

export interface Filing {
  id: string; product: string; type: string; market: string; ref: string; status: string; next: string; due: string
}
export const FILINGS: Filing[] = [
  { id: 'F1', product: 'Demo-API-A', type: 'DMF Type II', market: 'USA', ref: 'DMF 0XXXXX (demo)', status: 'Active', next: 'Annual report', due: '2027-01-31' },
  { id: 'F2', product: 'Demo-API-A', type: 'CEP', market: 'EU', ref: 'CEP 20XX-XXX (demo)', status: 'Valid', next: 'Renewal dossier', due: '2027-06-15' },
  { id: 'F3', product: 'Demo Tablets 500 mg', type: 'ANDA', market: 'USA', ref: 'ANDA 2XXXXX (demo)', status: 'Approved', next: 'CBE-30 for packing change', due: '2026-12-20' },
  { id: 'F4', product: 'Demo Tablets 500 mg', type: 'Dossier (eCTD)', market: 'EU', ref: 'DCP (demo)', status: 'Deficiency query', next: 'Response to query on dissolution', due: '2026-11-28' },
]
