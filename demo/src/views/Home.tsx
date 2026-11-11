import { SYSTEMS } from '../data/knowledge'
import { STAGE_LABEL, STAGE_OWNER } from '../data/seed'
import type { DemoUser } from '../data/users'
import { readiness, SUGGESTED } from '../lib/ai'
import { fmt, setState, useStore } from '../lib/store'
import { askAbout, Dial, GapRow, PageHead, Sev, userName } from '../ui'

export default function Home({ user }: { user: DemoUser }) {
  const st = useStore()
  const r = readiness(st.gaps)
  const open = st.gaps.filter(g => g.status === 'open')
  const mineGaps = open.filter(g => g.ownerRole === user.role)
  const queue = st.events.filter(e => STAGE_OWNER[e.stage] === user.role)
  const exec = user.role === 'ceo' || user.role === 'qa_head'
  const critical = open.filter(g => g.severity === 'critical')

  const briefing: string[] = []
  if (user.role === 'cto') {
    briefing.push(`${st.docs.length} documents and ${st.chunks.length} passages are indexed. ${st.aiLog.length} AI outputs logged this session.`)
    const nf = st.aiLog.filter(l => l.outcome === 'no source found').length
    briefing.push(nf ? `${nf} question${nf > 1 ? 's' : ''} had no source — these point to missing SOP coverage.` : 'No unanswered questions so far.')
    briefing.push('Model changes go through change control; the current answer rules are version demo-rules-0.1.')
  } else {
    briefing.push(`Site readiness is ${r.overall}/100. Weakest area: ${SYSTEMS.find(s => s.key === r.weakest)!.label.toLowerCase()} at ${r.bySystem[r.weakest]}.`)
    if (queue.length) briefing.push(`${queue.length} quality event${queue.length > 1 ? 's are' : ' is'} waiting for your action: ${queue.map(e => e.id).join(', ')}.`)
    if (exec) briefing.push(critical.length ? `${critical.length} critical gap is open: “${critical[0].title}”. An inspector would likely start there.` : 'No critical gaps are open today.')
    else if (mineGaps.length) briefing.push(`You own ${mineGaps.length} open gap${mineGaps.length > 1 ? 's' : ''}. Start with “${mineGaps[0].title}”.`)
    else briefing.push('You own no open readiness gaps.')
    if (user.role === 'ra') briefing.push('One agency query is due on 28 Nov, and DEV-2026-039 carries a regulatory flag for your review.')
  }

  return (
    <>
      <PageHead kicker={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} title={`Good day, ${user.name.split(' ')[0]}.`}>
        <button className="btn" onClick={() => setState({ view: 'ask' })}>Ask the company AI</button>
      </PageHead>

      <section className="briefing record">
        <div className="record-margin">AI briefing</div>
        <div>
          {briefing.map((b, i) => <p key={i}>{b}</p>)}
          <div className="chips">
            {SUGGESTED[user.role].map(q => <button key={q} className="chip" onClick={() => askAbout(q)}>{q}</button>)}
          </div>
        </div>
      </section>

      <div className="grid-2">
        {user.role !== 'cto' && (
          <section className="panel">
            <h2>All-time readiness</h2>
            <div className="ready">
              <Dial value={r.overall} />
              <div className="bars">
                {SYSTEMS.map(s => (
                  <div className="bar" key={s.key}>
                    <span>{s.label}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${r.bySystem[s.key]}%`, background: r.bySystem[s.key] >= 85 ? 'var(--green)' : r.bySystem[s.key] >= 70 ? 'var(--amber)' : 'var(--red)' }} /></div>
                    <b className="mono">{r.bySystem[s.key]}</b>
                  </div>
                ))}
              </div>
            </div>
            <button className="link" onClick={() => setState({ view: 'readiness' })}>See what an inspector would find →</button>
          </section>
        )}

        {user.role === 'cto' ? (
          <section className="panel">
            <h2>AI system status</h2>
            <dl className="kv">
              <dt>Answer engine</dt><dd>Local, retrieval first <span className="mono">demo-rules-0.1</span></dd>
              <dt>Data location</dt><dd>On-site. No document leaves the network.</dd>
              <dt>Rule</dt><dd>No source, no answer. Humans approve and e-sign.</dd>
              <dt>Validation</dt><dd>GAMP 5 risk-based; AI features are advisory only.</dd>
            </dl>
            <button className="link" onClick={() => setState({ view: 'governance' })}>Open AI governance →</button>
          </section>
        ) : exec ? (
          <section className="panel">
            <h2>Top open gaps</h2>
            {open.slice().sort((a, b) => (a.severity === 'critical' ? -1 : 0) - (b.severity === 'critical' ? -1 : 0)).slice(0, 4).map(g => <GapRow key={g.id} g={g} />)}
            {!open.length && <p className="muted">Nothing open.</p>}
          </section>
        ) : (
          <section className="panel">
            <h2>Waiting for you</h2>
            {queue.map(e => (
              <button className="queue" key={e.id} onClick={() => setState({ view: 'records' })}>
                <span className="mono">{e.id}</span>
                <span className="queue-title">{e.title}</span>
                <Sev s={e.severity} /><small>{STAGE_LABEL[e.stage]}</small>
              </button>
            ))}
            {mineGaps.map(g => <GapRow key={g.id} g={g} />)}
            {!queue.length && !mineGaps.length && <p className="muted">Nothing is waiting for you.</p>}
          </section>
        )}
      </div>

      <section className="panel">
        <h2>Recent activity</h2>
        {st.audit.slice(0, 6).map(a => (
          <div className="activity" key={a.id}><span className="mono">{fmt(a.at)}</span><b>{userName(a.userId)}</b><span>{a.action} — {a.record}</span></div>
        ))}
        {!st.audit.length && <p className="muted">Activity from all users appears here as you use the demo.</p>}
      </section>
    </>
  )
}
