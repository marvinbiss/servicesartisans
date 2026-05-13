/**
 * Devis form draft storage.
 *
 * The /devis funnel is 3 steps with ~12 fields. Tab close, accidental
 * reload, browser crash or simply "let me check this number" all lose
 * progress and become abandons. The previous implementation auto-saved
 * to a versionless key (`sa:devis-draft`) with no TTL — a draft from
 * three months ago would resurrect itself.
 *
 * This module:
 *   - pins a versioned key so a future schema change doesn't crash the
 *     reader (parse fail → silent drop, not 500)
 *   - stamps `savedAt` so the resume banner can show "Brouillon du …" and
 *     the loader can drop drafts older than 7 days
 *   - exposes typed `loadDevisDraft` / `saveDevisDraft` / `clearDevisDraft`
 *     so the React component stays free of localStorage plumbing
 */
import type { DevisFormData } from '@/hooks/useDevisForm'

export const DEVIS_DRAFT_KEY = 'sa:devis-draft:v1'

/** Drafts older than this are silently dropped on load. */
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface DevisDraft {
  formData: Partial<DevisFormData>
  step: 1 | 2 | 3
  villeQuery?: string
  selectedVillePostal?: string
  savedAt: number
}

function isValidStep(v: unknown): v is 1 | 2 | 3 {
  return v === 1 || v === 2 || v === 3
}

export function loadDevisDraft(): DevisDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(DEVIS_DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (typeof parsed.savedAt !== 'number') return null
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DEVIS_DRAFT_KEY)
      return null
    }
    if (!isValidStep(parsed.step)) return null
    if (!parsed.formData || typeof parsed.formData !== 'object') return null
    return {
      formData: parsed.formData as Partial<DevisFormData>,
      step: parsed.step,
      villeQuery: typeof parsed.villeQuery === 'string' ? parsed.villeQuery : undefined,
      selectedVillePostal:
        typeof parsed.selectedVillePostal === 'string' ? parsed.selectedVillePostal : undefined,
      savedAt: parsed.savedAt,
    }
  } catch {
    return null
  }
}

export function saveDevisDraft(draft: Omit<DevisDraft, 'savedAt'> & { savedAt?: number }): void {
  if (typeof window === 'undefined') return
  try {
    const payload: DevisDraft = {
      ...draft,
      savedAt: draft.savedAt ?? Date.now(),
    }
    localStorage.setItem(DEVIS_DRAFT_KEY, JSON.stringify(payload))
  } catch {
    // localStorage full / unavailable — silently ignore
  }
}

export function clearDevisDraft(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(DEVIS_DRAFT_KEY)
  } catch {
    // ignore
  }
}

/**
 * Format `savedAt` for the resume banner. Returns "aujourd'hui à 19:14"
 * when same calendar day, "hier à 19:14" the day before, otherwise
 * "le 11/05 à 19:14".
 */
export function formatDraftSavedAt(savedAt: number, now: number = Date.now()): string {
  const saved = new Date(savedAt)
  const nowDate = new Date(now)
  const sameDay =
    saved.getFullYear() === nowDate.getFullYear() &&
    saved.getMonth() === nowDate.getMonth() &&
    saved.getDate() === nowDate.getDate()
  const yesterday = new Date(nowDate)
  yesterday.setDate(nowDate.getDate() - 1)
  const isYesterday =
    saved.getFullYear() === yesterday.getFullYear() &&
    saved.getMonth() === yesterday.getMonth() &&
    saved.getDate() === yesterday.getDate()
  const hh = String(saved.getHours()).padStart(2, '0')
  const mm = String(saved.getMinutes()).padStart(2, '0')
  if (sameDay) return `aujourd'hui à ${hh}:${mm}`
  if (isYesterday) return `hier à ${hh}:${mm}`
  const dd = String(saved.getDate()).padStart(2, '0')
  const mo = String(saved.getMonth() + 1).padStart(2, '0')
  return `le ${dd}/${mo} à ${hh}:${mm}`
}
