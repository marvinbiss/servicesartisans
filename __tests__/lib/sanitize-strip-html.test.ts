/**
 * stripHtmlTags — remplace DOMPurify({ALLOWED_TAGS:[]}) sans jsdom.
 * Régression 2026-06-07 : l'import dynamique d'isomorphic-dompurify crashait
 * au cold start serverless → 500 sur chaque save « Activité & présentation ».
 */
import { describe, it, expect } from 'vitest'
import { sanitizeUserInput, stripHtmlTags } from '@/lib/sanitize'

describe('stripHtmlTags', () => {
  it('retire toutes les balises, garde le texte', () => {
    expect(stripHtmlTags('<p>Bonjour <b>Marvin</b></p>')).toBe('Bonjour Marvin')
  })

  it('retire les balises imbriquées/malformées', () => {
    expect(stripHtmlTags('<a<b>>texte')).toBe('texte')
  })

  it('neutralise un payload XSS via le pipeline complet (description)', () => {
    const evil = '<img src=x onerror=alert(1)><script>alert(2)</script>Salut'
    const out = stripHtmlTags(sanitizeUserInput(evil))
    expect(out).not.toContain('<')
    expect(out).not.toContain('script')
    expect(out).not.toContain('onerror')
    expect(out).toContain('Salut')
  })

  it('gère vide / non-string', () => {
    expect(stripHtmlTags('')).toBe('')
    expect(stripHtmlTags(null as unknown as string)).toBe('')
    expect(stripHtmlTags(undefined as unknown as string)).toBe('')
  })

  it('laisse intact un texte simple', () => {
    expect(stripHtmlTags('22 ans de métier, devis gratuit.')).toBe(
      '22 ans de métier, devis gratuit.'
    )
  })
})
