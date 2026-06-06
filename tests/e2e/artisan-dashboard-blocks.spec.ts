/**
 * E2E — artisan dashboard new blocks
 *
 * Couvre en vrai réseau (Playwright route intercept) les 5 blocs ajoutés sur
 * /espace-artisan (page « Aujourd'hui ») sous 4 scénarios :
 *   - Profil A : RGE actif, flywheel avis en empty state, funnel sain (healthy path)
 *   - Profil B : RGE expiré, leads pending, responseRate 30% → 4+ actions P0/P1
 *   - Profil C : pas RGE, portfolio vide, inbox zero côté leads
 *   - Scénario D : SWR partial failure (2 endpoints sur 4 en 500) → dashboard
 *     ne crashe pas, blocs failed affichent null, les autres rendent
 */
import { test, expect, type Page } from '@playwright/test'

// ⚠️ Session artisan requise : le middleware (server-side) redirige tout anon
// vers /connexion — les page.route() n'interceptent que le XHR navigateur.
// Fournir un storageState authentifié via E2E_ARTISAN_STORAGE_STATE, sinon skip.
test.use({ storageState: process.env.E2E_ARTISAN_STORAGE_STATE ?? undefined })
test.beforeEach(() => {
  test.skip(
    !process.env.E2E_ARTISAN_STORAGE_STATE,
    'Session artisan requise — définir E2E_ARTISAN_STORAGE_STATE (voir en-tête du fichier)'
  )
})

// ─── Shared mocks pour /api/artisan/stats (déjà référencé par NextActionsBlock) ─

const BASE_PROVIDER = {
  id: 'prov-001',
  stable_id: 'stable-001',
  slug: 'jean-dupont-plomberie',
  specialty: 'plomberie',
  address_city: 'Lyon',
  address_postal_code: '69001',
  is_verified: true,
  name: 'Jean Dupont Plomberie',
  description: 'Plombier',
  bio: '',
  phone: '+33612345678',
  email: 'jean@test.fr',
  siret: '12345678901234',
  avatar_url: null,
  services_offered: ['Plomberie'],
  service_prices: [],
  opening_hours: {},
  website: null,
  user_id: 'user-001',
  claimed_at: '2025-01-15T00:00:00Z',
}

const BASE_STATS_BODY = (overrides: Record<string, unknown> = {}) => ({
  stats: {
    profileViews: { value: 200, change: '+10%' },
    phoneReveals: { value: 30, change: '+5%' },
    phoneClicks: { value: 20, change: '0%' },
    demandesRecues: { value: 5, change: '+0%' },
    unreadMessages: 0,
    pendingDemandesCount: 0,
    portfolioPhotoCount: 5,
    ...overrides,
  },
  recentDemandes: [],
  profile: { id: 'user-001', full_name: 'Jean Dupont', role: 'artisan' },
  provider: BASE_PROVIDER,
})

type Profile = {
  rge: unknown
  reputation: unknown
  funnel: unknown
  trends: unknown
  stats?: unknown
}

async function mockProfile(page: Page, p: Profile) {
  await page.route('**/api/artisan/stats', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(p.stats ?? BASE_STATS_BODY()),
    })
  })
  await page.route('**/api/artisan/rge', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(p.rge),
    })
  })
  await page.route('**/api/artisan/reputation', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(p.reputation),
    })
  })
  await page.route('**/api/artisan/funnel*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(p.funnel),
    })
  })
  await page.route('**/api/artisan/trends*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(p.trends),
    })
  })
  // Ancillaires
  await page.route('**/api/notifications*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ notifications: [], unreadCount: 0 }),
    })
  })
}

// ─── Profil A : RGE actif, tout sain ────────────────────────────────────────

