// Browser port of backend/docstudio (stage library, MBR validator, trigger rules).
// Draft content, pending expert review. Never invents limits.

export interface Stage { key: string; title: string; records: string[]; critical: boolean; ipqc: string[] }
const s = (key: string, title: string, critical: boolean, records: string[], ipqc: string[] = []): Stage => ({ key, title, critical, records, ipqc })

const LINE = s('line_clearance', 'Line clearance and area/equipment status check', true, ['Area ID', 'Equipment IDs', 'Cleaning status label / date', 'Checked by', 'Verified by (QA)'])
const DISP = s('dispensing', 'Dispensing of raw materials', true, ['Material / AR number', 'Required qty', 'Actual qty', 'Balance ID', 'Dispensed by', 'Verified by'])
const END = [
  s('yield_reconciliation', 'Yield and reconciliation', true, ['Theoretical yield', 'Actual yield', 'Yield %', 'Rejects / samples', 'Calculated by', 'Verified by']),
  s('batch_review', 'Batch record review and deviation summary', true, ['Deviation numbers', 'Review by (Production)', 'Review by (QA)', 'Date']),
]

export const FORMS: Record<string, { label: string; stages: Stage[] }> = {
  oral_solid_tablet: { label: 'Oral solid dose — tablet', stages: [LINE, DISP,
    s('sifting', 'Sifting / milling', false, ['Sieve/mill ID', 'Screen size', 'Integrity check before/after']),
    s('granulation', 'Granulation', true, ['Equipment ID', 'Binder details', 'Speed / time / rate', 'Endpoint'], ['Loss on drying']),
    s('drying', 'Drying', true, ['Dryer ID', 'Inlet/outlet temperature', 'Start/stop time'], ['Loss on drying']),
    s('blending', 'Blending and lubrication', true, ['Blender ID', 'Load qty', 'Speed / time'], ['Blend uniformity']),
    s('compression', 'Compression', true, ['Machine ID', 'Tooling set ID', 'Speed', 'Force'], ['Average weight', 'Thickness', 'Hardness', 'Friability', 'Disintegration time']),
    s('coating', 'Coating (if applicable)', true, ['Coater ID', 'Dispersion details', 'Spray rate / pan speed'], ['Weight gain']),
    s('packing', 'Primary and secondary packing', true, ['Component code / AR', 'Issued / used / returned', 'Overprint check'], ['Seal integrity', 'Leak test']),
    ...END] },
  api_synthesis: { label: 'API — chemical synthesis', stages: [LINE,
    s('charging', 'Raw material and solvent charging', true, ['Reactor ID', 'Material / AR / qty', 'Order of addition', 'Verified by']),
    s('reaction', 'Reaction', true, ['Temperature log', 'Start/stop time', 'IPC sample time and result'], ['Reaction completion (IPC)']),
    s('workup', 'Work-up / phase separation', true, ['pH', 'Volumes', 'Hold time'], ['pH']),
    s('crystallization', 'Crystallization / isolation', true, ['Cooling profile', 'Centrifuge ID', 'Wash volumes', 'Wet cake weight']),
    s('drying', 'Drying', true, ['Dryer ID', 'Temperature / vacuum', 'Start/stop time'], ['Loss on drying', 'Residual solvents']),
    s('milling_blending', 'Milling / sieving / blending', false, ['Mill ID', 'Screen / speed'], ['Particle size distribution']),
    s('packing', 'Packing and labelling', true, ['Container IDs', 'Tare / net weights', 'Label reconciliation']),
    ...END] },
  sterile_injectable_aseptic: { label: 'Sterile injectable — aseptic fill', stages: [LINE,
    s('gowning_ems', 'Aseptic area readiness and environmental status', true, ['Area classification', 'EM status', 'Gowning qualification current'], ['Viable / non-viable monitoring']),
    s('compounding', 'Compounding', true, ['Vessel ID', 'Material / qty', 'Temperature', 'Start/stop'], ['pH', 'Assay (bulk)']),
    s('filtration', 'Sterile filtration', true, ['Filter ID / lot', 'Pre-use integrity', 'Post-use integrity'], ['Filter integrity', 'Bioburden']),
    s('filling', 'Aseptic filling and stoppering', true, ['Filling line ID', 'Fill volume checks', 'Interventions log'], ['Fill volume', 'Container closure integrity']),
    s('sealing_inspection', 'Sealing and 100% visual inspection', true, ['Inspector ID', 'Qty inspected', 'Rejects by category'], ['Visual defects']),
    ...END] },
}

export interface MbrInput { product: string; form: string; batchSize: string; yieldFormula: string; excluded: string[]; limits: Record<string, string> }

