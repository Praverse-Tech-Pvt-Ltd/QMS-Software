import { useSyncExternalStore } from 'react'
import { SEED_CHUNKS, SEED_DOCS, type Chunk, type Doc } from '../data/knowledge'
import { SEED_EVENTS, SEED_GAPS, type Gap, type QEvent } from '../data/seed'
import type { ViewKey } from '../data/users'

export interface AiLog {
  id: string; at: string; userId: string; feature: string; promptVersion: string
  input: string; sources: string[]; outcome: 'shown' | 'accepted' | 'edited' | 'no source found'
}
export interface AuditEntry { id: string; at: string; userId: string; action: string; record: string; detail: string }
export interface ChatMsg {
  id: string; from: 'user' | 'ai'; text: string; at: string
  paragraphs?: string[]; chunkIds?: string[]; precedentIds?: string[]; gapIds?: string[]; notFound?: boolean
}

export interface State {
  userId: string | null
  view: ViewKey
  askDraft: string
  docs: Doc[]
  chunks: Chunk[]
  events: QEvent[]
  gaps: Gap[]
  aiLog: AiLog[]
  audit: AuditEntry[]
  chats: Record<string, ChatMsg[]>
}

const KEY = 'ipharma-demo-v1'

const fresh = (): State => ({
  userId: null, view: 'home', askDraft: '',
  docs: SEED_DOCS, chunks: SEED_CHUNKS, events: SEED_EVENTS, gaps: SEED_GAPS,
  aiLog: [], audit: [], chats: {},
})

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...fresh(), ...JSON.parse(raw) }
  } catch { /* storage unavailable: run in memory */ }
  return fresh()
}

let state = load()
const listeners = new Set<() => void>()

export function getState() { return state }

export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...p }
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  listeners.forEach(l => l())
}

export function resetDemo() {
  state = fresh()
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  listeners.forEach(l => l())
}

export function useStore(): State {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb) }, getState)
}

export const uid = () => Math.random().toString(36).slice(2, 9)
export const now = () => new Date().toISOString()

export function logAudit(action: string, record: string, detail: string) {
  const userId = state.userId ?? 'system'
  setState(s => ({ audit: [{ id: uid(), at: now(), userId, action, record, detail }, ...s.audit] }))
}

export function logAi(feature: string, input: string, sources: string[], outcome: AiLog['outcome'] = 'shown') {
  const userId = state.userId ?? 'system'
  setState(s => ({
    aiLog: [{ id: uid(), at: now(), userId, feature, promptVersion: 'demo-rules-0.1', input, sources, outcome }, ...s.aiLog],
  }))
}

export const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