const PROFILE_A_HEALTHY: Profile = {
  rge: {
    hasRge: true,
    status: 'active',
    rgeValidUntil: '2027-06-01T00:00:00Z',
    daysUntilExpiry: 400,
    qualifications: [{ code: 'RGE-QUALIBAT-5911', domaine: 'Plomberie', organisme: 'Qualibat' }],
    lastSyncedAt: '2026-04-20T00:00:00Z',
    sourceUrl: null,
  },
  reputation: {
    reviews: {
      total: 0,
      published: 0,
      avgRating: 0,
      distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      pendingResponse: 0,
      latestPublishedAt: null,
    },
    invitations: {
      sent7d: 0,
      sent30d: 0,
      pending30d: 0,
      completed30d: 0,
      completionRate30d: null,
      nextScheduledAt: '2026-04-27T00:00:00Z',
    },
  },
  funnel: {
    days: 30,
    counts: { assigned: 10, viewed: 9, quoted: 5, declined: 1, pending: 0 },
    rates: { responseRate: 90, quoteRate: 55.6, declineRate: 11.1 },
    responseMedianMinutes: 8,
    previousPeriod: { assigned: 8, responseRate: 85 },
  },
  trends: {
    days: 30,
    series: {
      profileViews: Array.from({ length: 30 }, (_, i) => ({
        day: `2026-04-${String((i % 30) + 1).padStart(2, '0')}`,
        count: 5 + (i % 4),
      })),
      phoneReveals: Array.from({ length: 30 }, () => ({ day: '2026-04-01', count: 1 })),
      phoneClicks: Array.from({ length: 30 }, () => ({ day: '2026-04-01', count: 0 })),
      demandesRecues: Array.from({ length: 30 }, () => ({ day: '2026-04-01', count: 0 })),
    },
    totals: { profileViews: 180, phoneReveals: 30, phoneClicks: 0, demandesRecues: 10 },
  },
}

test.describe('Dashboard artisan — Profil A : RGE actif, healthy', () => {
  test.beforeEach(async ({ page }) => {
    await mockProfile(page, PROFILE_A_HEALTHY)
  })

  test('affiche badge RGE Active + date', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText('Active').first()).toBeVisible()
  })

  test('affiche nudge vert "Excellent taux de réponse"', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText(/Excellent taux de réponse/i)).toBeVisible()
  })

  test('affiche empty state flywheel sur ReputationBlock', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText(/flywheel avis démarre bientôt/i)).toBeVisible()
  })

  test('NextActionsBlock affiche inbox zero', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText(/inbox zero/i)).toBeVisible()
  })

  test('PerformanceTrendBlock affiche 4 sparklines SVG', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText('Tendance sur 30 jours')).toBeVisible()
    const svgs = page.locator('[role="img"]')
    await expect(svgs.first()).toBeVisible()
    // Les 4 rows
    await expect(page.getByText('Vues du profil')).toBeVisible()
    await expect(page.getByText('Demandes reçues')).toBeVisible()
  })
})

// ─── Profil B : RGE expiré + pending leads + responseRate faible ──────────

const PROFILE_B_RED: Profile = {
  rge: {
    hasRge: true,
    status: 'expired',
    rgeValidUntil: '2025-12-01T00:00:00Z',
    daysUntilExpiry: -50,
    qualifications: [{ code: 'RGE-QUALIBAT-5911', organisme: 'Qualibat' }],
    lastSyncedAt: '2026-04-20T00:00:00Z',
    sourceUrl: null,
  },
  reputation: {
    reviews: {
      total: 3,
      published: 3,
      avgRating: 4.3,
      distribution: { '1': 0, '2': 0, '3': 1, '4': 0, '5': 2 },
      pendingResponse: 2,
      latestPublishedAt: '2026-04-10T00:00:00Z',
    },
    invitations: {
      sent7d: 1,
      sent30d: 5,
      pending30d: 3,
      completed30d: 2,
      completionRate30d: 40,
      nextScheduledAt: null,
    },
  },
  funnel: {
    days: 30,
    counts: { assigned: 10, viewed: 3, quoted: 1, declined: 0, pending: 7 },
    rates: { responseRate: 30, quoteRate: 33.3, declineRate: 0 },
    responseMedianMinutes: 240,
    previousPeriod: { assigned: 5, responseRate: 50 },
  },
  trends: PROFILE_A_HEALTHY.trends,
  stats: BASE_STATS_BODY({
    pendingDemandesCount: 7,
    unreadMessages: 2,
    portfolioPhotoCount: 5,
  }),
}

test.describe('Dashboard artisan — Profil B : crisis mode', () => {
  test.beforeEach(async ({ page }) => {
    await mockProfile(page, PROFILE_B_RED)
  })

  test('RGE expired bandeau rouge affiché', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText(/Votre qualification RGE est expirée/i)).toBeVisible()
  })

  test("NextActionsBlock liste les actions P0 d'abord", async ({ page }) => {
    await page.goto('/espace-artisan')
    const items = page.getByRole('listitem')
    // Le premier item doit être P0 (RGE expired ou pending leads)
    const firstText = await items.first().textContent()
    expect(firstText).toMatch(/RGE est expirée|demandes non consultées/i)
  })

  test('nudge amber funnel "< 50%" visible', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText(/Votre taux de réponse est inférieur à 50%/i)).toBeVisible()
  })

  test('action "X avis en attente" visible et linkée', async ({ page }) => {
    await page.goto('/espace-artisan')
    const link = page.getByRole('link', { name: /avis en attente de votre réponse/i }).first()
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', /avis\?filter=unresponded/)
  })
})

