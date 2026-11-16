// Demo "company AI". Runs fully in the browser: keyword retrieval over the indexed
// chunks, then a templated, cited answer. The real product swaps this for
// embeddings + an LLM, but keeps the same contract: no source, no answer.
import { PRECEDENTS, SYSTEMS, type Chunk, type Precedent, type SystemKey } from '../data/knowledge'
import type { DemoUser } from '../data/users'
import { STAGE_OWNER, type Gap, type QEvent, type Severity } from '../data/seed'
import type { State } from './store'

const STOP = new Set('a an and are as at be by can do does for from how i if in is it my of on or our should that the their there this to was we what when where which who why will with you your me about have has need must'.split(' '))

const SYN: Record<string, string[]> = {
  oos: ['specification', 'out-of-specification'], specification: ['oos'], retest: ['oos', 'retesting'],
  capa: ['corrective', 'preventive'], bmr: ['batch', 'record'], bpr: ['batch', 'record'],
  hplc: ['chromatography', 'audit'], vendor: ['supplier'], supplier: ['vendor'],
  weighing: ['balance', 'dispensing'], balance: ['calibration'], login: ['access', 'password'], password: ['login'],
  late: ['timeline', 'overdue'], days: ['timeline'], deadline: ['timeline'], long: ['timeline'], close: ['closure'],
  alcoa: ['integrity'], falsified: ['integrity'], backup: ['restore'], correction: ['entries'],
}

const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, '')

export function tokens(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9+\- ]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP.has(w))
}

function expand(q: string): string[] {
  const out = new Set<string>()
  for (const t of tokens(q)) { out.add(stem(t)); (SYN[t] ?? []).forEach(s => out.add(stem(s))) }
  return [...out]
}

function score(qTokens: string[], text: string, tags: string[]): number {
  const body = new Set(tokens(text).map(stem))
  const tagSet = new Set(tags.flatMap(t => tokens(t)).map(stem))
  let s = 0
  for (const t of qTokens) { if (tagSet.has(t)) s += 3; else if (body.has(t)) s += 1 }
  return s
}

export interface Answer {
  paragraphs: string[]
  chunks: Chunk[]
  precedents: Precedent[]
  gaps: Gap[]
  notFound: boolean
}

const roleOpen = (state: State, user: DemoUser) => state.gaps.filter(g => g.status === 'open' && g.ownerRole === user.role)
const queue = (state: State, user: DemoUser) => state.events.filter(e => STAGE_OWNER[e.stage] === user.role)

export function askAI(question: string, user: DemoUser, state: State): Answer {
  const q = question.toLowerCase()
  const openGaps = state.gaps.filter(g => g.status === 'open')

  // Intent: my work
  if (/\b(my (tasks?|queue|work|pending)|pending (with|for) me|what should i do today)\b/.test(q)) {
    const mine = queue(state, user); const gaps = roleOpen(state, user)
    return {
      paragraphs: [
        mine.length ? `You have ${mine.length} quality event${mine.length > 1 ? 's' : ''} waiting for you: ${mine.map(e => e.id).join(', ')}.` : 'No quality events are waiting for your action.',
        gaps.length ? `You also own ${gaps.length} open readiness gap${gaps.length > 1 ? 's' : ''}. The most serious is "${sortGaps(gaps)[0].title}".` : 'You own no open readiness gaps.',
      ], chunks: [], precedents: [], gaps: sortGaps(gaps).slice(0, 3), notFound: false,
    }
  }

  // Intent: inspection readiness
  if (/\b(inspection|inspector|audit ready|readiness|ready for|483 risk|biggest risk|exposure)\b/.test(q) && !/audit trail/.test(q)) {
    const scope = user.role === 'ceo' || user.role === 'qa_head' || user.role === 'ra' ? openGaps : roleOpen(state, user)
    const top = sortGaps(scope.length ? scope : openGaps).slice(0, 3)
    const r = readiness(state.gaps)
    return {
      paragraphs: [
        `Site readiness is ${r.overall}/100 today, with ${openGaps.length} open gaps. The weakest area is ${SYSTEMS.find(s => s.key === r.weakest)!.label.toLowerCase()} (${r.bySystem[r.weakest]}/100).`,
        top.length ? `If an inspector walked in now, these are the findings I would expect first${scope.length && scope !== openGaps ? ' in your area' : ''}:` : 'I see no open gaps.',
        ...top.map((g, i) => `${i + 1}. ${g.title} — ${g.cfr}. First step: ${g.guidance[0]}`),
      ],
      chunks: [], precedents: PRECEDENTS.filter(p => top.some(g => g.cfr.startsWith(p.cfr.split('(')[0]))).slice(0, 2), gaps: top, notFound: false,
    }
  }

  // Retrieval
  const qt = expand(question)
  const docById = new Map(state.docs.map(d => [d.id, d]))
  const ranked = state.chunks
    .map(c => ({ c, s: score(qt, c.text + ' ' + (docById.get(c.docId)?.title ?? ''), c.tags) }))
    .filter(x => x.s >= 3).sort((a, b) => b.s - a.s)
  const hits = ranked.slice(0, 2).map(x => x.c)

  if (!hits.length) {
    return {
      paragraphs: [
        'I could not find this in the documents indexed for your site, so I will not guess.',
        'You can upload the procedure that covers it in the Knowledge base, or ask the document owner. I have logged this question as a possible gap in your SOP coverage.',
      ], chunks: [], precedents: [], gaps: [], notFound: true,
    }
  }

  const systems = new Set<SystemKey>(hits.map(h => h.system))
  const precedents = PRECEDENTS
    .map(p => ({ p, s: score(qt, p.theme, p.tags) + (systems.has(p.system) ? 1 : 0) }))
    .filter(x => x.s >= 3).sort((a, b) => b.s - a.s).slice(0, 1).map(x => x.p)
  const related = sortGaps(openGaps.filter(g => hits.some(h => g.sopRef.startsWith(docById.get(h.docId)?.code ?? '~')))).slice(0, 2)

  const paragraphs = hits.map(h => {
    const doc = docById.get(h.docId)!
    return `${h.text} [${doc.code} v${doc.version}, §${h.section}]`
  })
  if (related.length) {
    paragraphs.push(user.role === 'ceo'
      ? `Business view: this procedure has ${related.length} open gap${related.length > 1 ? 's' : ''} at the site right now — ${related.map(g => g.title).join('; ')}.`
      : `At your site right now: ${related.map(g => `${g.title} (${g.id})`).join('; ')}. ${related[0].guidance[0]}`)
  }
  return { paragraphs, chunks: hits, precedents, gaps: related, notFound: false }
}

