import { useState, type ReactNode } from 'react'
import { PRECEDENTS, type Precedent } from './data/knowledge'
import type { Gap, Severity } from './data/seed'
import { USERS } from './data/users'
import { setState } from './lib/store'

export const userName = (id: string) => USERS.find(u => u.id === id)?.name ?? id

export function Sev({ s }: { s: Severity }) { return <span className={`sev sev-${s}`}>{s}</span> }

export function Stamp({ children, tone = 'ink' }: { children: ReactNode; tone?: 'ink' | 'green' | 'red' | 'amber' }) {
  return <span className={`stamp stamp-${tone}`}>{children}</span>
}

export function PageHead({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <header className="pagehead">
      <div>
        <div className="kicker">{kicker}</div>
        <h1>{title}</h1>
      </div>
      {children && <div className="pagehead-side">{children}</div>}
    </header>
  )
}

export function Dial({ value, size = 150, label }: { value: number; size?: number; label?: string }) {
  const r = size / 2 - 12, c = 2 * Math.PI * r
  const tone = value >= 85 ? 'var(--green)' : value >= 70 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="dial" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`${label ?? 'Readiness'} ${value} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--rule)" strokeWidth="10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth="10" strokeLinecap="butt"
          strokeDasharray={`${(value / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dasharray .6s ease' }} />
      </svg>
      <div className="dial-num"><b>{value}</b><span>/100</span></div>
    </div>
  )
}

export function PrecedentCard({ id, p }: { id?: string; p?: Precedent }) {
  const pr = p ?? PRECEDENTS.find(x => x.id === id)
  if (!pr) return null
  return (
    <aside className="precedent">
      <div className="precedent-top"><Stamp tone="red">Inspector precedent</Stamp><span className="mono">{pr.cfr}</span></div>
      <p className="precedent-theme">{pr.theme}</p>
      <p className="precedent-look"><b>What they look for:</b> {pr.inspectorLooksFor}</p>
    </aside>
  )
}

export function GapRow({ g, action }: { g: Gap; action?: ReactNode }) {
  return (
    <div className={`gaprow ${g.status === 'resolved' ? 'is-resolved' : ''}`}>
      <div className="gaprow-id mono">{g.id}</div>
      <div className="gaprow-main">
        <div className="gaprow-title">{g.title} <Sev s={g.severity} /></div>
        <div className="gaprow-meta mono">{g.cfr} · {g.sopRef}</div>
      </div>
      {action}
    </div>
  )
}

export function askAbout(question: string) { setState({ view: 'ask', askDraft: question }) }

export function ESign({ meaning, onSign, onCancel }: { meaning: string; onSign: () => void; onCancel: () => void }) {
  const [pw, setPw] = useState('')
  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-label="Electronic signature">
      <div className="modal">
        <div className="kicker">Electronic signature</div>
        <h3>Sign this record</h3>
        <p className="esign-meaning">“{meaning}”</p>
        <label className="field">
          <span>Re-enter your password to sign <em>(demo: type anything)</em></span>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && pw) onSign() }} />
        </label>
        <div className="row-end">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn" disabled={!pw} onClick={onSign}>Sign</button>
        </div>
      </div>
    </div>
  )
}
