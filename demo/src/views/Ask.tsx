import { useEffect, useRef, useState } from 'react'
import { PRECEDENTS } from '../data/knowledge'
import type { DemoUser } from '../data/users'
import { askAI, SUGGESTED } from '../lib/ai'
import { getState, logAi, now, setState, uid, useStore, type ChatMsg } from '../lib/store'
import { GapRow, PageHead, PrecedentCard, Stamp } from '../ui'

export default function Ask({ user }: { user: DemoUser }) {
  const st = useStore()
  const msgs = st.chats[user.id] ?? []
  const [text, setText] = useState(st.askDraft)
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const sentDraft = useRef(false)

  const send = (q: string) => {
    q = q.trim(); if (!q || thinking) return
    const mine: ChatMsg = { id: uid(), from: 'user', text: q, at: now() }
    setState(s => ({ chats: { ...s.chats, [user.id]: [...(s.chats[user.id] ?? []), mine] } }))
    setText(''); setThinking(true)
    setTimeout(() => {
      const cur = getState()
      const a = askAI(q, user, cur)
      const docCode = (id: string) => cur.docs.find(d => d.id === id)?.code ?? id
      const ai: ChatMsg = {
        id: uid(), from: 'ai', text: a.paragraphs.join(' '), at: now(), paragraphs: a.paragraphs,
        chunkIds: a.chunks.map(c => c.id), precedentIds: a.precedents.map(p => p.id), gapIds: a.gaps.map(g => g.id), notFound: a.notFound,
      }
      setState(s => ({ chats: { ...s.chats, [user.id]: [...(s.chats[user.id] ?? []), ai] } }))
      logAi('Ask', q, [...a.chunks.map(c => `${docCode(c.docId)} §${c.section}`), ...a.precedents.map(p => p.cfr)], a.notFound ? 'no source found' : 'shown')
      setThinking(false)
    }, 650)
  }

  useEffect(() => {
    if (st.askDraft && !sentDraft.current) { sentDraft.current = true; const q = st.askDraft; setState({ askDraft: '' }); send(q) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [msgs.length, thinking])

  return (
    <>
      <PageHead kicker={`Answering as your site's procedures, for ${user.title}`} title="Ask the company AI" />
      <div className="chat">
        {!msgs.length && (
          <div className="chat-empty">
            <p>Ask in plain words. I answer only from what is indexed for this site, and I show the section I used.</p>
            <div className="chips">{SUGGESTED[user.role].map(q => <button key={q} className="chip" onClick={() => send(q)}>{q}</button>)}</div>
          </div>
        )}
        {msgs.map(m => m.from === 'user' ? (
          <div className="q" key={m.id}><span className="avatar xs">{user.initials}</span><p>{m.text}</p></div>
        ) : (
          <article className={`record answer ${m.notFound ? 'is-notfound' : ''}`} key={m.id}>
            <div className="record-margin">{m.notFound ? 'No source' : 'Answer'}</div>
            <div>
              {(m.paragraphs ?? [m.text]).map((p, i) => {
                const cite = p.match(/^(.*) \[(.+)\]$/)
                return cite
                  ? <p key={i}>{cite[1]} <Stamp tone="green">Cited · {cite[2]}</Stamp></p>
                  : <p key={i}>{p}</p>
              })}
              {m.precedentIds?.map(id => <PrecedentCard key={id} p={PRECEDENTS.find(p => p.id === id)} />)}
              {!!m.gapIds?.length && (
                <div className="answer-gaps">
                  {m.gapIds.map(id => { const g = st.gaps.find(x => x.id === id); return g ? <GapRow key={id} g={g} /> : null })}
                  <button className="link" onClick={() => setState({ view: 'readiness' })}>Open in readiness →</button>
                </div>
              )}
              {m.notFound && <Stamp tone="amber">Logged as possible SOP coverage gap</Stamp>}
            </div>
          </article>
        ))}
        {thinking && <div className="thinking"><i /><i /><i /> Searching indexed procedures…</div>}
        <div ref={endRef} />
      </div>
      <form className="composer" onSubmit={e => { e.preventDefault(); send(text) }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="e.g. I got an OOS result. Can I retest?" aria-label="Your question" />
        <button className="btn" disabled={!text.trim() || thinking}>Ask</button>
      </form>
    </>
  )
}