const SEV_W: Record<Severity, number> = { critical: 25, major: 12, minor: 5 }
const sortGaps = (gs: Gap[]) => [...gs].sort((a, b) => SEV_W[b.severity] - SEV_W[a.severity])

export function readiness(gaps: Gap[]) {
  const bySystem = {} as Record<SystemKey, number>
  for (const s of SYSTEMS) {
    const loss = gaps.filter(g => g.system === s.key && g.status === 'open').reduce((n, g) => n + SEV_W[g.severity], 0)
    bySystem[s.key] = Math.max(0, 100 - loss)
  }
  const vals = Object.values(bySystem)
  const overall = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  const weakest = (Object.keys(bySystem) as SystemKey[]).sort((a, b) => bySystem[a] - bySystem[b])[0]
  return { overall, bySystem, weakest }
}

export const SUGGESTED: Record<DemoUser['role'], string[]> = {
  qa_exec: ['How long do I have to close a deviation?', 'What is pending with me?', 'When can a CAPA be closed?'],
  qc: ['I got an OOS result. Can I retest?', 'Who reviews the HPLC audit trail and when?', 'Can I invalidate an OOS result?'],
  hod: ['What must be checked in line clearance?', 'A balance is past calibration due date. What now?', 'What is pending with me?'],
  qa_head: ['Are we ready for an inspection?', 'What does our SOP say about CAPA effectiveness?', 'What is our policy on shared logins?'],
  ra: ['Which changes need a regulatory assessment?', 'Are we ready for an inspection?', 'What is the rule for supplier requalification?'],
  ceo: ['Are we ready for an inspection?', 'What is our biggest 483 risk?', 'How do we control audit trails in the lab?'],
  cto: ['What is our policy on shared logins?', 'How often is backup restore tested?', 'Who reviews the HPLC audit trail and when?'],
}

// ---- Quality event drafting -------------------------------------------------

export interface EventAnswers {
  what: string; area: string; type: string; batch: string
  impact: 'yes' | 'no' | 'unknown'; repeat: boolean; immediate: string
}

const TYPE_MAP: Record<string, { precedent: string; causes: string[] }> = {
  'Equipment malfunction': { precedent: 'p1', causes: ['Equipment: maintenance or wear', 'Procedure: restart or changeover rule', 'Training: operator response to alarms'] },
  'Procedure not followed': { precedent: 'p2', causes: ['Procedure: unclear or impractical step', 'Training: not trained on current version', 'Supervision: workload or shift handover'] },
  'OOS/OOT result': { precedent: 'p4', causes: ['Laboratory: sample preparation or instrument', 'Process: parameter drift', 'Material: input variability'] },
  'Environmental excursion': { precedent: 'p5', causes: ['Utilities: HVAC or sensor fault', 'Practice: door discipline or personnel flow', 'Monitoring: alarm limits or response'] },
  'Documentation error': { precedent: 'p7', causes: ['Practice: entries not made at the time', 'Design: record layout invites omission', 'Training: good documentation practice'] },
  'Material mix-up': { precedent: 'p9', causes: ['Materials: labelling or status control', 'Line clearance: previous material not removed', 'Warehouse: storage segregation'] },
}