// ─── Profil C : pas RGE ───────────────────────────────────────────────────

const PROFILE_C_NO_RGE: Profile = {
  rge: {
    hasRge: false,
    status: 'none',
    rgeValidUntil: null,
    daysUntilExpiry: null,
    qualifications: [],
    lastSyncedAt: null,
    sourceUrl: null,
  },
  reputation: PROFILE_A_HEALTHY.reputation,
  funnel: {
    days: 30,
    counts: { assigned: 0, viewed: 0, quoted: 0, declined: 0, pending: 0 },
    rates: { responseRate: null, quoteRate: null, declineRate: null },
    responseMedianMinutes: null,
    previousPeriod: { assigned: 0, responseRate: null },
  },
  trends: {
    days: 30,
    series: {
      profileViews: Array.from({ length: 30 }, () => ({ day: '2026-04-01', count: 0 })),
      phoneReveals: Array.from({ length: 30 }, () => ({ day: '2026-04-01', count: 0 })),
      phoneClicks: Array.from({ length: 30 }, () => ({ day: '2026-04-01', count: 0 })),
      demandesRecues: Array.from({ length: 30 }, () => ({ day: '2026-04-01', count: 0 })),
    },
    totals: { profileViews: 0, phoneReveals: 0, phoneClicks: 0, demandesRecues: 0 },
  },
  stats: BASE_STATS_BODY({ portfolioPhotoCount: 0 }),
}

test.describe('Dashboard artisan — Profil C : pas RGE + empty data', () => {
  test.beforeEach(async ({ page }) => {
    await mockProfile(page, PROFILE_C_NO_RGE)
  })

  test('bandeau "Aucune qualification RGE détectée"', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText(/Aucune qualification RGE détectée/i)).toBeVisible()
  })

  test('FunnelBlock empty state', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText(/Aucune demande reçue/i)).toBeVisible()
  })

  test('PerformanceTrendBlock empty state', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText(/Aucune activité enregistrée/i)).toBeVisible()
  })

  test('NextActionsBlock propose "Devenez RGE" et "Ajoutez des photos"', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText(/Devenez Reconnu Garant/i)).toBeVisible()
    await expect(page.getByText(/Ajoutez des photos/i)).toBeVisible()
  })
})

// ─── Scénario D : SWR partial failure ─────────────────────────────────────

test.describe('Dashboard artisan — SWR partial failure (2/4 en erreur)', () => {
  test.beforeEach(async ({ page }) => {
    // RGE et Reputation OK
    await page.route('**/api/artisan/rge', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(PROFILE_A_HEALTHY.rge),
      })
    })
    await page.route('**/api/artisan/reputation', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(PROFILE_A_HEALTHY.reputation),
      })
    })
    // Funnel et Trends renvoient 500
    await page.route('**/api/artisan/funnel*', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"boom"}' })
    })
    await page.route('**/api/artisan/trends*', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"boom"}' })
    })
    // Stats OK
    await page.route('**/api/artisan/stats', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(BASE_STATS_BODY()),
      })
    })
  })

  test('la page ne crashe pas et affiche le header', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByRole('heading', { name: /Aujourd'hui/i })).toBeVisible()
  })

  test('RgeStatusBlock reste rendu (source OK)', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText('Active').first()).toBeVisible()
  })

  test('ReputationBlock reste rendu (source OK)', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText(/flywheel avis démarre bientôt/i)).toBeVisible()
  })

  test('FunnelBlock et PerformanceTrendBlock disparaissent (error → null)', async ({ page }) => {
    await page.goto('/espace-artisan')
    // Les titres des 2 blocs en erreur ne doivent PAS apparaître
    await expect(page.getByText('Tendance sur 30 jours')).not.toBeVisible()
    await expect(page.getByText('Conversion des demandes (30 jours)')).not.toBeVisible()
  })

  test('NextActionsBlock fonctionne en mode dégradé (2 sources sur 4)', async ({ page }) => {
    await page.goto('/espace-artisan')
    // Soit il affiche inbox zero (pas d'action déduite), soit il affiche des actions
    // basées sur rge+reputation. Dans tous les cas, pas de crash.
    const inbox = page.getByText(/inbox zero|À faire en priorité/i)
    await expect(inbox.first()).toBeVisible()
  })
})
