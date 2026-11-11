import { useRef, useState } from 'react'
import { SAMPLE_UPLOAD, type Chunk, type Doc, type Precedent } from '../data/knowledge'
import { CAN_UPLOAD, type DemoUser } from '../data/users'
import { chunkText, guessSystem, relatedPrecedent } from '../lib/ai'
import { fmt, logAi, logAudit, now, setState, uid, useStore } from '../lib/store'
import { askAbout, PageHead, PrecedentCard, Stamp, userName } from '../ui'

const STEPS = ['Read file', 'Split into passages', 'Index for search', 'Check against inspection themes']

interface Job { name: string; step: number; done: boolean; passages: number; precedent: Precedent | null; note?: string }

export default function Knowledge({ user }: { user: DemoUser }) {
  const st = useStore()
  const canUpload = CAN_UPLOAD.includes(user.role)
  const [job, setJob] = useState<Job | null>(null)
  const [openDoc, setOpenDoc] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const ingest = (name: string, text: string | null) => {
    const docId = 'u' + uid()
    const parts = text ? chunkText(text) : []
    const note = text ? undefined : 'This demo reads text files only. In the product, PDF and Word files go through the parsing service.'
    const system = guessSystem(text ?? name)
    const base = name.replace(/\.[a-z0-9]+$/i, '')
    const code = base.match(/^[A-Z]{2,4}-[A-Z]{2}-\d{3}/)?.[0] ?? 'UPLOAD'
    const tags = base.toLowerCase().split(/[^a-z0-9+]+/).filter(w => w.length > 2)
    const chunks: Chunk[] = parts.map((p, i) => ({ id: `${docId}-${i}`, docId, section: p.section, text: p.text, system, tags }))
    const doc: Doc = { id: docId, code, title: base.replace(/^[A-Z]{2,4}-[A-Z]{2}-\d{3}\s*/, '') || base, version: '1.0', dept: user.dept, kind: 'Upload', uploadedBy: user.id, uploadedAt: now(), status: 'indexed', note }
    const precedent = text ? relatedPrecedent(text) : null

    setJob({ name, step: 0, done: false, passages: chunks.length, precedent, note })
    STEPS.forEach((_, i) => setTimeout(() => setJob(j => j && { ...j, step: i + 1 }), 550 * (i + 1)))
    setTimeout(() => {
      setState(s => ({ docs: [doc, ...s.docs], chunks: [...chunks, ...s.chunks] }))
      logAudit('Uploaded document', code === 'UPLOAD' ? name : code, `${chunks.length} passages indexed`)
      logAi('Document gap-check', name, precedent ? [precedent.cfr] : [], 'shown')
      setJob(j => j && { ...j, done: true })
    }, 550 * (STEPS.length + 1))
  }

  const onFile = (f: File | undefined) => {
    if (!f) return
    if (/\.(txt|md)$/i.test(f.name)) f.text().then(t => ingest(f.name, t))
    else ingest(f.name, null)
  }

  return (
    <>
      <PageHead kicker={`${st.docs.length} documents · ${st.chunks.length} searchable passages`} title="Knowledge base">
        {canUpload && <>
          <button className="btn ghost" onClick={() => ingest(SAMPLE_UPLOAD.name, SAMPLE_UPLOAD.text)}>Try with a sample SOP</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Add a file</button>
          <input ref={fileRef} type="file" hidden accept=".txt,.md,.pdf,.docx" onChange={e => { onFile(e.target.files?.[0]); e.target.value = '' }} />
        </>}
      </PageHead>

      {!canUpload && <p className="notice">Your role can read and ask. Adding files is limited to QA and IT — sign in as Priya, Anita or Arjun to try it.</p>}

      {job && (
        <section className="record ingest">
          <div className="record-margin">{job.done ? 'Indexed' : 'Indexing'}</div>
          <div>
            <b>{job.name}</b>
            <ol className="steps">
              {STEPS.map((s, i) => <li key={s} className={job.step > i ? 'is-done' : job.step === i ? 'is-now' : ''}>{s}</li>)}
            </ol>
            {job.done && <>
              {job.note
                ? <p className="notice">{job.note} The file is listed but has no searchable passages.</p>
                : <p>{job.passages} passages are now searchable by every user. <button className="link" onClick={() => askAbout('How often is backup restore tested?')}>Try a question about it →</button></p>}
              {job.precedent && <><p className="muted">This document covers an area inspectors often cite:</p><PrecedentCard p={job.precedent} /></>}
              <button className="link" onClick={() => setJob(null)}>Dismiss</button>
            </>}
          </div>
        </section>
      )}

      <section className="panel flush">
        <table className="table">
          <thead><tr><th>Code</th><th>Title</th><th>Ver.</th><th>Department</th><th>Passages</th><th>Added by</th><th /></tr></thead>
          <tbody>
            {st.docs.map(d => {
              const cs = st.chunks.filter(c => c.docId === d.id)
              const open = openDoc === d.id
              return [
                <tr key={d.id} className="is-click" onClick={() => setOpenDoc(open ? null : d.id)}>
                  <td className="mono">{d.code}</td><td>{d.title}</td><td className="mono">{d.version}</td><td>{d.dept}</td>
                  <td className="mono">{cs.length}</td><td>{userName(d.uploadedBy)}<small> · {fmt(d.uploadedAt)}</small></td>
                  <td>{d.kind === 'Upload' ? <Stamp tone="amber">New</Stamp> : <Stamp tone="green">Effective</Stamp>}</td>
                </tr>,
                open && (
                  <tr key={d.id + 'x'} className="expand"><td colSpan={7}>
                    {cs.map(c => <p key={c.id}><span className="mono">§{c.section}</span> {c.text}</p>)}
                    {!cs.length && <p className="muted">{d.note ?? 'No passages.'}</p>}
                  </td></tr>
                ),
              ]
            })}
          </tbody>
        </table>
      </section>
    </>
  )
}
