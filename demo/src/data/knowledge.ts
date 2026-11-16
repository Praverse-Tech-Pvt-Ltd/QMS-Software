// Seed knowledge for the demo. All SOP text is invented for a fictional company.
// Precedent themes paraphrase commonly cited 21 CFR 211 sections; no counts are shown
// because this demo is not connected to the real 483 corpus.

export type SystemKey = 'quality' | 'production' | 'laboratory' | 'materials' | 'facilities' | 'packaging'

export const SYSTEMS: { key: SystemKey; label: string }[] = [
  { key: 'quality', label: 'Quality system' },
  { key: 'production', label: 'Production' },
  { key: 'laboratory', label: 'Laboratory controls' },
  { key: 'materials', label: 'Materials' },
  { key: 'facilities', label: 'Facilities & equipment' },
  { key: 'packaging', label: 'Packaging & labeling' },
]

export interface Doc {
  id: string
  code: string
  title: string
  version: string
  dept: string
  kind: 'SOP' | 'Policy' | 'Protocol' | 'Upload'
  uploadedBy: string
  uploadedAt: string
  status: 'indexed' | 'processing'
  note?: string
}

export interface Chunk {
  id: string
  docId: string
  section: string
  text: string
  system: SystemKey
  tags: string[]
}

export interface Precedent {
  id: string
  cfr: string
  system: SystemKey
  theme: string
  inspectorLooksFor: string
  tags: string[]
}

const d = (id: string, code: string, title: string, version: string, dept: string): Doc => ({
  id, code, title, version, dept, kind: 'SOP', uploadedBy: 'priya', uploadedAt: '2026-10-02T09:30:00', status: 'indexed',
})

export const SEED_DOCS: Doc[] = [
  d('d1', 'SOP-QA-005', 'Deviation Management', '4.0', 'Quality Assurance'),
  d('d2', 'SOP-QA-008', 'Corrective and Preventive Action (CAPA)', '3.1', 'Quality Assurance'),
  d('d3', 'SOP-QC-014', 'Out-of-Specification (OOS) Investigation', '5.0', 'Quality Control'),
  d('d4', 'SOP-QA-011', 'Change Control', '3.0', 'Quality Assurance'),
  d('d5', 'SOP-PR-021', 'Line Clearance', '2.2', 'Production'),
  d('d6', 'SOP-QC-030', 'Audit Trail Review of Laboratory Systems', '1.3', 'Quality Control'),
  d('d7', 'SOP-EN-017', 'Calibration of Instruments and Balances', '2.0', 'Engineering'),
  d('d8', 'SOP-HR-003', 'GMP Training and Qualification', '3.0', 'Human Resources'),
  d('d9', 'SOP-QA-020', 'Batch Record Review and Release', '2.4', 'Quality Assurance'),
  d('d10', 'SOP-WH-009', 'Supplier Qualification and Approved Supplier List', '2.1', 'Warehouse'),
]

const c = (id: string, docId: string, section: string, system: SystemKey, tags: string[], text: string): Chunk =>
  ({ id, docId, section, system, tags, text })

