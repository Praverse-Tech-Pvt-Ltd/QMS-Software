import { setState } from '../lib/store'
import { PageHead, Stamp } from '../ui'
import type { ViewKey } from '../data/users'

// Source: vendor websites read on 11 Nov 2026 (caliberuniversal.com home/nav;
// spartasystems.com home and TrackWise AI page). "Not seen" means not seen on
// those pages, not proof of absence. Re-verify before external use.
type Cell = 'yes' | 'partial' | 'unseen'
const ROWS: { cap: string; note: string; caliber: Cell; trackwise: Cell; us: Cell; view?: ViewKey }[] = [
  { cap: 'Core QMS: deviation, CAPA, change, complaints, audits', note: 'Table stakes. Both incumbents are mature here.', caliber: 'yes', trackwise: 'yes', us: 'yes', view: 'records' },
  { cap: 'LIMS, batch records, documents, training, APQR', note: 'Caliber sells a wide suite; TrackWise adds manufacturing and review modules.', caliber: 'yes', trackwise: 'partial', us: 'partial' },
  { cap: 'AI that classifies, summarises and finds trends', note: 'TrackWise AI lists auto-categorisation, summaries, insights and a root cause advisor. Caliber lists CalGenie, an AI information platform.', caliber: 'partial', trackwise: 'yes', us: 'partial' },
  { cap: 'Ask your own SOPs, answer cited to the section', note: 'Every user gets the procedure in plain words, with the source shown. No source, no answer.', caliber: 'unseen', trackwise: 'unseen', us: 'yes', view: 'ask' },
  { cap: 'Inspector precedent inside the workflow', note: 'What an inspector cites and looks for, shown at the moment of the decision.', caliber: 'unseen', trackwise: 'unseen', us: 'yes', view: 'records' },
  { cap: 'Daily inspection-readiness score with next steps', note: 'Open gaps weighted by severity, the likely inspector question, and what to do in order.', caliber: 'unseen', trackwise: 'unseen', us: 'yes', view: 'readiness' },
  { cap: 'Guided event intake that drafts the record', note: 'Seven plain questions become a GMP-language record with a suggested classification.', caliber: 'unseen', trackwise: 'partial', us: 'yes', view: 'records' },
  { cap: 'First drafts: batch record, 483 response', note: 'From expert-authored templates. Limits and facts are never invented.', caliber: 'unseen', trackwise: 'unseen', us: 'yes', view: 'studio' },
  { cap: 'Filing-trigger check on every change', note: 'Flags a possible variation or supplement on day one for Regulatory Affairs to confirm.', caliber: 'unseen', trackwise: 'unseen', us: 'yes', view: 'studio' },
  { cap: 'Built with a practising inspection expert', note: 'Templates, checklists and rules authored and reviewed by a 25-year quality head.', caliber: 'unseen', trackwise: 'unseen', us: 'yes' },
]

const LABEL: Record<Cell, string> = { yes: 'Yes', partial: 'Partly', unseen: 'Not seen' }

function Mark({ c }: { c: Cell }) {
  return <span className={`mark mark-${c}`}><i aria-hidden="true" />{LABEL[c]}</span>
}

export default function Compare() {
  return (
    <>
      <PageHead kicker="Where we match the incumbents, and where we go further" title="How we compare" />
      <section className="record">
        <div className="record-margin">Position</div>
        <div className="briefing">
          <p>CaliberLIMS and TrackWise are systems of record. They store what happened, and their AI helps sort and summarise it.</p>
          <p>We are the layer that helps people <em>do the right thing before it becomes a record</em>: the procedure in plain words, the inspector’s view at the decision, and a daily list of what to fix first.</p>
        </div>
      </section>

      <section className="panel flush">
        <table className="table compare">
          <thead><tr><th>Capability</th><th>Caliber</th><th>TrackWise</th><th className="us">iPharma AI</th><th /></tr></thead>
          <tbody>
            {ROWS.map(r => (
              <tr key={r.cap}>
                <td><b>{r.cap}</b><small>{r.note}</small></td>
                <td><Mark c={r.caliber} /></td>
                <td><Mark c={r.trackwise} /></td>
                <td className="us"><Mark c={r.us} /></td>
                <td>{r.view && <button className="link" onClick={() => setState({ view: r.view! })}>See it →</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid-2">
        <section className="panel">
          <h2>How we win</h2>
          <ol className="winlist">
            <li><b>Sit on top first, replace later.</b> Start as the AI layer over the customer’s existing Caliber or TrackWise; no rip-and-replace to get value.</li>
            <li><b>Prevention over paperwork.</b> Measure ourselves by fewer observations, not more records.</li>
            <li><b>Cited or silent.</b> Trust comes from showing the source every time and declining when there is none.</li>
            <li><b>Expert in the loop.</b> Content written and reviewed by someone who faces inspectors, not only by engineers.</li>
            <li><b>Data stays on site.</b> Option to run the model locally, which large cloud suites do not lead with.</li>
          </ol>
        </section>
        <section className="panel">
          <h2>Where they are ahead today</h2>
          <ul className="winlist">
            <li><b>Breadth and maturity.</b> Years of validated deployments and wide module coverage.</li>
            <li><b>TrackWise AI is real.</b> Categorisation, summaries, trend insights and root-cause hints are already shipping.</li>
            <li><b>Installed base.</b> Their customers’ data already lives there, which is why we integrate rather than fight it.</li>
          </ul>
          <p className="notice">Source: the vendors’ public websites, read 11 Nov 2026. “Not seen” means not found on the pages read, not proof it does not exist. Re-check before using this outside the company. <Stamp tone="amber">Internal</Stamp></p>
        </section>
      </div>
    </>
  )
}
