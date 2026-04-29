/**
 * Tests la décision noindex du template `/rge/[service]/[ville]` — la logique
 * inline dans `generateMetadata` (Bug 2 fix) qui doit aligner la metadata
 * avec le render. Reproduit la formule exacte du fichier source pour pouvoir
 * tester sans monter Next.js + Supabase.
 *
 * Source : `src/app/(public)/rge/[service]/[ville]/page.tsx` ligne ~123 :
 *   const isNoindex = countStrict.ok && countStrict.count === 0 && !hasDeptFallback
 *
 * Couverture minimum recommandée par test-architect 2026-04-29.
 */
import { describe, it, expect } from 'vitest'

// Réplique exacte de la formule inline — toute évolution du fichier source
// doit être répercutée ici. Une régression silencieuse de cette logique
// noindex impacte ~50K URLs `/rge/[s]/[v]`.
function resolveRgeNoindex(
  countStrict: { ok: true; count: number } | { ok: false },
  hasDeptFallback: boolean
): boolean {
  return countStrict.ok && countStrict.count === 0 && !hasDeptFallback
}

describe('RGE — generateMetadata noindex decision (Bug 2)', () => {
  it('countStrict.ok=false → INDEX (DB transitoire fail-open)', () => {
    expect(resolveRgeNoindex({ ok: false }, false)).toBe(false)
    expect(resolveRgeNoindex({ ok: false }, true)).toBe(false)
  })

  it('count=0 confirmé + pas de fallback dept → noindex (cas légitime)', () => {
    expect(resolveRgeNoindex({ ok: true, count: 0 }, false)).toBe(true)
  })

  it('count=0 confirmé + fallback dept ≥1 → INDEX (Bug 2 fix)', () => {
    expect(resolveRgeNoindex({ ok: true, count: 0 }, true)).toBe(false)
  })

  it('count > 0 → INDEX (toujours, indépendant du fallback)', () => {
    expect(resolveRgeNoindex({ ok: true, count: 1 }, false)).toBe(false)
    expect(resolveRgeNoindex({ ok: true, count: 50 }, true)).toBe(false)
  })
})
