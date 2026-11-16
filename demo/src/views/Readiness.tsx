import { useState } from 'react'
import { SYSTEMS, type SystemKey } from '../data/knowledge'
import { USERS, type DemoUser } from '../data/users'
import { readiness } from '../lib/ai'
import { logAudit, setState, useStore } from '../lib/store'
import { askAbout, Dial, PageHead, PrecedentCard, Sev, Stamp } from '../ui'
import { PRECEDENTS } from '../data/knowledge'

export default function Readiness({ user }: { user: DemoUser }) {
  const st = useStore()
  const r = readiness(st.gaps)
  const [sys, setSys] = useState<SystemKey | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const list = st.gaps.filter(g => sys === 'all' || g.system === sys)
  const openCount = st.gaps.filter(g => g.status === 'open').length

  const resolve = (id: string) => {
    setState(s => ({ gaps: s.gaps.map(g => g.id === id ? { ...g, status: 'resolved' as const, resolvedBy: user.id } : g) }))
    logAudit('Marked gap resolved', id, 'Evidence attached (demo)')
  }

  return (
    <>
      <PageHead kicker="All-time readiness: be ready any day, not the week before" title="What an inspector would find today" />
      <section className="ready-hero">
        <Dial value={r.overall} size={190} />
        <div>
          <p className="ready-line"><b>{openCount}</b> open gap{openCount === 1 ? '' : 's'} across six systems.</p>
          <p className="muted">The score falls with each open gap, weighted by severity. Close a gap with evidence and it rises. The questions below are the ones an inspector is likely to ask.</p>
        </div>
        <div className="systiles">
          <button className={`systile ${sys === 'all' ? 'is-on' : ''}`} onClick={() => setSys('all')}><span>All systems</span><b className="mono">{r.overall}</b></button>
          {SYSTEMS.map(s => (
            <button key={s.key} className={`systile ${sys === s.key ? 'is-on' : ''}`} onClick={() => setSys(s.key)}>
              <span>{s.label}</span><b className="mono" style={{ color: r.bySystem[s.key] >= 85 ? 'var(--green)' : r.bySystem[s.key] >= 70 ? 'var(--amber)' : 'var(--red)' }}>{r.bySystem[s.key]}</b>
            </button>
          ))}
        </div>
      </section>

      {list.map(g => {
        const open = openId === g.id
        const owner = USERS.find(u => u.role === g.ownerRole)
        const mine = g.ownerRole === user.role || user.role === 'qa_head'
        const prec = PRECEDENTS.find(p => g.cfr.startsWith(p.cfr.split('(')[0]) && p.system === g.system) ?? PRECEDENTS.find(p => g.cfr.startsWith(p.cfr.split('(')[0]))
        return (
          <article key={g.id} className={`record gap ${g.status === 'resolved' ? 'is-resolved' : ''}`}>
            <div className="record-margin">{g.id}</div>
            <div>
              <button className="gap-head" onClick={() => setOpenId(open ? null : g.id)} aria-expanded={open}>
                <span className="gap-title">{g.title}</span>
                <Sev s={g.severity} />
                {g.status === 'resolved' ? <Stamp tone="green">Resolved</Stamp> : <span className="mono muted">{g.cfr}</span>}
              </button>
              <p className="muted">{g.detail} <span className="mono">Owner: {owner?.name} · {g.sopRef}</span></p>
              {open && (
                <div className="gap-body">
                  <blockquote className="inspector">“{g.inspectorQuestion}”<cite>Likely inspector question</cite></blockquote>
                  <div className="gap-cols">
                    <div>
                      <h4>What to do, in order</h4>
                      <ol>{g.guidance.map(x => <li key={x}>{x}</li>)}</ol>
                    </div>
                    <PrecedentCard p={prec} />
                  </div>
                  <div className="row-end">
                    <button className="btn ghost" onClick={() => askAbout(`What does our procedure require here: ${g.title}?`)}>Ask the AI about this</button>
                    {g.status === 'open' && (mine
                      ? <button className="btn" onClick={() => resolve(g.id)}>Mark resolved with evidence</button>
                      : <span className="muted">Only {owner?.name} or the Head of Quality can resolve this.</span>)}
                  </div>
                </div>
              )}
            </div>
          </article>
        )
      })}
    </>
  )
}