export const SEED_CHUNKS: Chunk[] = [
  c('c1', 'd1', '5.1 Reporting', 'quality', ['deviation', 'report', 'timeline'],
    'Any departure from an approved procedure, specification or batch instruction must be reported to the area supervisor immediately and logged as a deviation within one working day of discovery.'),
  c('c2', 'd1', '5.3 Classification', 'quality', ['deviation', 'classification', 'critical', 'major', 'minor'],
    'QA classifies each deviation as Critical (likely impact on product quality or patient safety), Major (possible impact, or a repeat event) or Minor (no impact on product quality). The classification and its rationale must be documented.'),
  c('c3', 'd1', '5.6 Investigation and closure', 'quality', ['deviation', 'investigation', 'closure', 'timeline', 'extension'],
    'Investigations must be completed and the deviation closed within 30 calendar days. An extension needs a written justification approved by the Head of Quality before the due date. The investigation must consider other batches and products that may be affected.'),
  c('c4', 'd2', '5.2 Root cause before action', 'quality', ['capa', 'root cause'],
    'A CAPA may be opened only after a documented root cause, or most probable cause, has been established. Actions must address the cause, not only the symptom.'),
  c('c5', 'd2', '5.5 Effectiveness check', 'quality', ['capa', 'effectiveness', 'timeline'],
    'Every CAPA must define measurable effectiveness criteria when it is opened. The effectiveness check is performed within 90 days of implementation, and a CAPA cannot be closed without an approved effectiveness review.'),
  c('c6', 'd3', '5.1 Phase I laboratory investigation', 'laboratory', ['oos', 'phase i', 'investigation', 'retest', 'timeline'],
    'When a result is out of specification the analyst informs the QC supervisor at once and keeps the sample preparations. Phase I (laboratory investigation) is completed within 2 working days. No retest or re-sampling is allowed until Phase I is documented and QA has approved the retest plan.'),
  c('c7', 'd3', '5.4 Phase II full-scale investigation', 'laboratory', ['oos', 'phase ii', 'investigation', 'manufacturing'],
    'If Phase I finds no assignable laboratory cause, a Phase II investigation covering manufacturing, sampling and materials is opened with QA and Production. The original OOS result stays in the record.'),
  c('c8', 'd3', '5.7 Invalidating a result', 'laboratory', ['oos', 'invalidate', 'assignable cause'],
    'An OOS result may be invalidated only when a documented assignable cause is proven. Averaging an OOS result with passing results to bring it within specification is not permitted.'),
  c('c9', 'd4', '5.2 Impact assessment', 'quality', ['change control', 'impact', 'validation'],
    'Each change is assessed for impact on validation status, cleaning validation, analytical methods, stability, training and documents before approval. Changes must not be implemented before approval.'),
  c('c10', 'd4', '5.4 Regulatory assessment', 'quality', ['change control', 'regulatory', 'filing', 'variation'],
    'Regulatory Affairs assesses every change that affects a registered process, site, specification, equipment or supplier, and records whether a filing or notification is needed before the change is implemented.'),
  c('c11', 'd5', '5.1 Performing line clearance', 'production', ['line clearance', 'previous batch', 'cleaning'],
    'Before any operation starts, the operator checks that the area and equipment are free of materials, labels and documents from the previous batch and that the cleaning status label is in date.'),
  c('c12', 'd5', '5.3 QA verification', 'production', ['line clearance', 'verification', 'signature'],
    'Line clearance is verified and signed by QA before dispensing, compression and packing. The operation must not start without the QA signature in the batch record.'),
  c('c13', 'd6', '5.1 Review before release', 'laboratory', ['audit trail', 'chromatography', 'hplc', 'data integrity', 'release'],
    'Audit trails of chromatography data systems are reviewed for each batch before the results are approved. The reviewer checks for deleted, reprocessed or aborted injections and records the review.'),
  c('c14', 'd6', '5.3 Access control', 'laboratory', ['audit trail', 'login', 'shared', 'access', 'data integrity'],
    'Every user has a unique login. Shared logins and analyst accounts with administrator rights are not permitted. User access is reviewed every six months.'),
  c('c15', 'd7', '5.2 Out-of-calibration', 'facilities', ['calibration', 'balance', 'instrument', 'overdue', 'impact'],
    'An instrument past its calibration due date is tagged "Do not use". If an instrument is found out of calibration, QA assesses the impact on every batch tested or made since the last successful calibration.'),
  c('c16', 'd8', '5.1 Training before the task', 'quality', ['training', 'qualification', 'operator'],
    'No person performs a GMP task until training on the current version of the procedure is completed and recorded.'),
  c('c17', 'd8', '5.4 Retraining on revision', 'quality', ['training', 'revision', 'retraining', 'timeline'],
    'When a procedure is revised, the affected staff complete retraining before the new version becomes effective, and no later than 15 days after approval.'),
  c('c18', 'd9', '5.2 Batch record review', 'production', ['batch record', 'bmr', 'review', 'signature', 'release'],
    'QA reviews the executed batch record for completeness: all entries, signatures, second-person verifications, in-process results, yield reconciliation and linked deviations. A batch is not released while a linked deviation or OOS is open.'),
  c('c19', 'd10', '5.3 Requalification', 'materials', ['supplier', 'vendor', 'qualification', 'approved supplier', 'audit'],
    'Suppliers of APIs, key starting materials and primary packaging are requalified every three years. Material from a supplier whose qualification has expired is not released for use.'),
  c('c20', 'd9', '5.5 Label reconciliation', 'packaging', ['label', 'reconciliation', 'packaging', 'discrepancy'],
    'Printed packaging materials issued, used, rejected and returned are reconciled for every batch. A discrepancy outside the set limit is investigated before the batch is released.'),
]

