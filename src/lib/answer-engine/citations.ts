/**
 * Citation extraction.
 *
 * Pure function. Scans the LLM output for URLs and either reconciles them
 * with `request.citedSources` (preserving the title + retrievedAt the
 * caller already authoritatively knows) or derives a placeholder title
 * from the hostname. The point is to give downstream UI a single list of
 * `Citation` objects with usable spans, so we can highlight references
 * without re-parsing the body on the client.
 *
 * Trailing punctuation `.,;:!?)` is stripped because LLMs love to glue
 * URLs against the end of a sentence ("voir https://anah.gouv.fr/foo.")
 * and we don't want that period in the captured URL.
 */

import type { Citation, AnswerRequest } from './types'

const URL_RE = /https?:\/\/[^\s)\]]+/g
const TRAILING_PUNCT_RE = /[.,;:!?)]+$/

export function extractCitations(
  llmOutput: string,
  request: AnswerRequest
): ReadonlyArray<Citation> {
  const found = new Map<string, Citation>()
  const sourcesByUrl = new Map((request.citedSources ?? []).map((s) => [s.url, s] as const))

  let match: RegExpExecArray | null
  URL_RE.lastIndex = 0
  while ((match = URL_RE.exec(llmOutput)) !== null) {
    const rawUrl = match[0]
    const cleanedUrl = rawUrl.replace(TRAILING_PUNCT_RE, '')
    if (cleanedUrl.length === 0) continue
    if (!isAbsoluteHttpUrl(cleanedUrl)) continue

    if (found.has(cleanedUrl)) continue

    const provided = sourcesByUrl.get(cleanedUrl)
    found.set(cleanedUrl, {
      url: cleanedUrl,
      title: provided?.title ?? deriveTitleFromUrl(cleanedUrl),
      retrievedAt: provided?.retrievedAt ?? todayIso(),
      spanStart: match.index,
      spanEnd: match.index + cleanedUrl.length,
    })
  }

  return Array.from(found.values())
}

function isAbsoluteHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function deriveTitleFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname
    return host.replace(/^www\./, '')
  } catch {
    return 'unknown source'
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
