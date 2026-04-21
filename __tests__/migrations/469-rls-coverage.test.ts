/**
 * Tests — migration 469 RLS coverage sweep.
 *
 * On ne boote pas Postgres (trop lourd en CI unit) ; on valide :
 *   1. Syntaxe SQL : chaque DO block est bien fermé
 *   2. Exhaustivité : les tables identifiées dans l'audit sont bien traitées
 *   3. Classification cohérente : aucune table PII ne reçoit SELECT USING (TRUE)
 *   4. Pattern défensif : IF EXISTS partout, DROP POLICY IF EXISTS avant CREATE
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const MIGRATION_PATH = join(process.cwd(), 'supabase/migrations/469_rls_coverage_sweep.sql')
const SQL = readFileSync(MIGRATION_PATH, 'utf-8')

describe('Migration 469 — RLS coverage sweep', () => {
  it('fichier existe et non-vide', () => {
    expect(SQL.length).toBeGreaterThan(500)
  })

  it('structure : 4 sections principales', () => {
    expect(SQL).toMatch(/SECTION 1 — Référentiels publics/i)
    expect(SQL).toMatch(/SECTION 2 — Service-role only/i)
    expect(SQL).toMatch(/SECTION 3 — Newsletter/i)
    expect(SQL).toMatch(/SECTION 4 — Audit final/i)
  })

  it('chaque DO block a son END', () => {
    const doCount = (SQL.match(/^DO \$\$/gm) ?? []).length
    const endCount = (SQL.match(/^END \$\$;/gm) ?? []).length
    expect(doCount).toBe(endCount)
    expect(doCount).toBeGreaterThanOrEqual(3)
  })
})

describe('Migration 469 — tables publiques (lecture anon autorisée)', () => {
  const PUBLIC_REF_TABLES = [
    'cee_forfaits',
    'cee_operations_ref',
    'revenus_plafonds',
    'zones_climatiques_ref',
    'provider_insee_enrichment',
  ]

  for (const table of PUBLIC_REF_TABLES) {
    it(`${table} : ENABLE RLS + policy SELECT USING (TRUE)`, () => {
      // RLS activé
      expect(SQL).toMatch(new RegExp(`ALTER TABLE public\\.${table}[^;]*ENABLE ROW LEVEL SECURITY`))
      // Policy SELECT publique explicite
      expect(SQL).toMatch(
        new RegExp(`CREATE POLICY[^;]*ON public\\.${table}[^;]*FOR SELECT USING \\(TRUE\\)`)
      )
      // DROP IF EXISTS avant CREATE pour idempotence
      expect(SQL).toMatch(new RegExp(`DROP POLICY IF EXISTS[^;]*ON public\\.${table}`))
    })
  }
})

describe('Migration 469 — tables service-role only (DENY anon/authenticated)', () => {
  const SERVICE_ONLY_TABLES = [
    'cee_simulator_events',
    'prospection_messages_default',
    'providers_noindex_snapshot',
    'rge_sync_staging',
    'cron_leases',
    'email_outbox_cee',
    'googlebot_analysis',
    'googlebot_logs',
    'mar_staging',
    'provider_descriptions_draft',
    'rate_limits',
    'simulateur_pipedrive_failures',
  ]

  it('liste exhaustive dans le tableau v_service_only_tables', () => {
    for (const table of SERVICE_ONLY_TABLES) {
      expect(SQL).toContain(`'${table}'`)
    }
  })

  it('FORCE ROW LEVEL SECURITY appliqué (pas juste ENABLE)', () => {
    // Le tableau itère et applique FORCE à chaque table du lot
    expect(SQL).toMatch(/ALTER TABLE public\.%I FORCE ROW LEVEL SECURITY/)
  })

  it('AUCUNE policy FOR SELECT USING (TRUE) pour ces tables (PII-safe)', () => {
    // Zéro policy anon sur les tables service-role only — défense en profondeur.
    for (const table of SERVICE_ONLY_TABLES) {
      const unsafePattern = new RegExp(
        `CREATE POLICY[^;]*ON public\\.${table}[^;]*FOR SELECT USING \\(TRUE\\)`
      )
      expect(SQL).not.toMatch(unsafePattern)
    }
  })
})

describe('Migration 469 — newsletter_subscribers (self-insert + admin-read)', () => {
  it('ENABLE RLS', () => {
    expect(SQL).toMatch(/ALTER TABLE public\.newsletter_subscribers[^;]*ENABLE ROW LEVEL SECURITY/)
  })

  it('policy INSERT publique (inscription anon)', () => {
    expect(SQL).toMatch(
      /CREATE POLICY[^;]*ON public\.newsletter_subscribers[^;]*FOR INSERT WITH CHECK \(TRUE\)/
    )
  })

  it('policy ALL admin-only via is_admin()', () => {
    expect(SQL).toMatch(
      /CREATE POLICY[^;]*ON public\.newsletter_subscribers[^;]*FOR ALL USING \(is_admin\(\)\)/
    )
  })

  it('PAS de policy SELECT USING (TRUE) — évite leak emails PII', () => {
    expect(SQL).not.toMatch(
      /CREATE POLICY[^;]*ON public\.newsletter_subscribers[^;]*FOR SELECT USING \(TRUE\)/
    )
  })
})

describe('Migration 469 — garanties défensives', () => {
  it('utilise to_regclass() avant chaque ALTER (tolère drift prod)', () => {
    const regclassCount = (SQL.match(/to_regclass\(/g) ?? []).length
    expect(regclassCount).toBeGreaterThanOrEqual(6)
  })

  it('report final en WARNING si tables restantes sans RLS', () => {
    expect(SQL).toMatch(/RAISE WARNING[^;]*RLS incomplet/)
  })

  it('query pg_class pour vérifier couverture finale', () => {
    expect(SQL).toMatch(/FROM pg_class/)
    expect(SQL).toMatch(/relrowsecurity = FALSE/)
  })

  it('COMMENT ON SCHEMA public pour audit trail', () => {
    expect(SQL).toMatch(/COMMENT ON SCHEMA public IS[^;]*RLS coverage audit 2026-04-21/)
  })

  it('aucun DROP TABLE (strictement additive)', () => {
    expect(SQL).not.toMatch(/DROP TABLE/i)
  })

  it('aucun DELETE (strictement additive)', () => {
    expect(SQL).not.toMatch(/\bDELETE FROM\b/i)
  })

  it('aucun TRUNCATE (strictement additive)', () => {
    expect(SQL).not.toMatch(/\bTRUNCATE\b/i)
  })
})