export function draftEvent(a: EventAnswers) {
  const severity: Severity =
    a.impact === 'yes' || a.type === 'Material mix-up' ? 'critical' : a.impact === 'unknown' || a.repeat ? 'major' : 'minor'
  const batchPart = a.batch ? ` affecting Batch ${a.batch}` : ''
  const description =
    `On ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, in ${a.area}, the following departure from the approved procedure was observed${batchPart}: ${a.what.trim().replace(/\.$/, '')}. ` +
    `Immediate action taken: ${a.immediate.trim().replace(/\.$/, '') || 'none recorded'}. ` +
    `Potential impact on product quality: ${a.impact === 'yes' ? 'yes — to be assessed by QA' : a.impact === 'no' ? 'none identified at the time of reporting' : 'not yet known'}.` +
    (a.repeat ? ' A similar event occurred in the last six months; recurrence is to be evaluated.' : '')
  const map = TYPE_MAP[a.type] ?? TYPE_MAP['Procedure not followed']
  const why =
    severity === 'critical' ? 'Possible impact on product quality was reported.' :
    severity === 'major' ? (a.repeat ? 'This is a repeat event.' : 'Impact on product quality is not yet known.') :
    'No impact on product quality was identified and it is not a repeat event.'
  return {
    severity, description, why,
    title: a.what.trim().split(/[.;]/)[0].slice(0, 90),
    precedentId: map.precedent, rootCauses: map.causes,
    regulatoryFlag: severity === 'critical' && !!a.batch,
  }
}

export function draftRemark(e: QEvent, role: DemoUser['role']): string {
  if (role === 'hod') {
    return `I have reviewed ${e.id}. The description and immediate action are accurate. ${e.repeat ? 'As this is a repeat event, the investigation should cover why the earlier corrective action did not prevent recurrence. ' : ''}${e.batch ? `Batch ${e.batch} is to remain on hold until QA completes the impact assessment. ` : ''}My department will support the investigation and provide the equipment and training records.`
  }
  if (role === 'qa_exec') {
    return `Impact assessment completed for ${e.id} as per SOP-QA-005 §5.3. Classification: ${e.severity}. ${e.batch ? `Batch ${e.batch} and other batches made on the same equipment or line in the period have been reviewed. ` : ''}Most probable cause: ${e.rootCauses[0]?.toLowerCase() ?? 'under investigation'}. Corrective and preventive actions are proposed below.`
  }
  return `Reviewed the investigation and impact assessment for ${e.id}. The root cause is supported by evidence and the proposed actions address it. ${e.severity === 'critical' ? 'Batch disposition is to be decided separately after Phase II is complete. ' : ''}Approved, subject to completion of the listed actions and an effectiveness check within 90 days (SOP-QA-008 §5.5).`
}

export function proposeActions(e: QEvent) {
  const base = [
    { text: `Complete investigation of ${e.id} including check of other batches`, owner: 'QA', done: false },
    { text: `Corrective action for: ${e.rootCauses[0] ?? 'root cause'}`, owner: e.area, done: false },
  ]
  if (e.repeat) base.push({ text: 'Review why the earlier CAPA did not prevent recurrence', owner: 'QA', done: false })
  base.push({ text: 'Define effectiveness criteria and schedule 90-day check', owner: 'QA', done: false })
  return base
}

// ---- Upload ingestion -------------------------------------------------------

export function chunkText(text: string): { section: string; text: string }[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 40).map((p, i) => {
    const m = p.match(/^([A-Z][A-Za-z ,+&/-]{3,60})\.\s/)
    return { section: m ? m[1] : `Part ${i + 1}`, text: p.slice(0, 700) }
  })
}

export function guessSystem(text: string): SystemKey {
  const qt = expand(text.slice(0, 2000))
  const best = PRECEDENTS.map(p => ({ p, s: score(qt, p.theme, p.tags) })).sort((a, b) => b.s - a.s)[0]
  return best && best.s > 0 ? best.p.system : 'quality'
}

export function relatedPrecedent(text: string): Precedent | null {
  const qt = expand(text.slice(0, 3000))
  const best = PRECEDENTS.map(p => ({ p, s: score(qt, p.theme, p.tags) })).sort((a, b) => b.s - a.s)[0]
  return best && best.s >= 3 ? best.p : null
}
