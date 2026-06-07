/**
 * sanitizeRichHtml — remplace isomorphic-dompurify (jsdom, crash cold-start)
 * pour le HTML riche CMS + emails. Garde tags/styles présentationnels,
 * tue script/handlers/schemes dangereux.
 */
import { describe, it, expect } from 'vitest'
import { sanitizeRichHtml } from '@/lib/sanitize-html-content'

describe('sanitizeRichHtml', () => {
  it('garde les tags présentationnels', () => {
    const html = '<h1>Titre</h1><p><strong>gras</strong> <em>italique</em></p><ul><li>x</li></ul>'
    expect(sanitizeRichHtml(html)).toBe(html)
  })

  it('garde les styles inline (emails)', () => {
    const out = sanitizeRichHtml('<p style="color:red;font-size:14px">Hello</p>')
    expect(out).toContain('style="color:red;font-size:14px"')
  })

  it('garde les images et liens', () => {
    const out = sanitizeRichHtml(
      '<a href="https://x.fr">l</a><img src="https://x.fr/a.png" alt="a">'
    )
    expect(out).toContain('href="https://x.fr"')
    expect(out).toContain('src="https://x.fr/a.png"')
    expect(out).toContain('rel="noopener noreferrer"')
  })

  it('strip <script>', () => {
    const out = sanitizeRichHtml('<p>ok</p><script>alert(1)</script>')
    expect(out).not.toContain('<script')
    expect(out).toContain('<p>ok</p>')
  })

  it('strip les handlers on* et javascript:', () => {
    const out = sanitizeRichHtml(
      '<img src=x onerror="alert(1)"><a href="javascript:alert(1)">l</a>'
    )
    expect(out).not.toContain('onerror')
    expect(out).not.toContain('javascript:')
  })

  it('strip iframe/object/form', () => {
    const out = sanitizeRichHtml('<iframe src="evil"></iframe><form><input></form><p>ok</p>')
    expect(out).not.toContain('<iframe')
    expect(out).not.toContain('<form')
    expect(out).not.toContain('<input')
    expect(out).toContain('<p>ok</p>')
  })

  it('gère vide / non-string', () => {
    expect(sanitizeRichHtml('')).toBe('')
    expect(sanitizeRichHtml(null as unknown as string)).toBe('')
  })
})
