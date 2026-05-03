import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { autoLinkRgeTerms, __resetGlossaryAutolinkCacheForTests } from '../glossary-autolink'

function render(node: React.ReactNode): string {
  return renderToStaticMarkup(<>{node}</>)
}

describe('autoLinkRgeTerms — Sprint L Ahrefs 2026-05-03', () => {
  it('returns text unchanged when no RGE term mention', () => {
    const result = autoLinkRgeTerms('Le chauffage est en panne depuis 3 jours.')
    expect(result).toBe('Le chauffage est en panne depuis 3 jours.')
  })

  it('returns empty string when input empty', () => {
    expect(autoLinkRgeTerms('')).toBe('')
  })

  it('wraps Qualibat 7141 mention with anchor to #term-qualibat-7141', () => {
    const html = render(autoLinkRgeTerms('Demandez un artisan Qualibat 7141 pour votre ITE.'))
    expect(html).toContain('href="#term-qualibat-7141"')
    expect(html).toContain('Qualibat 7141')
  })

  it('wraps QualiPAC mention with anchor to #term-qualipac', () => {
    const html = render(autoLinkRgeTerms('Un installateur QualiPAC est requis pour la PAC.'))
    expect(html).toContain('href="#term-qualipac"')
  })

  it('wraps Qualifelec IRVE P1 mention with anchor to #term-qualifelec-irve-p1', () => {
    const html = render(autoLinkRgeTerms('La pose de wallbox exige Qualifelec IRVE P1 actif.'))
    expect(html).toContain('href="#term-qualifelec-irve-p1"')
  })

  it('only links the FIRST occurrence per slug (anti-spam)', () => {
    const html = render(
      autoLinkRgeTerms(
        "Qualibat 7141 est obligatoire. Sans Qualibat 7141, pas d'aides. Le Qualibat 7141 doit être actif."
      )
    )
    const matches = html.match(/href="#term-qualibat-7141"/g) ?? []
    expect(matches.length).toBe(1)
  })

  it('matches case-insensitive (qualipac, QUALIPAC, QualiPAC tous OK)', () => {
    const html = render(autoLinkRgeTerms('quaLiPaC est cité ici.'))
    expect(html).toContain('href="#term-qualipac"')
  })

  it('respects word boundaries (ne matche pas dans un mot composé)', () => {
    const html = render(autoLinkRgeTerms('Qualifelec-Master-Plan ne doit pas matcher Qualifelec.'))
    // Le terme "Qualifelec IRVE P1" exact n'est pas dans la string, donc pas d'ancre.
    expect(html).not.toContain('href="#term-qualifelec-irve-p1"')
  })

  it('links plusieurs slugs distincts dans un même paragraphe', () => {
    const html = render(
      autoLinkRgeTerms("Pour la PAC il faut QualiPAC, pour l'ITE il faut Qualibat 7141.")
    )
    expect(html).toContain('href="#term-qualipac"')
    expect(html).toContain('href="#term-qualibat-7141"')
  })

  it('preserves text around the matched terms', () => {
    const html = render(autoLinkRgeTerms('Préfixe QualiPAC suffixe.'))
    expect(html).toContain('Préfixe ')
    expect(html).toContain(' suffixe.')
  })

  it('renders the anchor with title attribute (UX hover tooltip)', () => {
    const html = render(autoLinkRgeTerms('Voir QualiPAC.'))
    expect(html).toMatch(/title="QualiPAC"/)
  })

  // Sprint R Ahrefs 2026-05-03 — verrou cross-page hostPath.
  it('Sprint R — option hostPath produit href absolu /rge/glossaire#term-…', () => {
    const html = render(autoLinkRgeTerms('Voir QualiPAC.', { hostPath: '/rge/glossaire' }))
    expect(html).toContain('href="/rge/glossaire#term-qualipac"')
    expect(html).not.toContain('href="#term-qualipac"')
  })

  it("Sprint R — sans hostPath, garde l'ancre relative same-page (backward compat)", () => {
    const html = render(autoLinkRgeTerms('Voir QualiPAC.'))
    expect(html).toContain('href="#term-qualipac"')
    expect(html).not.toContain('/rge/glossaire')
  })

  it('Sprint R — hostPath === "" équivalent à same-page (no-op)', () => {
    const html = render(autoLinkRgeTerms('Voir QualiPAC.', { hostPath: '' }))
    expect(html).toContain('href="#term-qualipac"')
  })

  // Sprint AE Ahrefs 2026-05-03 — verrou reset cache testable.
  it('Sprint AE — __resetGlossaryAutolinkCacheForTests permet reset propre', () => {
    // Premier appel populate le cache
    const html1 = render(autoLinkRgeTerms('QualiPAC.'))
    expect(html1).toContain('href="#term-qualipac"')
    // Reset cache
    __resetGlossaryAutolinkCacheForTests()
    // Deuxième appel re-build le cache → résultat identique (déterministe)
    const html2 = render(autoLinkRgeTerms('QualiPAC.'))
    expect(html2).toContain('href="#term-qualipac"')
    expect(html2).toBe(html1)
  })
})
