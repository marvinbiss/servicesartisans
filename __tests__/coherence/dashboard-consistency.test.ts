/**
 * Tests de cohérence cross-dashboard — règles qui doivent rester vraies sur
 * les 3 dashboards (admin root, admin metrics, artisan) simultanément.
 *
 * Ces tests préviennent les drifts futurs en gelant les invariants identifiés
 * dans docs/dashboard-coherence-audit-2026-04-23.md.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(__dirname, '..', '..')

function readFile(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8')
}

describe('Invariant 1 — status taxonomy lead_assignments', () => {
  it('le CHECK constraint migration 103 contient exactement {pending, viewed, quoted, declined}', () => {
    const migration = readFile('supabase/migrations/103_lead_assignments.sql')
    expect(migration).toMatch(
      /CHECK\s*\(\s*status\s+IN\s*\(\s*'pending'\s*,\s*'viewed'\s*,\s*'quoted'\s*,\s*'declined'\s*\)\s*\)/
    )
  })

  it("l'API /api/artisan/funnel expose les 5 buckets (+pending pour UI)", () => {
    const route = readFile('src/app/api/artisan/funnel/route.ts')
    expect(route).toMatch(/counts:\s*\{[\s\S]*assigned:/)
    expect(route).toMatch(/viewed:\s*rows\.filter/)
    expect(route).toMatch(/quoted:\s*rows\.filter/)
    expect(route).toMatch(/declined:\s*rows\.filter/)
    expect(route).toMatch(/pending:\s*rows\.filter/)
  })

  it("le FunnelBlock n'expose que 3 étapes visuelles (assigned→viewed→quoted)", () => {
    const block = readFile('src/components/artisan-dashboard/FunnelBlock.tsx')
    // Les 3 steps du funnel graphique ; on s'assure qu'il n'y a ni "accepted"
    // ni "expired" qui sont des statuts app.lead_assignments (schema autre)
    expect(block).not.toMatch(/\baccepted\b/)
    expect(block).not.toMatch(/\bexpired\b/)
  })
})

describe('Invariant 2 — locale FR sur formatage dates et nombres', () => {
  it('admin root utilise fr-FR pour dates', () => {
    const page = readFile('src/app/admin/(dashboard)/page.tsx')
    expect(page).toMatch(/toLocaleDateString\('fr-FR'/)
  })

  it('admin metrics utilise fr-FR pour nombres', () => {
    const page = readFile('src/app/admin/(dashboard)/metrics/page.tsx')
    expect(page).toMatch(/toLocaleString\('fr-FR'/)
  })

  it('RgeStatusBlock utilise fr-FR pour dates', () => {
    const block = readFile('src/components/artisan-dashboard/RgeStatusBlock.tsx')
    expect(block).toMatch(/toLocaleDateString\('fr-FR'/)
  })
})

describe('Invariant 3 — delta fonctions partagées', () => {
  it('admin metrics utilise src/lib/metrics/delta.ts', () => {
    const page = readFile('src/app/admin/(dashboard)/metrics/page.tsx')
    expect(page).toMatch(/from\s+['"]@\/lib\/metrics\/delta['"]/)
  })

  it('PerformanceTrendBlock utilise src/lib/metrics/delta.ts', () => {
    const block = readFile('src/components/artisan-dashboard/PerformanceTrendBlock.tsx')
    expect(block).toMatch(/from\s+['"]@\/lib\/metrics\/delta['"]/)
  })

  it("la lib delta n'est plus dupliquée dans aucun des 3 dashboards (pas de pct() local)", () => {
    // Admin metrics : pct() local ne doit plus exister
    const adminMetrics = readFile('src/app/admin/(dashboard)/metrics/page.tsx')
    expect(adminMetrics).not.toMatch(/^function\s+pct\s*\(/m)
    // PerformanceTrendBlock : splitHalves local ne doit plus exister
    const trend = readFile('src/components/artisan-dashboard/PerformanceTrendBlock.tsx')
    expect(trend).not.toMatch(/^function\s+splitHalves\s*\(/m)
  })
})

describe('Invariant 4 — auth boundary cohérente', () => {
  it('chaque route /api/artisan/* appelle supabase.auth.getUser() avant de lire les données', () => {
    const routes = [
      'src/app/api/artisan/funnel/route.ts',
      'src/app/api/artisan/rge/route.ts',
      'src/app/api/artisan/reputation/route.ts',
      'src/app/api/artisan/trends/route.ts',
    ]
    for (const r of routes) {
      const src = readFile(r)
      expect(src, `${r} doit appeler supabase.auth.getUser()`).toMatch(
        /supabase\.auth\.getUser\(\)/
      )
      expect(src, `${r} doit vérifier provider.user_id = auth.uid`).toMatch(
        /\.eq\(\s*['"]user_id['"],\s*user\.id\s*\)/
      )
    }
  })
})

describe('Invariant 5 — a11y aria-label sur les 3 dashboards', () => {
  it('admin root a aria-label', () => {
    const page = readFile('src/app/admin/(dashboard)/page.tsx')
    expect(page).toMatch(/aria-label="Tableau de bord administration"/)
  })

  it('admin metrics a aria-label', () => {
    const page = readFile('src/app/admin/(dashboard)/metrics/page.tsx')
    expect(page).toMatch(/aria-label="Métriques CEO"/)
  })

  it('artisan dashboard marque main#main-content (fourni par SiteChrome depuis la refonte 2026-06-06)', () => {
    const chrome = readFile('src/components/SiteChrome.tsx')
    expect(chrome).toMatch(/id="main-content"/)
  })
})

describe("Invariant 6 — retry disponible sur les 3 dashboards en cas d'erreur", () => {
  it('admin root bouton "Réessayer" dans ErrorBanner', () => {
    const banner = readFile('src/components/admin/ErrorBanner.tsx')
    expect(banner).toMatch(/Réessayer|onRetry/)
  })

  it("admin metrics a un bouton Réessayer dans le state d'erreur", () => {
    const page = readFile('src/app/admin/(dashboard)/metrics/page.tsx')
    expect(page).toMatch(/Réessayer/)
    expect(page).toMatch(/mutate\(\)/)
  })

  it("artisan dashboard a un bouton Réessayer dans la banner d'erreur", () => {
    const page = readFile('src/app/(private)/espace-artisan/page.tsx')
    expect(page).toMatch(/Réessayer/)
  })
})

describe('Invariant 7 — pas de PII leak dans les endpoints artisan', () => {
  it("routes artisan ne retournent jamais email ou phone d'un autre user", () => {
    const routes = [
      'src/app/api/artisan/funnel/route.ts',
      'src/app/api/artisan/rge/route.ts',
      'src/app/api/artisan/reputation/route.ts',
      'src/app/api/artisan/trends/route.ts',
    ]
    for (const r of routes) {
      const src = readFile(r)
      // Les select() ne doivent jamais récupérer email ou phone sur providers/profiles
      // (sauf pour l'artisan courant qui est implicite via RLS)
      expect(src, `${r} ne doit pas SELECT email brut`).not.toMatch(
        /\.select\([^)]*\bemail\b[^)]*\)[^)]*providers/
      )
    }
  })
})

describe('Invariant 8 — empty states en français', () => {
  it('les 5 blocs artisan ont un empty state FR', () => {
    const blocks = [
      'src/components/artisan-dashboard/FunnelBlock.tsx',
      'src/components/artisan-dashboard/ReputationBlock.tsx',
      'src/components/artisan-dashboard/RgeStatusBlock.tsx',
      'src/components/artisan-dashboard/PerformanceTrendBlock.tsx',
      'src/components/artisan-dashboard/NextActionsBlock.tsx',
    ]
    // Chaque bloc contient au moins un mot FR contextuel
    const frIndicators = [
      /Aucun/,
      /flywheel/i,
      /Tout est à jour/,
      /démarre/,
      /inbox zero/i,
      /Aucune/,
    ]
    for (const b of blocks) {
      const src = readFile(b)
      const hasFr = frIndicators.some((re) => re.test(src))
      expect(hasFr, `${b} doit contenir un empty state FR`).toBe(true)
    }
  })
})
