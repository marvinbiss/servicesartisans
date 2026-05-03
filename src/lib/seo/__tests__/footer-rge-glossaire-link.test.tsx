import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import Footer from '@/components/Footer'

/**
 * Sprint T Ahrefs 2026-05-03 — verrou lien sitewide /rge/glossaire dans Footer.
 *
 * Le footer est rendu sur ~459K pages indexables (toutes pages publiques de
 * ServicesArtisans). Un lien permanent vers /rge/glossaire (entité canonique
 * DefinedTermSet Sprint O) crée une concentration massive de PageRank interne
 * vers la cible. Si quelqu'un retire le lien sans réaliser l'impact SEO, ce
 * test détecte la régression au CI.
 */
describe('Footer — Sprint T : lien sitewide /rge/glossaire', () => {
  // Footer rend du markup static (pas de hooks client interactifs).
  // renderToStaticMarkup suffit pour vérifier la présence du lien.
  const html = renderToStaticMarkup(<Footer />)

  it('Footer contient un lien <a href="/rge/glossaire">', () => {
    expect(html).toContain('href="/rge/glossaire"')
  })

  it('Le lien est intitulé "Glossaire RGE" (anchor text SEO)', () => {
    expect(html).toContain('Glossaire RGE')
  })

  it("Le lien glossaire est follow (pas de rel='nofollow')", () => {
    // Recherche fenêtrée autour du lien — évite faux positifs sur d'autres
    // <a> du footer qui pourraient avoir nofollow légitimement.
    const idx = html.indexOf('href="/rge/glossaire"')
    expect(idx).toBeGreaterThan(-1)
    // Anchor tag complet : on slice 200 chars autour pour avoir l'attribut rel.
    const slice = html.slice(Math.max(0, idx - 100), idx + 200)
    expect(slice).not.toMatch(/rel=["'][^"']*nofollow/)
  })
})
