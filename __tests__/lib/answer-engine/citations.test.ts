/**
 * Tests — src/lib/answer-engine/citations.ts
 *
 * Pure function tests. Edge cases mirror the patterns that show up in
 * real LLM output (trailing punctuation, duplicate URLs, unbalanced
 * parens, mixed http/https) so callers don't have to re-derive these
 * regexes downstream.
 */

import { describe, it, expect } from 'vitest'
import { extractCitations } from '@/lib/answer-engine/citations'
import type { AnswerRequest } from '@/lib/answer-engine/types'

const baseReq: AnswerRequest = { query: 'q' }

describe('extractCitations — no URLs', () => {
  it('returns empty array on output without URLs', () => {
    const citations = extractCitations('Pas de lien ici.', baseReq)
    expect(citations).toEqual([])
  })

  it('returns empty array on empty output', () => {
    expect(extractCitations('', baseReq)).toEqual([])
  })
})

describe('extractCitations — single URL', () => {
  it('extracts one citation from a single https URL', () => {
    const out = 'Voir https://anah.gouv.fr/foo pour le barème.'
    const citations = extractCitations(out, baseReq)
    expect(citations).toHaveLength(1)
    expect(citations[0].url).toBe('https://anah.gouv.fr/foo')
  })

  it('extracts one citation from a single http URL', () => {
    const out = 'Source: http://example.org/page'
    const citations = extractCitations(out, baseReq)
    expect(citations).toHaveLength(1)
    expect(citations[0].url).toBe('http://example.org/page')
  })
})

describe('extractCitations — multiple URLs + dedup', () => {
  it('returns unique citations only (dedup by URL)', () => {
    const out =
      'Voir https://anah.gouv.fr/foo et https://france-renov.gouv.fr/bar puis encore https://anah.gouv.fr/foo.'
    const citations = extractCitations(out, baseReq)
    expect(citations).toHaveLength(2)
    const urls = citations.map((c) => c.url).sort()
    expect(urls).toEqual(['https://anah.gouv.fr/foo', 'https://france-renov.gouv.fr/bar'])
  })
})

describe('extractCitations — trailing punctuation', () => {
  it('strips a trailing period', () => {
    const citations = extractCitations('Détails sur https://anah.gouv.fr/foo.', baseReq)
    expect(citations).toHaveLength(1)
    expect(citations[0].url).toBe('https://anah.gouv.fr/foo')
  })

  it('strips trailing punctuation mix `.,;:!?)`', () => {
    const out = 'Voir https://anah.gouv.fr/a, ou https://anah.gouv.fr/b!'
    const citations = extractCitations(out, baseReq)
    const urls = citations.map((c) => c.url).sort()
    expect(urls).toEqual(['https://anah.gouv.fr/a', 'https://anah.gouv.fr/b'])
  })
})

describe('extractCitations — citedSources reconciliation', () => {
  it('preserves caller-provided title + retrievedAt when URL matches', () => {
    const req: AnswerRequest = {
      query: 'q',
      citedSources: [
        {
          url: 'https://anah.gouv.fr/foo',
          title: 'ANAH MaPrimeRénov - barème PAC',
          retrievedAt: '2026-04-15',
        },
      ],
    }
    const citations = extractCitations('Source officielle https://anah.gouv.fr/foo voir page.', req)
    expect(citations).toHaveLength(1)
    expect(citations[0].title).toBe('ANAH MaPrimeRénov - barème PAC')
    expect(citations[0].retrievedAt).toBe('2026-04-15')
  })

  it('derives a hostname title when URL is not in citedSources', () => {
    const citations = extractCitations('Source: https://www.france-renov.gouv.fr/aides', baseReq)
    expect(citations).toHaveLength(1)
    expect(citations[0].title).toBe('france-renov.gouv.fr')
  })
})

describe('extractCitations — spans', () => {
  it('produces correct spanStart / spanEnd', () => {
    const out = 'Voir https://anah.gouv.fr/foo pour détails.'
    const citations = extractCitations(out, baseReq)
    expect(citations).toHaveLength(1)
    const c = citations[0]
    expect(c.spanStart).toBe(out.indexOf('https://'))
    expect(c.spanEnd).toBe(c.spanStart! + 'https://anah.gouv.fr/foo'.length)
    expect(out.slice(c.spanStart!, c.spanEnd!)).toBe(c.url)
  })
})

describe('extractCitations — malformed', () => {
  it('does not panic on URL-looking strings that are not absolute http(s)', () => {
    // `ftp://` is filtered out by the regex (only http/https matched).
    const citations = extractCitations('Voir ftp://example.org/foo', baseReq)
    expect(citations).toEqual([])
  })

  it('skips garbage that does not parse as a URL', () => {
    // The regex requires `https?://` so a bare "https" is not captured at all.
    const citations = extractCitations('le mot https sans :// ici', baseReq)
    expect(citations).toEqual([])
  })
})
