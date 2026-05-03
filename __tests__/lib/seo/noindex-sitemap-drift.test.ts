import { execSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

// Regression test — Action #6 finitions Ahrefs 2026-05-03.
//
// Ahrefs Site Audit avait flaggé 386 pages avec drift sitemap vs noindex
// (signal contradictoire Google : URL listée dans sitemap = "indexe-moi"
// mais page renvoie noindex = "n'indexe pas"). Cause : routes dynamiques
// /services/[s]/[location] où la page applique noindex sur 0 provider
// mais le sitemap continuait à exposer l'URL.
//
// Fix livré dans src/app/sitemap.ts (Sprint A #6 PhB) : alignement
// qualifiedCombos.has(...) + deptServiceFallbackCombos.has(...) côté
// sitemap.ts, identique aux seuils services/[s]/[location]/page.tsx.
//
// Ce test verrouille le résultat actuel (0 drift sur URLs littérales) et
// échoue si quelqu'un ajoute une URL noindex dans le sitemap statique.
//
// Limites : ne couvre pas les boucles dynamiques (RGE/CEE/villes). Celles-ci
// sont auditées par les filtres isServiceVilleIndexable, la column noindex
// Postgres et les guards qualifiedCombos. Voir mémoire
// servicesartisans-noindex-rge-migration-2026-04-19.md.

type AuditReport = {
  sitemap_literal_urls: number
  redirect_sources: number
  noindex_in_sitemap: number
  redirected_in_sitemap: number
  details: {
    noindexInSitemap: { route: string; file: string }[]
    redirectedInSitemap: { url: string; redirectedFrom: string }[]
  }
}

function runAudit(): AuditReport {
  const output = execSync('node scripts/audit-noindex-sitemap.mjs --json', {
    encoding: 'utf8',
    cwd: process.cwd(),
    timeout: 60_000,
  })
  return JSON.parse(output) as AuditReport
}

describe('Sitemap ↔ noindex drift — Action #6 finitions Ahrefs 2026-05-03', () => {
  it('audit script renvoie 0 page noindex présente dans sitemap statique', () => {
    const report = runAudit()
    expect(
      report.noindex_in_sitemap,
      `Drift détecté ! ${report.noindex_in_sitemap} pages noindex sont listées dans sitemap.ts :\n${report.details.noindexInSitemap
        .map((n) => `  - ${n.route} (${n.file})`)
        .join(
          '\n'
        )}\n\nFix : retirer ces routes du sitemap OU lever le robots:noindex sur ces pages.`
    ).toBe(0)
  })

  it('audit script renvoie 0 source de redirect 301 présente dans sitemap statique', () => {
    const report = runAudit()
    expect(
      report.redirected_in_sitemap,
      `Drift détecté ! ${report.redirected_in_sitemap} URLs sources de redirect 301 sont dans sitemap.ts :\n${report.details.redirectedInSitemap
        .map((r) => `  - ${r.url}`)
        .join('\n')}\n\nFix : retirer du sitemap (les 301 source ne doivent jamais y apparaître).`
    ).toBe(0)
  })

  it('audit script trouve > 30 URLs littérales dans sitemap (sanity check)', () => {
    const report = runAudit()
    expect(
      report.sitemap_literal_urls,
      'Le sitemap.ts semble vide ou le parser cassé (< 30 URLs littérales).'
    ).toBeGreaterThan(30)
  })
})
