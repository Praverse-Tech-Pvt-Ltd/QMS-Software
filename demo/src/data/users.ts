export type RoleKey = 'qa_exec' | 'qc' | 'hod' | 'qa_head' | 'ra' | 'ceo' | 'cto'

export interface DemoUser {
  id: string
  name: string
  initials: string
  role: RoleKey
  title: string
  dept: string
  blurb: string
}

// Fictional people at a fictional company. Any resemblance is coincidental.
export const USERS: DemoUser[] = [
  { id: 'priya', name: 'Priya Nair', initials: 'PN', role: 'qa_exec', title: 'QA Executive', dept: 'Quality Assurance',
    blurb: 'Logs events, runs assessments, uploads SOPs.' },
  { id: 'rohan', name: 'Rohan Mehta', initials: 'RM', role: 'qc', title: 'QC Analyst', dept: 'Quality Control',
    blurb: 'Raises lab events, asks procedure questions at the bench.' },
  { id: 'vikram', name: 'Vikram Desai', initials: 'VD', role: 'hod', title: 'HOD — Production', dept: 'Production',
    blurb: 'First approver. Reviews events raised by the shop floor.' },
  { id: 'anita', name: 'Anita Rao', initials: 'AR', role: 'qa_head', title: 'Head of Quality', dept: 'Quality Assurance',
    blurb: 'Final sign-off. Owns inspection readiness.' },
  { id: 'sneha', name: 'Sneha Iyer', initials: 'SI', role: 'ra', title: 'Regulatory Affairs Manager', dept: 'Regulatory Affairs',
    blurb: 'Filings, variations, queries from agencies.' },
  { id: 'rajesh', name: 'Rajesh Kapoor', initials: 'RK', role: 'ceo', title: 'CEO / Plant Head', dept: 'Management',
    blurb: 'Sees risk, readiness and where to put resources.' },
  { id: 'arjun', name: 'Arjun Shah', initials: 'AS', role: 'cto', title: 'CTO / IT Head', dept: 'IT & Systems',
    blurb: 'Governs the AI: sources, logs, access, validation.' },
]

export const COMPANY = { name: 'Demo Pharma Ltd.', site: 'Vadodara — OSD & API site' }

export type ViewKey = 'home' | 'ask' | 'knowledge' | 'readiness' | 'records' | 'studio' | 'filings' | 'governance'

export const NAV: { key: ViewKey; label: string; hint: string; roles: RoleKey[] | 'all' }[] = [
  { key: 'home', label: 'Briefing', hint: 'Your day, read by the AI', roles: 'all' },
  { key: 'ask', label: 'Ask the company AI', hint: 'Answers cited to your SOPs', roles: 'all' },
  { key: 'knowledge', label: 'Knowledge base', hint: 'Add files, see what is indexed', roles: 'all' },
  { key: 'readiness', label: 'Inspection readiness', hint: 'What an inspector would find today', roles: ['qa_exec', 'qc', 'hod', 'qa_head', 'ra', 'ceo'] },
  { key: 'records', label: 'Quality events', hint: 'Raise, review, approve', roles: ['qa_exec', 'qc', 'hod', 'qa_head'] },
  { key: 'studio', label: 'Document studio', hint: 'BMR, triggers, 483 responses', roles: ['qa_exec', 'hod', 'qa_head', 'ra'] },
  { key: 'filings', label: 'Filings', hint: 'DMF, CEP, dossier status', roles: ['ra', 'qa_head', 'ceo'] },
  { key: 'governance', label: 'AI governance', hint: 'Logs, audit trail, access', roles: ['cto', 'qa_head'] },
]

export const CAN_UPLOAD: RoleKey[] = ['qa_exec', 'qa_head', 'cto']
