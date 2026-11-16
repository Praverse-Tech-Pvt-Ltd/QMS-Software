import { useState } from 'react'
import { FILINGS } from '../data/seed'
import { NAV, USERS } from '../data/users'
import { fmt, useStore } from '../lib/store'
import { PageHead, Stamp, userName } from '../ui'

export function Filings() {
  const st = useStore()
  const flagged = st.events.filter(e => e.regulatoryFlag && e.stage !== 'closed')
  return (
    <>
      <PageHead kicker="Registered state and what is due" title="Filings" />
      <section className="panel flush">
        <table className="table">
          <thead><tr><th>Product</th><th>Type</th><th>Market</th><th>Reference</th><th>Status</th><th>Next step</th><th>Due</th></tr></thead>
          <tbody>{FILINGS.map(f => (
            <tr key={f.id}><td>{f.product}</td><td>{f.type}</td><td>{f.market}</td><td className="mono">{f.ref}</td>
              <td>{f.status === 'Deficiency query' ? <Stamp tone="red">{f.status}</Stamp> : <Stamp tone="green">{f.status}</Stamp>}</td>
              <td>{f.next}</td><td className="mono">{new Date(f.due).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td></tr>
          ))}</tbody>
        </table>
      </section>
      <section className="panel">
        <h2>Quality events flagged for regulatory review</h2>
        {flagged.map(e => <div className="activity" key={e.id}><span className="mono">{e.id}</span><b>{e.title}</b><span>Batch {e.batch || '—'}</span></div>)}
        {!flagged.length && <p className="muted">None open.</p>}
        <p className="muted">Critical events with a batch are flagged automatically when they are raised, so Regulatory Affairs hears about them on day one.</p>
      </section>
    </>
  )
}

export function Governance() {
  const st = useStore()
  const [tab, setTab] = useState<'ai' | 'audit' | 'access'>('ai')
  const nf = st.aiLog.filter(l => l.outcome === 'no source found').length
  return (
    <>
      <PageHead kicker="Every AI output and every human action is a record" title="AI governance" />
      <div className="tiles">
        <div className="tile"><b className="mono">{st.aiLog.length}</b><span>AI outputs logged</span></div>
        <div className="tile"><b className="mono">{st.aiLog.filter(l => l.outcome === 'edited').length}</b><span>Drafts edited by a person before signing</span></div>
        <div className="tile"><b className="mono">{nf}</b><span>Questions with no source (answer withheld)</span></div>
        <div className="tile"><b className="mono">{st.audit.length}</b><span>Audit trail entries</span></div>
      </div>
      <div className="tabs" role="tablist">
        {([['ai', 'AI output log'], ['audit', 'Audit trail'], ['access', 'Roles and access']] as const).map(([k, l]) =>
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      <section className="panel flush">
        {tab === 'ai' && (
          <table className="table">
            <thead><tr><th>When</th><th>User</th><th>Feature</th><th>Input</th><th>Sources used</th><th>Outcome</th><th>Rules ver.</th></tr></thead>
            <tbody>
              {st.aiLog.map(l => (
                <tr key={l.id}><td className="mono">{fmt(l.at)}</td><td>{userName(l.userId)}</td><td>{l.feature}</td><td>{l.input.slice(0, 60)}</td>
                  <td className="mono">{l.sources.join(' · ') || '—'}</td>
                  <td><Stamp tone={l.outcome === 'no source found' ? 'amber' : l.outcome === 'edited' ? 'ink' : 'green'}>{l.outcome}</Stamp></td><td className="mono">{l.promptVersion}</td></tr>
              ))}
              {!st.aiLog.length && <tr><td colSpan={7} className="muted">Nothing yet. Ask a question or draft a record as any user, then come back.</td></tr>}
            </tbody>
          </table>
        )}
        {tab === 'audit' && (
          <table className="table">
            <thead><tr><th>When</th><th>User</th><th>Action</th><th>Record</th><th>Detail</th></tr></thead>
            <tbody>
              {st.audit.map(a => <tr key={a.id}><td className="mono">{fmt(a.at)}</td><td>{userName(a.userId)}</td><td>{a.action}</td><td className="mono">{a.record}</td><td>{a.detail}</td></tr>)}
              {!st.audit.length && <tr><td colSpan={5} className="muted">Nothing yet.</td></tr>}
            </tbody>
          </table>
        )}
        {tab === 'access' && (
          <table className="table">
            <thead><tr><th>User</th><th>Role</th><th>Can open</th></tr></thead>
            <tbody>{USERS.map(u => (
              <tr key={u.id}><td>{u.name}</td><td>{u.title}</td>
                <td>{NAV.filter(n => n.roles === 'all' || n.roles.includes(u.role)).map(n => n.label).join(' · ')}</td></tr>
            ))}</tbody>
          </table>
        )}
      </section>
    </>
  )
}
