import { useState } from 'react'
import { STAGE_LABEL, STAGE_OWNER, type QEvent, type Stage } from '../data/seed'
import { USERS, type DemoUser } from '../data/users'
import { draftEvent, draftRemark, proposeActions, type EventAnswers } from '../lib/ai'
import { fmt, logAi, logAudit, now, setState, useStore } from '../lib/store'
import { ESign, PageHead, PrecedentCard, Sev, Stamp, userName } from '../ui'

const FLOW: Stage[] = ['hod_review', 'qa_assessment', 'qa_head_approval', 'capa_open', 'closed']
const NEXT: Partial<Record<Stage, Stage>> = { hod_review: 'qa_assessment', qa_assessment: 'qa_head_approval', qa_head_approval: 'capa_open', capa_open: 'closed' }
const MEANING: Partial<Record<Stage, string>> = {
  hod_review: 'I have reviewed this event and agree with the description and immediate action.',
  qa_assessment: 'I have completed the QA impact assessment and it is accurate.',
  qa_head_approval: 'I approve the investigation and the proposed actions.',
  capa_open: 'I confirm all actions are complete with evidence and close this event.',
}
const CAN_RAISE = ['qa_exec', 'qc', 'hod']

function patchEvent(id: string, fn: (e: QEvent) => QEvent) {
  setState(s => ({ events: s.events.map(e => e.id === id ? fn(e) : e) }))
}

function NewEvent({ user, onDone }: { user: DemoUser; onDone: (id: string) => void }) {
  const st = useStore()
  const [a, setA] = useState<EventAnswers>({ what: '', area: user.role === 'qc' ? 'QC Lab' : 'Production', type: 'Equipment malfunction', batch: '', impact: 'unknown', repeat: false, immediate: '' })
  const [draft, setDraft] = useState<ReturnType<typeof draftEvent> | null>(null)
  const [desc, setDesc] = useState('')
  const set = <K extends keyof EventAnswers>(k: K, v: EventAnswers[K]) => { setA(p => ({ ...p, [k]: v })); setDraft(null) }

  const make = () => {
    const d = draftEvent(a); setDraft(d); setDesc(d.description)
    logAi('Event drafting', a.what, ['SOP-QA-005 §5.3'], 'shown')
  }
  const submit = () => {
    if (!draft) return
    const n = Math.max(...st.events.map(e => +e.id.split('-')[2])) + 1
    const id = `DEV-2026-0${n}`
    const ev: QEvent = {
      id, title: draft.title, description: desc, area: a.area, type: a.type, batch: a.batch, severity: draft.severity, stage: 'hod_review',
      raisedBy: user.id, raisedAt: now(), immediateAction: a.immediate, repeat: a.repeat, regulatoryFlag: draft.regulatoryFlag,
      precedentId: draft.precedentId, rootCauses: draft.rootCauses, signatures: [], actions: [],
    }
    setState(s => ({ events: [ev, ...s.events] }))
    logAudit('Raised quality event', id, `${draft.severity} · sent to HOD`)
    logAi('Event drafting', id, ['SOP-QA-005 §5.3'], desc === draft.description ? 'accepted' : 'edited')
    onDone(id)
  }

  return (
    <section className="record wizard">
      <div className="record-margin">New event</div>
      <div>
        <h2>Tell me what happened. I will ask the rest.</h2>
        <label className="field"><span>1. What happened, in your own words?</span>
          <textarea rows={3} value={a.what} onChange={e => set('what', e.target.value)} placeholder="e.g. Tablet hardness was checked 40 minutes late because the tester was being used by another line" /></label>
        <div className="field-row">
          <label className="field"><span>2. Where?</span>
            <select value={a.area} onChange={e => set('area', e.target.value)}>{['Production', 'QC Lab', 'Warehouse', 'Utilities'].map(x => <option key={x}>{x}</option>)}</select></label>
          <label className="field"><span>3. What kind of event?</span>
            <select value={a.type} onChange={e => set('type', e.target.value)}>{['Equipment malfunction', 'Procedure not followed', 'OOS/OOT result', 'Environmental excursion', 'Documentation error', 'Material mix-up'].map(x => <option key={x}>{x}</option>)}</select></label>
          <label className="field"><span>4. Batch number, if any</span>
            <input value={a.batch} onChange={e => set('batch', e.target.value)} placeholder="B-2611-05" /></label>
        </div>
        <div className="field-row">
          <fieldset className="field"><legend>5. Could product quality be affected?</legend>
            <div className="seg">{(['yes', 'no', 'unknown'] as const).map(x => <button type="button" key={x} className={a.impact === x ? 'is-on' : ''} onClick={() => set('impact', x)}>{x === 'unknown' ? 'Not sure' : x}</button>)}</div></fieldset>
          <fieldset className="field"><legend>6. Has this happened in the last 6 months?</legend>
            <div className="seg">{[true, false].map(x => <button type="button" key={String(x)} className={a.repeat === x ? 'is-on' : ''} onClick={() => set('repeat', x)}>{x ? 'Yes' : 'No'}</button>)}</div></fieldset>
        </div>
        <label className="field"><span>7. What did you do straight away?</span>
          <input value={a.immediate} onChange={e => set('immediate', e.target.value)} placeholder="e.g. Informed supervisor; tablets from that period kept aside" /></label>

        {!draft && <div className="row-end"><button className="btn" disabled={a.what.trim().length < 15} onClick={make}>Draft the record</button></div>}

        {draft && (
          <div className="draft">
            <div className="draft-head"><Stamp>AI draft — review before sending</Stamp><Sev s={draft.severity} /></div>
            <label className="field"><span>Description in GMP language (you can edit)</span>
              <textarea rows={5} value={desc} onChange={e => setDesc(e.target.value)} /></label>
            <p><b>Suggested classification: {draft.severity}.</b> {draft.why} <Stamp tone="green">Cited · SOP-QA-005 v4.0, §5.3 Classification</Stamp></p>
            <div className="gap-cols">
              <div><h4>Probable causes to check</h4><ul>{draft.rootCauses.map(x => <li key={x}>{x}</li>)}</ul>
                {draft.regulatoryFlag && <p className="notice">Critical event with a batch: Regulatory Affairs will be notified.</p>}</div>
              <PrecedentCard id={draft.precedentId} />
            </div>
            <div className="row-end"><button className="btn" onClick={submit}>Send to HOD for review</button></div>
          </div>
        )}
      </div>
    </section>
  )
}

