/**
 * Fixtures partagées pour les tests E2E CEE.
 *
 * Ces mocks suivent les contrats actuels :
 *   - `POST /api/cee/estimate` — cf. `src/app/api/cee/estimate/route.ts`
 *     (projection publique `PublicEstimateResponse`)
 *   - `CeeDossier` applicatif — cf. `src/lib/cee/dossier-types.ts`
 *
 * Aucune vraie donnée de prod : tous les IDs sont fictifs. Aucun appel à
 * Supabase ne doit être effectué par les tests qui consomment ces fixtures —
 * les specs doivent impérativement intercepter le réseau via `page.route()`.
 */

import type { Page } from '@playwright/test'
import type { CeeDossier } from '@/lib/cee/dossier-types'

// ─── /api/cee/estimate ─────────────────────────────────────────────────────

/** Réponse éligible — chauffagiste en H1 (Paris 75001). */
export const MOCK_CEE_ESTIMATE_ELIGIBLE = {
  eligible: true,
  codes: ['BAR-TH-171'],
  zone_climatique: 'H1' as const,
  items: [
    {
      code: 'BAR-TH-171',
      nom: 'Pompe à chaleur de type air/eau ou eau/eau',
      prime_estimate: {
        euros_classique_min: 900,
        euros_classique_max: 2700,
        euros_precarite_min: 1600,
        euros_precarite_max: 4800,
      },
    },
  ],
}

/** Réponse non-éligible — service hors catalogue CEE (ex: serrurier). */
export const MOCK_CEE_ESTIMATE_NON_ELIGIBLE = {
  eligible: false,
  codes: [],
  zone_climatique: null as 'H1' | 'H2' | 'H3' | null,
  items: [] as Array<{
    code: string
    nom: string
    prime_estimate: {
      euros_classique_min: number
      euros_classique_max: number
      euros_precarite_min: number
      euros_precarite_max: number
    } | null
  }>,
}

// ─── Dossiers CEE (espace artisan) ─────────────────────────────────────────

/** Dossier CEE de démonstration — statut `engagement_signe`. */
export const MOCK_CEE_DOSSIER: CeeDossier = {
  id: 'dossier-test-001',
  devis_id: 'devis-001',
  client_id: 'client-001',
  provider_id: 'prov-001',
  delegataire_id: 'deleg-effy',
  operation_code: 'BAR-TH-171',
  status: 'engagement_signe',
  date_engagement: '2026-04-01',
  date_pre_visite: '2026-04-05',
  date_debut_travaux: null,
  date_fin_travaux: null,
  date_ah_signature: null,
  date_depot_delegataire: null,
  date_depot_pncee: null,
  date_validation: null,
  zone_climatique: 'H1',
  postal_code: '75001',
  kwhc_estime: 180000,
  kwhc_depose: null,
  prime_estimee_eur: 1800,
  prime_versee_eur: null,
  precarite: false,
  justificatifs: [],
  rejection_reason: null,
  notes: 'Dossier de test E2E',
  metadata: {},
  created_at: '2026-04-01T09:00:00Z',
  updated_at: '2026-04-05T10:00:00Z',
}

export const MOCK_CEE_DOSSIERS_LIST: CeeDossier[] = [
  MOCK_CEE_DOSSIER,
  {
    ...MOCK_CEE_DOSSIER,
    id: 'dossier-test-002',
    devis_id: 'devis-002',
    operation_code: 'BAR-EN-101',
    status: 'travaux_en_cours',
    prime_estimee_eur: 950,
    postal_code: '69001',
    zone_climatique: 'H1',
    notes: 'Isolation combles',
  },
]

// ─── Helpers d'interception ────────────────────────────────────────────────

/**
 * Intercepte `POST /api/cee/estimate` et renvoie la réponse donnée.
 * À appeler avant `page.goto()` pour garantir l'interception au 1er appel.
 */
export async function mockCeeEstimate(
  page: Page,
  response: typeof MOCK_CEE_ESTIMATE_ELIGIBLE | typeof MOCK_CEE_ESTIMATE_NON_ELIGIBLE
): Promise<void> {
  await page.route('**/api/cee/estimate', (route) => {
    if (route.request().method() !== 'POST') {
      route.fallback()
      return
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Cache-Control': 'no-store' },
      body: JSON.stringify(response),
    })
  })
}

/**
 * Intercepte les appels liste/détail dossiers CEE côté artisan.
 *
 * Couvre 2 variantes possibles (l'UI finale peut router via API interne OU
 * directement via le client Supabase REST) :
 *   - `/api/cee/dossiers*` (route applicative à venir)
 *   - `**\/rest/v1/cee_dossiers*` (requête Supabase REST directe)
 */
export async function mockArtisanCeeDossiers(page: Page): Promise<void> {
  // Route applicative (si utilisée par l'UI finale)
  await page.route('**/api/cee/dossiers**', (route) => {
    const url = route.request().url()
    // Détail : /api/cee/dossiers/:id
    const detailMatch = url.match(/\/api\/cee\/dossiers\/([^/?]+)/)
    if (detailMatch) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ dossier: MOCK_CEE_DOSSIER }),
      })
      return
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ dossiers: MOCK_CEE_DOSSIERS_LIST }),
    })
  })

  // Fallback : interception directe Supabase REST `/rest/v1/cee_dossiers*`
  await page.route('**/rest/v1/cee_dossiers*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_CEE_DOSSIERS_LIST),
    })
  })
}

/**
 * Intercepte l'upload Supabase Storage pour un justificatif CEE.
 * Accepte toutes les PUT/POST vers `/storage/v1/object/*` et renvoie un 200.
 */
export async function mockCeeJustificatifUpload(page: Page): Promise<void> {
  await page.route('**/storage/v1/object/**', (route) => {
    const method = route.request().method()
    if (method === 'PUT' || method === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Key: 'cee-dossiers/dossier-test-001/facture.pdf',
        }),
      })
      return
    }
    route.fallback()
  })

  // Route applicative si l'UI passe par une API interne pour l'upload.
  await page.route('**/api/cee/dossiers/*/justificatifs*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        justificatif: {
          code: 'facture',
          label: 'Facture travaux',
          storage_path: 'cee-dossiers/dossier-test-001/facture.pdf',
          uploaded_at: '2026-04-11T10:00:00Z',
          verified_at: null,
          exif_geotag_verified: false,
        },
      }),
    })
  })
}

/**
 * Simule un utilisateur artisan connecté côté Supabase Auth.
 * Réplique le pattern utilisé dans `artisan-dashboard.spec.ts`.
 */
export async function mockArtisanAuth(page: Page): Promise<void> {
  await page.route('**/auth/v1/user', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-001',
        email: 'jean@dupont-plomberie.fr',
        user_metadata: { full_name: 'Jean Dupont' },
      }),
    })
  })
}