export function buildMbr(i: MbrInput) {
  const steps = FORMS[i.form].stages.filter(st => !i.excluded.includes(st.key))
    .map((st, n) => ({ ...st, n: n + 1, limit: i.limits[st.key] ?? '' }))
  const blocking: string[] = [], advisory: string[] = []
  if (!i.product.trim()) blocking.push('Product name is missing.')
  if (!i.batchSize.trim()) blocking.push('Batch size is missing.')
  if (!i.yieldFormula.trim()) blocking.push('Yield calculation formula is not defined.')
  for (const st of steps) if (st.ipqc.length && !st.limit)
    advisory.push(`Step ${st.n} (${st.title}): in-process checks suggested (${st.ipqc.join(', ')}) but no limits entered — add them from the approved specification.`)
  for (const k of i.excluded) advisory.push(`Stage "${FORMS[i.form].stages.find(x => x.key === k)?.title}" excluded — record the justification in the header.`)
  return { steps, blocking, advisory }
}

export interface TriggerRule { id: string; name: string; when: string[]; possible: string[]; risk: 'high' | 'medium' | 'low' }

export const FACTS: { key: string; label: string }[] = [
  { key: 'site_change', label: 'Manufacturing site changes' },
  { key: 'equip_diff', label: 'Equipment of a different design or operating principle' },
  { key: 'equip_same', label: 'Like-for-like equipment replacement' },
  { key: 'spec_tight', label: 'Specification tightened' },
  { key: 'spec_loose', label: 'Specification loosened or a test removed' },
  { key: 'supplier', label: 'API or key starting material supplier changes' },
  { key: 'batch_size', label: 'Batch size goes beyond the registered range' },
  { key: 'packaging', label: 'Primary packaging changes' },
  { key: 'dmf', label: 'Product is an API under a DMF or CEP and the process changes' },
]

export const RULES: TriggerRule[] = [
  { id: 'RT-001', name: 'Manufacturing site change', when: ['site_change'], risk: 'high', possible: ['FDA: prior approval supplement typically expected', 'EU: Type II variation typically expected', 'DMF/CEP holder: notify or amend'] },
  { id: 'RT-002', name: 'Equipment with different operating principle', when: ['equip_diff'], risk: 'high', possible: ['FDA: PAS or CBE-30 depending on process impact', 'EU: Type IB or II depending on process impact'] },
  { id: 'RT-003', name: 'Like-for-like equipment replacement', when: ['equip_same'], risk: 'low', possible: ['Often annual report only — confirm'] },
  { id: 'RT-004', name: 'Specification tightened', when: ['spec_tight'], risk: 'medium', possible: ['FDA: CBE-0 or annual report', 'EU: Type IA or IB'] },
  { id: 'RT-005', name: 'Specification loosened or test removed', when: ['spec_loose'], risk: 'high', possible: ['FDA: PAS typically expected', 'EU: Type II typically expected'] },
  { id: 'RT-006', name: 'API / KSM supplier change', when: ['supplier'], risk: 'high', possible: ['Update DMF/CEP reference in the dossier', 'Supplier qualification and audit before use'] },
  { id: 'RT-007', name: 'Batch size beyond registered range', when: ['batch_size'], risk: 'medium', possible: ['FDA: CBE-30 or PAS', 'EU: Type IB or II'] },
  { id: 'RT-008', name: 'Primary packaging change', when: ['packaging'], risk: 'medium', possible: ['Stability data likely required', 'FDA: CBE-30 or PAS; EU: Type IB or II'] },
  { id: 'RT-009', name: 'API under DMF/CEP — process change', when: ['dmf'], risk: 'high', possible: ['DMF amendment', 'Notify customers holding letters of authorisation', 'CEP revision if a CEP is held'] },
]

export const evalTriggers = (facts: string[]) => {
  const order = { high: 0, medium: 1, low: 2 }
  return RULES.filter(r => r.when.every(w => facts.includes(w))).sort((a, b) => order[a.risk] - order[b.risk])
}

export function draftResponse(observation: string, cfrGuess: string) {
  const short = observation.trim().replace(/\s+/g, ' ').slice(0, 160)
  return [
    { h: 'Observation as stated', t: observation.trim() || '(paste the observation text)' },
    { h: 'Acknowledgement', t: `We acknowledge the observation${cfrGuess ? ` (${cfrGuess})` : ''} and take it seriously. This response describes our investigation, the root cause, and the corrective and preventive actions with dates.` },
    { h: 'Investigation and scope', t: `[To be completed by QA] What was reviewed for "${short}…": which batches, systems, and time period. State what was found, including anything unfavourable.` },
    { h: 'Root cause', t: '[To be completed] State the cause with evidence. Avoid "human error" unless the investigation shows why the system allowed it.' },
    { h: 'Immediate correction', t: '[To be completed] What has already been fixed, with completion dates and evidence references.' },
    { h: 'Corrective and preventive actions', t: '[To be completed] Each action with an owner and a date. Only commit to dates the site can meet.' },
    { h: 'Product impact', t: '[To be completed] Assessment of batches within expiry in the market, with the rationale and any market action.' },
    { h: 'Effectiveness check', t: '[To be completed] How and when effectiveness will be measured.' },
  ]
}