const p = (id: string, cfr: string, system: SystemKey, tags: string[], theme: string, inspectorLooksFor: string): Precedent =>
  ({ id, cfr, system, tags, theme, inspectorLooksFor })

export const PRECEDENTS: Precedent[] = [
  p('p1', '21 CFR 211.192', 'quality', ['deviation', 'investigation', 'oos', 'batch', 'root cause', 'closure'],
    'Failure to thoroughly investigate unexplained discrepancies and batch failures, or to extend the investigation to other batches.',
    'Open or late investigations, root causes recorded as "human error" without evidence, and no check of other batches.'),
  p('p2', '21 CFR 211.22(d)', 'quality', ['quality unit', 'procedure', 'capa', 'change control', 'approval'],
    'Responsibilities and procedures of the quality unit are not in writing or not fully followed.',
    'Whether what people do on the floor matches the approved SOP, and whether QA really approves before the action.'),
  p('p3', '21 CFR 211.68(b)', 'laboratory', ['audit trail', 'data integrity', 'login', 'access', 'computer', 'chromatography', 'hplc'],
    'Lack of controls over computerised systems: shared logins, audit trails off or not reviewed, data that can be changed.',
    'User lists, audit-trail review records, deleted or reprocessed injections, and administrator rights held by analysts.'),
  p('p4', '21 CFR 211.160(b)', 'laboratory', ['oos', 'retest', 'specification', 'laboratory', 'invalidate'],
    'Laboratory controls lack scientifically sound and appropriate specifications, standards and test procedures.',
    'Retesting into compliance, invalidated results without a proven cause, and trial injections.'),
  p('p5', '21 CFR 211.67', 'facilities', ['cleaning', 'equipment', 'maintenance', 'line clearance', 'hold time'],
    'Equipment is not cleaned, maintained or sanitised at appropriate intervals to prevent contamination.',
    'Cleaning records, hold-time studies, residue seen on "clean" equipment, and line clearance evidence.'),
  p('p6', '21 CFR 211.25(a)', 'quality', ['training', 'qualification', 'operator', 'retraining'],
    'Employees lack the training or experience to perform their assigned functions.',
    'Training records against the current SOP version for the person who actually did the task.'),
  p('p7', '21 CFR 211.188', 'production', ['batch record', 'bmr', 'signature', 'review', 'verification'],
    'Batch production and control records do not include complete information on each significant step.',
    'Missing signatures, back-dated entries, and steps signed by one person where two are required.'),
  p('p8', '21 CFR 211.68(a)', 'facilities', ['calibration', 'balance', 'instrument', 'overdue'],
    'Equipment is not routinely calibrated, inspected or checked according to a written programme.',
    'Instruments in use past their due date and no impact assessment for out-of-calibration results.'),
  p('p9', '21 CFR 211.84', 'materials', ['supplier', 'vendor', 'material', 'qualification', 'approved supplier'],
    'Components are not adequately tested or the reliability of the supplier is not established.',
    'Use of material from suppliers with expired qualification, and reliance on supplier COA without verification.'),
  p('p10', '21 CFR 211.125', 'packaging', ['label', 'reconciliation', 'packaging', 'discrepancy'],
    'Labeling issuance and reconciliation are not controlled, or discrepancies are not investigated.',
    'Reconciliation sheets, limits, and what happened when the numbers did not match.'),
  p('p11', '21 CFR 211.100(a)', 'production', ['process', 'validation', 'change control', 'procedure'],
    'Written procedures for production and process control are missing or not designed to assure quality.',
    'Changes made without revalidation and process parameters run outside the validated range.'),
]

export const SAMPLE_UPLOAD = {
  name: 'SOP-QA-025 Data Integrity and ALCOA+.txt',
  text: `Purpose. This procedure defines how data is recorded, reviewed and retained so that it stays attributable, legible, contemporaneous, original and accurate (ALCOA+).

Contemporaneous recording. Entries are made at the time the activity is performed. Recording on loose paper, sticky notes or memory for later transcription is not permitted. If a correction is needed, strike through with a single line, keep the original readable, and sign and date with the reason.

Raw data and true copies. The first capture of data is the raw data and must be retained for the life of the record. Printouts from balances and instruments are attached to the record and signed on the same day.

Backup and restore. Electronic GMP data is backed up daily. Restore from backup is tested every six months and the test is recorded by IT and reviewed by QA.

Reporting a data integrity concern. Any person who suspects that data has been falsified, deleted or back-dated reports it to the Head of Quality the same day. The concern is logged as a critical deviation.`,
}
