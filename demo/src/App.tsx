import { useState } from 'react'
import { COMPANY, NAV, USERS, type DemoUser } from './data/users'
import { STAGE_OWNER } from './data/seed'
import { logAudit, resetDemo, setState, useStore } from './lib/store'
import Home from './views/Home'
import Ask from './views/Ask'
import Knowledge from './views/Knowledge'
import Readiness from './views/Readiness'
import Records from './views/Records'
import Studio from './views/Studio'
import { Filings, Governance } from './views/Admin'
import Compare from './views/Compare'
import { readiness } from './lib/ai'

function Login() {
  return (
    <main className="login">
      <section className="login-left">
        <div className="brandmark">iPharma<span>AI</span></div>
        <h1>The company AI that reads your SOPs the way an inspector would.</h1>
        <p className="lede">
          Add your procedures. Ask questions and get answers cited to the section. Raise an event and be guided
          through it. See, every day, what an inspector would find — and fix it first.
        </p>
        <ul className="login-points">
          <li><b>Cited or silent.</b> No source, no answer.</li>
          <li><b>People decide.</b> The AI drafts; humans review and e-sign.</li>
          <li><b>Every role, one truth.</b> Sign in as different people to see the same record move.</li>
        </ul>
        <p className="demo-note">Demo with invented data for a fictional company. Nothing leaves this browser.</p>
      </section>
      <section className="login-right" aria-label="Choose a demo user">
        <div className="kicker">Sign in as</div>
        <div className="usergrid">
          {USERS.map((u, i) => (
            <button key={u.id} className="usercard" style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => { setState({ userId: u.id, view: 'home' }); logAudit('Signed in', 'session', u.title) }}>
              <span className="avatar">{u.initials}</span>
              <span className="usercard-body">
                <b>{u.name}</b>
                <span className="usercard-title">{u.title}</span>
                <span className="usercard-blurb">{u.blurb}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

export default function App() {
  const st = useStore()
  const [switching, setSwitching] = useState(false)
  const [quick, setQuick] = useState('')
  const [askNonce, setAskNonce] = useState(0)
  const user = USERS.find(u => u.id === st.userId)
  if (!user) return <Login />

  const nav = NAV.filter(n => n.roles === 'all' || n.roles.includes(user.role))
  const view = nav.some(n => n.key === st.view) ? st.view : 'home'
  const score = readiness(st.gaps).overall
  const queueCount = st.events.filter(e => STAGE_OWNER[e.stage] === user.role).length

  const switchTo = (u: DemoUser) => {
    setSwitching(false); setState({ userId: u.id, view: 'home' }); logAudit('Signed in', 'session', u.title)
  }

  return (
    <div className="shell">
      <aside className="side">
        <div className="brandmark small">iPharma<span>AI</span></div>
        <div className="side-site">{COMPANY.name}<br /><span>{COMPANY.site}</span></div>
        <nav aria-label="Main">
          {nav.map(n => (
            <button key={n.key} className={`navitem ${view === n.key ? 'is-on' : ''}`} onClick={() => setState({ view: n.key })}>
              <span>{n.label}{n.key === 'records' && queueCount > 0 && <i className="badge">{queueCount}</i>}</span>
              <small>{n.hint}</small>
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <button className="whoami" onClick={() => setSwitching(s => !s)} aria-expanded={switching}>
            <span className="avatar sm">{user.initials}</span>
            <span><b>{user.name}</b><small>{user.title}</small></span>
            <span className="chev">{switching ? '▾' : '▴'}</span>
          </button>
          {switching && (
            <div className="switcher">
              <div className="kicker">Switch demo user</div>
              {USERS.filter(u => u.id !== user.id).map(u => (
                <button key={u.id} onClick={() => switchTo(u)}><span className="avatar xs">{u.initials}</span>{u.name}<small>{u.title}</small></button>
              ))}
              <button className="switcher-reset" onClick={() => { if (confirm('Reset all demo data to the starting state?')) resetDemo() }}>Reset demo data</button>
            </div>
          )}
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <form className="quick" onSubmit={e => { e.preventDefault(); if (quick.trim()) { setState({ view: 'ask', askDraft: quick.trim() }); setQuick(''); setAskNonce(n => n + 1) } }}>
            <span aria-hidden="true">⌕</span>
            <input value={quick} onChange={e => setQuick(e.target.value)} placeholder="Ask anything about your procedures…" aria-label="Quick question" />
          </form>
          {user.role !== 'cto' && (
            <button className={`pill ${score >= 85 ? 'ok' : score >= 70 ? 'warn' : 'bad'}`} onClick={() => setState({ view: 'readiness' })} title="Open inspection readiness">
              <i />Readiness <b>{score}</b>
            </button>
          )}
          <span className="demotag">Demo · invented data</span>
        </header>
        <div className="page" key={user.id + view + askNonce}>
          {view === 'home' && <Home user={user} />}
          {view === 'ask' && <Ask user={user} />}
          {view === 'knowledge' && <Knowledge user={user} />}
          {view === 'readiness' && <Readiness user={user} />}
          {view === 'records' && <Records user={user} />}
          {view === 'studio' && <Studio user={user} />}
          {view === 'filings' && <Filings />}
          {view === 'governance' && <Governance />}
          {view === 'compare' && <Compare />}
        </div>
      </div>
    </div>
  )
}