function Detail({ e, user }: { e: QEvent; user: DemoUser }) {
  const myTurn = STAGE_OWNER[e.stage] === user.role
  const [remark, setRemark] = useState('')
  const [usedDraft, setUsedDraft] = useState(false)
  const [signing, setSigning] = useState(false)
  const allDone = e.actions.every(x => x.done)

  const useDraft = () => { setRemark(draftRemark(e, user.role)); setUsedDraft(true); logAi('Remark drafting', e.id, ['SOP-QA-005 §5.3', 'SOP-QA-008 §5.5'], 'shown') }
  const sign = () => {
    const next = NEXT[e.stage]!
    patchEvent(e.id, ev => ({
      ...ev, stage: next,
      signatures: [...ev.signatures, { userId: user.id, meaning: MEANING[ev.stage]!, at: now(), remark: remark || '—' }],
      actions: ev.stage === 'qa_head_approval' ? proposeActions(ev) : ev.actions,
    }))
    logAudit('E-signed', e.id, `${STAGE_LABEL[e.stage]} → ${STAGE_LABEL[next]}`)
    if (usedDraft) logAi('Remark drafting', e.id, [], remark === draftRemark(e, user.role) ? 'accepted' : 'edited')
    setSigning(false); setRemark(''); setUsedDraft(false)
  }
  const sendBack = () => {
    patchEvent(e.id, ev => ({ ...ev, stage: 'returned', signatures: [...ev.signatures, { userId: user.id, meaning: 'Returned for more information.', at: now(), remark: remark || 'More information needed.' }] }))
    logAudit('Returned event', e.id, remark || 'More information needed')
  }

  return (
    <article className="record detail">
      <div className="record-margin">{e.id}</div>
      <div>
        <div className="detail-head"><h2>{e.title}</h2><Sev s={e.severity} />{e.regulatoryFlag && <Stamp tone="red">Regulatory flag</Stamp>}</div>
        <ol className="flow">{FLOW.map(s => <li key={s} className={FLOW.indexOf(s) < FLOW.indexOf(e.stage) || e.stage === 'closed' ? 'is-done' : s === e.stage ? 'is-now' : ''}>{STAGE_LABEL[s]}</li>)}</ol>
        <p>{e.description}</p>
        <p className="muted mono">{e.area} · {e.type}{e.batch && ` · Batch ${e.batch}`} · raised by {userName(e.raisedBy)}, {fmt(e.raisedAt)}</p>

        <div className="gap-cols">
          <div><h4>Probable causes to check</h4><ul>{e.rootCauses.map(x => <li key={x}>{x}</li>)}</ul></div>
          <PrecedentCard id={e.precedentId} />
        </div>

        {!!e.signatures.length && <>
          <h4>Signatures</h4>
          {e.signatures.map((s, i) => (
            <div className="sig" key={i}><div><b>{userName(s.userId)}</b> <span className="mono">{fmt(s.at)}</span><br /><em>{s.meaning}</em></div><p>{s.remark}</p></div>
          ))}
        </>}

        {!!e.actions.length && <>
          <h4>Actions</h4>
          {e.actions.map((x, i) => (
            <label className="todo" key={i}>
              <input type="checkbox" checked={x.done} disabled={!(myTurn && e.stage === 'capa_open')}
                onChange={() => { patchEvent(e.id, ev => ({ ...ev, actions: ev.actions.map((y, j) => j === i ? { ...y, done: !y.done } : y) })); logAudit(x.done ? 'Re-opened action' : 'Completed action', e.id, x.text) }} />
              <span>{x.text}</span><small className="mono">{x.owner}</small>
            </label>
          ))}
        </>}

        {myTurn ? (
          <div className="act">
            <h4>Your action — {STAGE_LABEL[e.stage]}</h4>
            {e.stage !== 'capa_open' && <>
              <label className="field"><span>Your remark</span>
                <textarea rows={4} value={remark} onChange={ev => setRemark(ev.target.value)} placeholder="Write your remark, or start from an AI draft and edit it." /></label>
              <div className="row-end">
                <button className="btn ghost" onClick={useDraft}>Start from an AI draft</button>
                {e.stage === 'hod_review' && <button className="btn ghost" onClick={sendBack}>Send back</button>}
                <button className="btn" disabled={remark.trim().length < 10} onClick={() => setSigning(true)}>Approve and sign</button>
              </div>
            </>}
            {e.stage === 'capa_open' && <div className="row-end">
              <span className="muted">{allDone ? 'All actions are complete.' : 'Tick each action when its evidence is attached.'}</span>
              <button className="btn" disabled={!allDone} onClick={() => setSigning(true)}>Close and sign</button>
            </div>}
          </div>
        ) : e.stage !== 'closed' && e.stage !== 'returned' && (
          <p className="notice">Waiting for {USERS.find(u => u.role === STAGE_OWNER[e.stage])?.name} ({STAGE_LABEL[e.stage]}). Switch user at the bottom left to continue the flow.</p>
        )}
        {signing && <ESign meaning={MEANING[e.stage]!} onSign={sign} onCancel={() => setSigning(false)} />}
      </div>
    </article>
  )
}

