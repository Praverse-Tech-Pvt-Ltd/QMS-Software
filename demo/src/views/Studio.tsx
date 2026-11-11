import { useState } from 'react'
import type { DemoUser } from '../data/users'
import { relatedPrecedent } from '../lib/ai'
import { logAi, logAudit } from '../lib/store'
import { buildMbr, draftResponse, evalTriggers, FACTS, FORMS, type MbrInput } from '../lib/studio'
import { PageHead, PrecedentCard, Stamp } from '../ui'

function Mbr() {
  const [i, setI] = useState<MbrInput>({ product: 'Demo Tablets 500 mg', form: 'oral_solid_tablet', batchSize: '', yieldFormula: '', excluded: [], limits: {} })
  const [built, setBuilt] = useState(false)
  const r = buildMbr(i)
  const up = (p: Partial<MbrInput>) => setI(x => ({ ...x, ...p }))
  return (
    <>
      <div className="field-row">
        <label className="field"><span>Product</span><input value={i.product} onChange={e => up({ product: e.target.value })} /></label>
        <label className="field"><span>Dosage form</span>
          <select value={i.form} onChange={e => up({ form: e.target.value, excluded: [], limits: {} })}>{Object.entries(FORMS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
        <label className="field"><span>Batch size</span><input value={i.batchSize} onChange={e => up({ batchSize: e.target.value })} placeholder="e.g. 200 kg" /></label>
        <label className="field"><span>Yield formula</span><input value={i.yieldFormula} onChange={e => up({ yieldFormula: e.target.value })} placeholder="actual ÷ theoretical × 100" /></label>
      </div>
      <div className="row-end"><button className="btn" onClick={() => { setBuilt(true); logAi('MBR skeleton', i.product, ['Stage library 0.1-draft'], 'shown'); logAudit('Generated MBR skeleton', i.product, FORMS[i.form].label) }}>Generate batch record skeleton</button></div>

      {built && <>
        <div className="checks">
          {r.blocking.map(b => <p key={b} className="check block"><Stamp tone="red">Blocks approval</Stamp> {b}</p>)}
          {!r.blocking.length && <p className="check ok"><Stamp tone="green">Ready for review</Stamp> No blocking items. Limits are never invented — enter them from your approved specification.</p>}
          {r.advisory.map(b => <p key={b} className="check">{b}</p>)}
        </div>
        <div className="mbr">
          <div className="mbr-head"><b>MASTER BATCH RECORD — DRAFT</b><span className="mono">{i.product || '—'} · {FORMS[i.form].label} · Batch size {i.batchSize || '—'}</span></div>
          {r.steps.map(s => (
            <div className="mbr-step" key={s.key}>
              <div className="mbr-n mono">{String(s.n).padStart(2, '0')}</div>
              <div>
                <b>{s.title}</b> {s.critical && <Stamp tone="red">Critical · e-sign</Stamp>}
                <div className="mbr-fields">{s.records.map(f => <span key={f}>{f}<i /></span>)}</div>
                {!!s.ipqc.length && (
                  <div className="mbr-ipqc">In-process checks: {s.ipqc.join(', ')}
                    <input placeholder="Limits from specification" value={i.limits[s.key] ?? ''} onChange={e => up({ limits: { ...i.limits, [s.key]: e.target.value } })} />
                  </div>
                )}
              </div>
              {!['line_clearance', 'dispensing', 'yield_reconciliation', 'batch_review'].includes(s.key) &&
                <button className="link" onClick={() => up({ excluded: [...i.excluded, s.key] })}>Remove</button>}
            </div>
          ))}
        </div>
      </>}
    </>
  )
}

function Triggers() {
  const [facts, setFacts] = useState<string[]>([])
  const hits = evalTriggers(facts)
  return (
    <div className="gap-cols">
      <div>
        <h4>What is changing?</h4>
        {FACTS.map(f => (
          <label className="todo" key={f.key}>
            <input type="checkbox" checked={facts.includes(f.key)} onChange={() => setFacts(x => x.includes(f.key) ? x.filter(k => k !== f.key) : [...x, f.key])} />
            <span>{f.label}</span>
          </label>
        ))}
      </div>
      <div>
        <h4>Possible filing triggers</h4>
        {!hits.length && <p className="muted">Tick what applies. Nothing flagged yet.</p>}
        {hits.map(h => (
          <div className={`trigger risk-${h.risk}`} key={h.id}>
            <div><span className="mono">{h.id}</span> <b>{h.name}</b> <span className={`sev sev-${h.risk === 'high' ? 'critical' : h.risk === 'medium' ? 'major' : 'minor'}`}>{h.risk}</span></div>
            <ul>{h.possible.map(p => <li key={p}>{p}</li>)}</ul>
          </div>
        ))}
        {!!hits.length && <p className="notice">Possible triggers only. Regulatory Affairs confirms the category for each market.</p>}
      </div>
    </div>
  )
}

function Response483() {
  const [obs, setObs] = useState('')
  const [out, setOut] = useState<ReturnType<typeof draftResponse> | null>(null)
  const prec = obs.length > 30 ? relatedPrecedent(obs) : null
  return (
    <>
      <label className="field"><span>Paste the observation text</span>
        <textarea rows={4} value={obs} onChange={e => { setObs(e.target.value); setOut(null) }}
          placeholder="e.g. Audit trails for the chromatography data system are not reviewed before batch release, and analysts share a common login." /></label>
      <div className="row-end">
        <button className="btn ghost" onClick={() => { setObs('Audit trails for the chromatography data system are not reviewed before batch release, and analysts share a common login.'); setOut(null) }}>Use an example</button>
        <button className="btn" disabled={obs.trim().length < 30} onClick={() => { setOut(draftResponse(obs, prec?.cfr ?? '')); logAi('483 response skeleton', obs.slice(0, 80), prec ? [prec.cfr] : [], 'shown') }}>Build response skeleton</button>
      </div>
      {out && (
        <div className="gap-cols">
          <div className="response">
            {out.map(s => <section key={s.h}><h4>{s.h}</h4><p className={s.t.startsWith('[') ? 'todo-text' : ''}>{s.t}</p></section>)}
          </div>
          <div>
            {prec && <PrecedentCard p={prec} />}
            <p className="notice">A skeleton, not a response. The facts, root cause and commitments are written by QA and reviewed by an expert before anything is sent.</p>
          </div>
        </div>
      )}
    </>
  )
}

export default function Studio({ user }: { user: DemoUser }) {
  const tabs = [
    { k: 'mbr', label: 'Batch record (MBR)', roles: ['qa_exec', 'hod', 'qa_head'] },
    { k: 'trig', label: 'Filing triggers', roles: ['ra', 'qa_head', 'qa_exec'] },
    { k: 'resp', label: '483 response', roles: ['qa_head', 'ra', 'qa_exec'] },
  ].filter(t => t.roles.includes(user.role))
  const [tab, setTab] = useState(tabs[0].k)
  return (
    <>
      <PageHead kicker="First drafts from expert-authored templates · draft library, pending expert review" title="Document studio" />
      <div className="tabs" role="tablist">{tabs.map(t => <button key={t.k} role="tab" aria-selected={tab === t.k} className={tab === t.k ? 'is-on' : ''} onClick={() => setTab(t.k)}>{t.label}</button>)}</div>
      <section className="panel">
        {tab === 'mbr' && <Mbr />}
        {tab === 'trig' && <Triggers />}
        {tab === 'resp' && <Response483 />}
      </section>
    </>
  )
}
