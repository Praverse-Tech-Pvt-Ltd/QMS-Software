# iPharma AI — company AI demo (frontend only)

A click-through demo of the product idea: a company AI that reads the site's own SOPs, answers with citations,
guides people through quality events, and shows every day what an inspector would find.

**Everything is invented.** Fictional company, fictional people, made-up SOP text. There is no backend and no real
model: answers come from keyword search over the indexed passages plus templates (`src/lib/ai.ts`). State is kept in
the browser's localStorage, so switching users shows the same records moving. Nothing leaves the browser.

## Run

```bash
cd demo
npm install
npm run dev
```

Open http://localhost:5180.

## Demo users

| User | Role | What to show |
|---|---|---|
| Priya Nair | QA Executive | Upload an SOP, raise an event, QA assessment |
| Rohan Mehta | QC Analyst | Ask "I got an OOS result. Can I retest?", raise a lab event |
| Vikram Desai | HOD — Production | Approve with an AI-drafted remark and e-signature |
| Anita Rao | Head of Quality | Final approval, readiness, governance |
| Sneha Iyer | Regulatory Affairs | Filing triggers, filings, 483 response skeleton |
| Rajesh Kapoor | CEO / Plant Head | Briefing, readiness score, "Are we ready for an inspection?" |
| Arjun Shah | CTO / IT Head | AI output log, audit trail, roles and access |

## A five-minute walkthrough

1. **Priya → Knowledge base → "Try with a sample SOP".** Watch it index, then ask "How often is backup restore tested?"
   The answer cites the file just added.
2. **Rohan → Ask.** Ask the OOS question (cited answer + inspector precedent + the related open gap at the site).
   Then ask something not covered, e.g. gowning — the AI declines and logs a coverage gap.
3. **Rohan → Quality events → Raise an event.** Answer seven questions; the AI drafts the record and classifies it.
4. **Switch to Vikram** (bottom left). The event is in his queue. Start from an AI draft, edit, approve and e-sign.
5. **Priya → Anita** to finish the chain; actions are created on final approval, then closed with evidence.
6. **Anita or Rajesh → Inspection readiness.** Open a gap: likely inspector question, steps, precedent. Resolve it and
   the score rises.
7. **Sneha → Document studio.** Filing triggers and the 483 response skeleton. **Priya/Vikram** see the batch record
   generator.
8. **Arjun → AI governance.** Every AI output and human action from the steps above is logged.

"Reset demo data" is in the user switcher.

## What is real and what is not

- Real: role-based navigation, the multi-user workflow, e-sign step, audit and AI logs, readiness scoring, text-file
  ingestion (`.txt`/`.md` are actually split and searched), the batch-record and trigger logic (ported from
  `backend/docstudio`).
- Stand-in: the "AI". PDF/Word parsing, embeddings, the language model and the real 483 corpus are not connected.
  No inspection statistics are shown for that reason.