export default function Records({ user }: { user: DemoUser }) {
  const st = useStore()
  const mineFirst = [...st.events].sort((a, b) => Number(STAGE_OWNER[b.stage] === user.role) - Number(STAGE_OWNER[a.stage] === user.role))
  const [sel, setSel] = useState<string | null>(mineFirst[0]?.id ?? null)
  const [creating, setCreating] = useState(false)
  const current = st.events.find(e => e.id === sel)

  return (
    <>
      <PageHead kicker="Deviations and laboratory events" title="Quality events">
        {CAN_RAISE.includes(user.role) && !creating && <button className="btn" onClick={() => setCreating(true)}>Raise an event</button>}
      </PageHead>
      {creating && <>
        <button className="link back" onClick={() => setCreating(false)}>← Back to events</button>
        <NewEvent user={user} onDone={id => { setCreating(false); setSel(id) }} />
      </>}
      {!creating && <div className="split">
        <div className="list">
          {mineFirst.map(e => (
            <button key={e.id} className={`listitem ${sel === e.id ? 'is-on' : ''}`} onClick={() => setSel(e.id)}>
              <span className="mono">{e.id}</span>
              <span className="listitem-title">{e.title}</span>
              <span className="listitem-meta"><Sev s={e.severity} /> {STAGE_LABEL[e.stage]}{STAGE_OWNER[e.stage] === user.role && <i className="badge">you</i>}</span>
            </button>
          ))}
        </div>
        <div>
          {current ? <Detail key={current.id} e={current} user={user} /> : <p className="muted">Select an event.</p>}
        </div>
      </div>}
    </>
  )
}
