// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import RgeGlossaryBlock from '@/components/seo/RgeGlossaryBlock'
import { getAllRgeGlossaryEntries } from '../rge-qualifications-glossary'

function render(node: React.ReactNode): string {
  return renderToStaticMarkup(<>{node}</>)
}

/**
 * Sprint S Ahrefs 2026-05-03 — verrou lien retour "Voir glossaire complet".
 *
 * Garantit que :
 *   - Par défaut (showCanonicalLink=true), le bloc rend un lien vers
 *     /rge/glossaire (entité canonique Sprint O).
 *   - Sur la page /rge/glossaire elle-même (showCanonicalLink=false), le
 *     lien est omis (pas de self-link).
 *   - Le bloc reste accessible (id, aria-labelledby, dl/dt/dd, dfn) — drift
 *     anti-régression pour Sprints J/K/M/P.
 */
describe('RgeGlossaryBlock — Sprint S', () => {
  const entries = getAllRgeGlossaryEntries()

  it('rend un lien canonique vers /rge/glossaire par défaut', () => {
    const html = render(<RgeGlossaryBlock entries={entries} />)
    expect(html).toContain('href="/rge/glossaire"')
    expect(html).toContain('Voir le glossaire RGE complet')
  })

  it('omet le lien canonique quand showCanonicalLink=false', () => {
    const html = render(<RgeGlossaryBlock entries={entries} showCanonicalLink={false} />)
    expect(html).not.toContain('href="/rge/glossaire"')
    expect(html).not.toContain('Voir le glossaire RGE complet')
  })

  it('renvoie null si entries vide (no-op safe)', () => {
    const html = render(<RgeGlossaryBlock entries={[]} />)
    expect(html).toBe('')
  })

  it('garde la structure accessible : id, aria-labelledby, dl/dt/dd/dfn', () => {
    const html = render(<RgeGlossaryBlock entries={entries.slice(0, 3)} />)
    expect(html).toContain('id="glossaire-rge"')
    expect(html).toContain('aria-labelledby="glossaire-rge-title"')
    expect(html).toContain('<dl')
    expect(html).toContain('<dt')
    expect(html).toContain('<dd')
    expect(html).toContain('<dfn')
  })

  it('chaque entry produit une ancre id="term-<slug>" (cohérence Schema/DOM)', () => {
    const sample = entries.slice(0, 3)
    const html = render(<RgeGlossaryBlock entries={sample} />)
    for (const e of sample) {
      expect(html).toContain(`id="term-${e.slug}"`)
    }
  })
})
