import { test, expect, type Page } from '@playwright/test'

// ⚠️ Session artisan requise : le middleware (server-side) redirige tout anon
// vers /connexion — les page.route() ci-dessous n'interceptent que le XHR
// navigateur, pas la vérification Supabase du middleware. Fournir un
// storageState authentifié via E2E_ARTISAN_STORAGE_STATE (JSON Playwright
// généré après login), sinon les tests sont skippés.
test.use({ storageState: process.env.E2E_ARTISAN_STORAGE_STATE ?? undefined })
test.beforeEach(() => {
  test.skip(
    !process.env.E2E_ARTISAN_STORAGE_STATE,
    'Session artisan requise — définir E2E_ARTISAN_STORAGE_STATE (voir en-tête du fichier)'
  )
})

// ─── Données de test (mock API) ─────────────────────────────────────────────

const MOCK_PROVIDER = {
  id: 'prov-001',
  stable_id: 'stable-001',
  slug: 'jean-dupont-plomberie',
  specialty: 'plomberie',
  address_city: 'Lyon',
  address_postal_code: '69001',
  is_verified: true,
  name: 'Jean Dupont Plomberie',
  description: 'Plombier expérimenté à Lyon',
  bio: 'Artisan plombier depuis 15 ans',
  phone: '+33612345678',
  email: 'jean@dupont-plomberie.fr',
  siret: '12345678901234',
  avatar_url: null,
  services_offered: ['Plomberie', 'Chauffage'],
  service_prices: [],
  opening_hours: {},
  website: null,
  user_id: 'user-001',
  claimed_at: '2025-01-15T00:00:00Z',
}

const MOCK_PROFILE = {
  id: 'user-001',
  full_name: 'Jean Dupont',
  role: 'artisan',
}

const MOCK_STATS = {
  profileViews: { value: 245, change: '+12%' },
  phoneReveals: { value: 38, change: '+5%' },
  phoneClicks: { value: 22, change: '-3%' },
  demandesRecues: { value: 7, change: '+2' },
  unreadMessages: 3,
  pendingDemandesCount: 0,
  portfolioPhotoCount: 4,
}

const MOCK_DEMANDES = [
  {
    id: 'dem-001',
    client_name: 'Marie Martin',
    service_name: 'Fuite robinet',
    city: 'Lyon',
    postal_code: '69001',
    created_at: '2026-03-30T10:00:00Z',
    status: 'pending',
  },
  {
    id: 'dem-002',
    client_name: 'Pierre Leroy',
    service_name: 'Installation chauffe-eau',
    city: 'Villeurbanne',
    postal_code: '69100',
    created_at: '2026-03-28T14:30:00Z',
    status: 'sent',
  },
  {
    id: 'dem-003',
    client_name: 'Sophie Moreau',
    service_name: 'Débouchage canalisation',
    city: 'Lyon',
    postal_code: '69003',
    created_at: '2026-03-25T09:15:00Z',
    status: 'accepted',
  },
]

const MOCK_DASHBOARD_RESPONSE = {
  stats: MOCK_STATS,
  recentDemandes: MOCK_DEMANDES,
  profile: MOCK_PROFILE,
  provider: MOCK_PROVIDER,
}

const MOCK_LEADS = [
  {
    id: 'assign-001',
    status: 'pending',
    assigned_at: '2026-03-30T10:00:00Z',
    viewed_at: null,
    lead: {
      id: 'lead-001',
      service_name: 'Réparation fuite',
      client_name: 'Alice Bernard',
      city: 'Lyon',
      postal_code: '69002',
      description: 'Fuite sous évier cuisine, urgent',
      urgency: 'high',
      created_at: '2026-03-30T09:30:00Z',
      phone: '+33698765432',
    },
  },
  {
    id: 'assign-002',
    status: 'viewed',
    assigned_at: '2026-03-28T14:00:00Z',
    viewed_at: '2026-03-28T15:00:00Z',
    lead: {
      id: 'lead-002',
      service_name: 'Installation douche',
      client_name: 'Paul Durand',
      city: 'Villeurbanne',
      postal_code: '69100',
      description: 'Remplacement baignoire par douche italienne',
      urgency: 'normal',
      created_at: '2026-03-28T13:00:00Z',
      phone: '+33611223344',
    },
  },
  {
    id: 'assign-003',
    status: 'quoted',
    assigned_at: '2026-03-25T08:00:00Z',
    viewed_at: '2026-03-25T09:00:00Z',
    lead: {
      id: 'lead-003',
      service_name: 'Chauffe-eau thermodynamique',
      client_name: 'Claire Petit',
      city: 'Lyon',
      postal_code: '69007',
      description: 'Installation chauffe-eau thermodynamique 200L',
      urgency: 'normal',
      created_at: '2026-03-24T17:00:00Z',
      phone: '+33655667788',
    },
  },
]

const MOCK_LEADS_STATS = {
  stats: {
    total: 15,
    pending: 4,
    viewed: 6,
    quoted: 3,
    declined: 2,
  },
  monthlyTrend: [
    { month: '2026-01', count: 3 },
    { month: '2026-02', count: 5 },
    { month: '2026-03', count: 7 },
  ],
}

// AvisTab attend { avis: [{ id, author_name, created_at, rating, content, reply }], stats, totalPages }
const MOCK_AVIS = [
  {
    id: 'avis-001',
    author_name: 'Marie Martin',
    created_at: '2026-03-20T10:00:00Z',
    rating: 5,
    content: 'Excellent travail, très professionnel et ponctuel.',
    reply: 'Merci Marie, ce fut un plaisir !',
  },
  {
    id: 'avis-002',
    author_name: 'Pierre Leroy',
    created_at: '2026-03-15T14:00:00Z',
    rating: 4,
    content: 'Bon travail, juste un peu de retard.',
    reply: null,
  },
  {
    id: 'avis-003',
    author_name: 'Sophie Moreau',
    created_at: '2026-03-10T09:00:00Z',
    rating: 5,
    content: 'Parfait, je recommande vivement.',
    reply: null,
  },
]

const MOCK_AVIS_STATS = {
  moyenne: 4.7,
  total: 12,
  distribution: [
    { note: 5, count: 8 },
    { note: 4, count: 3 },
    { note: 3, count: 1 },
    { note: 2, count: 0 },
    { note: 1, count: 0 },
  ],
}

// ─── Mocks des blocs « Aujourd'hui » (index) ────────────────────────────────
// Payloads minimaux valides, repris de artisan-dashboard-blocks.spec.ts.

const MOCK_RGE = {
  hasRge: true,
  status: 'active',
  rgeValidUntil: '2027-06-01T00:00:00Z',
  daysUntilExpiry: 400,
  qualifications: [{ code: 'RGE-QUALIBAT-5911', domaine: 'Plomberie', organisme: 'Qualibat' }],
  lastSyncedAt: '2026-04-20T00:00:00Z',
  sourceUrl: null,
}

const MOCK_REPUTATION = {
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
}

const MOCK_FUNNEL = {
  days: 30,
  counts: { assigned: 10, viewed: 9, quoted: 5, declined: 1, pending: 0 },
  rates: { responseRate: 90, quoteRate: 55.6, declineRate: 11.1 },
  responseMedianMinutes: 8,
  previousPeriod: { assigned: 8, responseRate: 85 },
}

const MOCK_TRENDS = {
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
}

// ─── Helper : intercepter toutes les API artisan ────────────────────────────

async function mockArtisanAPIs(page: Page) {
  // Dashboard / stats — sert aussi le badge sidebar (ArtisanShell)
  await page.route('**/api/artisan/stats', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_DASHBOARD_RESPONSE),
    })
  })

  // Provider data (profil page)
  await page.route('**/api/artisan/provider', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ provider: MOCK_PROVIDER }),
    })
  })

  // Leads list
  await page.route('**/api/artisan/leads?*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        leads: MOCK_LEADS,
        pagination: { page: 1, pageSize: 20, totalPages: 3, totalItems: 45 },
        provider_city: 'Lyon',
      }),
    })
  })

  // Leads stats (compteurs des onglets « Mes demandes »)
  await page.route('**/api/artisan/leads/stats', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_LEADS_STATS),
    })
  })

  // Leads export — renvoyer un CSV correct (on ne vérifie pas le contenu)
  await page.route('**/api/artisan/leads/export*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'text/csv',
      body: 'id,service,client\nlead-001,Fuite,Alice',
    })
  })

  // Avis (onglet « Avis » de Ma fiche)
  await page.route('**/api/artisan/avis?*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        avis: MOCK_AVIS,
        stats: MOCK_AVIS_STATS,
        totalPages: 2,
      }),
    })
  })

  // Blocs « Aujourd'hui » : RGE / réputation / funnel / tendances
  await page.route('**/api/artisan/rge', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_RGE),
    })
  })
  await page.route('**/api/artisan/reputation', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_REPUTATION),
    })
  })
  await page.route('**/api/artisan/funnel*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_FUNNEL),
    })
  })
  await page.route('**/api/artisan/trends*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_TRENDS),
    })
  })

  // Portfolio (onglet « Portfolio » de Ma fiche — self-fetching)
  await page.route('**/api/portfolio', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    })
  })

  // Supabase auth — simuler un utilisateur connecté (pour la topbar qui appelle getUser)
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

  // Notifications (NotificationBell)
  await page.route('**/api/notifications*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ notifications: [], unreadCount: 0 }),
    })
  })
}

// ─── Flow 1 : Navigation « Aujourd'hui » (index) ────────────────────────────

test.describe("Flow 1 — Navigation espace artisan (Aujourd'hui)", () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test('la page /espace-artisan/dashboard redirige vers /espace-artisan', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')
    // L'ancien /dashboard est redirigé vers l'index « Aujourd'hui »
    await expect(page).toHaveURL(/\/espace-artisan$/)
  })

  test('le titre "Aujourd\'hui" est affiché', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByRole('heading', { name: /Aujourd'hui/i })).toBeVisible()
  })

  test('la sidebar du shell affiche les 3 entrées de navigation', async ({ page }) => {
    await page.goto('/espace-artisan')

    const sidebar = page.locator('nav[aria-label="Menu espace artisan"]').first()
    await expect(sidebar).toBeVisible()

    await expect(sidebar.getByRole('link', { name: /Aujourd'hui/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /Mes demandes/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /Ma fiche/i })).toBeVisible()
    // Gel 2026-06-07 : la section Dossiers CEE n'est plus dans la nav
    await expect(sidebar.getByRole('link', { name: /Dossiers CEE/i })).toHaveCount(0)
  })

  test('les stat cards sont affichées avec les valeurs', async ({ page }) => {
    await page.goto('/espace-artisan')

    const statsSection = page.locator('section[aria-label="Statistiques"]')
    await expect(statsSection).toBeVisible()

    // Vérifier les titres des stat cards
    await expect(statsSection.getByText('Vues du profil')).toBeVisible()
    await expect(statsSection.getByText('Numéros affichés')).toBeVisible()
    await expect(statsSection.getByText('Appels reçus')).toBeVisible()
    await expect(statsSection.getByText('Demandes reçues')).toBeVisible()

    // Vérifier les valeurs
    await expect(statsSection.getByText('245')).toBeVisible()
    await expect(statsSection.getByText('38')).toBeVisible()
  })

  test('le widget complétion de la fiche est visible', async ({ page }) => {
    await page.goto('/espace-artisan')
    // Le widget ProfileCompleteness est dans un aside
    const completionWidget = page.locator('aside[aria-label="Complétion de la fiche"]')
    await expect(completionWidget).toBeVisible()
  })

  test('les dernières demandes sont affichées', async ({ page }) => {
    await page.goto('/espace-artisan')

    const demandesSection = page.locator('section[aria-label="Dernières demandes"]')
    await expect(demandesSection).toBeVisible()
    await expect(demandesSection.getByText('Dernières demandes')).toBeVisible()

    // Vérifier que les demandes mockées sont affichées
    await expect(page.getByText('Fuite robinet')).toBeVisible()
    await expect(page.getByText('Installation chauffe-eau')).toBeVisible()
    await expect(page.getByText('Marie Martin')).toBeVisible()
  })

  test('cliquer sur "Mes demandes" navigue vers /espace-artisan/demandes', async ({ page }) => {
    await page.goto('/espace-artisan')

    const sidebar = page.locator('nav[aria-label="Menu espace artisan"]').first()
    await sidebar.getByRole('link', { name: /Mes demandes/i }).click()
    await expect(page).toHaveURL(/\/espace-artisan\/demandes/)
  })

  test('le badge "Profil référencé" est affiché pour un artisan vérifié', async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText('Profil référencé')).toBeVisible()
  })

  test("le nom de l'artisan et la ville sont affichés dans l'en-tête", async ({ page }) => {
    await page.goto('/espace-artisan')
    await expect(page.getByText(/Jean Dupont/).first()).toBeVisible()
    await expect(page.getByText(/Lyon/).first()).toBeVisible()
  })
})

// ─── Flow 2 : Page « Mes demandes » ─────────────────────────────────────────

test.describe('Flow 2 — Page « Mes demandes »', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test('/espace-artisan/leads redirige vers /espace-artisan/demandes', async ({ page }) => {
    await page.goto('/espace-artisan/leads')
    await expect(page).toHaveURL(/\/espace-artisan\/demandes$/)
  })

  test('/espace-artisan/leads/[id] redirige vers /espace-artisan/demandes/[id]', async ({
    page,
  }) => {
    // Cohérence IA 2026-06-07 : le détail vit sous le namespace de la liste
    await page.goto('/espace-artisan/leads/00000000-0000-4000-8000-000000000001')
    await expect(page).toHaveURL(
      /\/espace-artisan\/demandes\/00000000-0000-4000-8000-000000000001$/
    )
  })

  test("la liste des demandes s'affiche", async ({ page }) => {
    await page.goto('/espace-artisan/demandes')

    // Titre de la page
    await expect(page.getByRole('heading', { name: /Mes demandes/i })).toBeVisible()

    // Vérifier que les leads mockés sont affichés
    await expect(page.getByText('Réparation fuite')).toBeVisible()
    await expect(page.getByText('Installation douche')).toBeVisible()
    await expect(page.getByText('Chauffe-eau thermodynamique')).toBeVisible()
  })

  test('les onglets de filtre par statut sont affichés et cliquables', async ({ page }) => {
    await page.goto('/espace-artisan/demandes')

    // Onglets StatusTabs : Toutes / Nouvelles / Consultées / Devis envoyé / Déclinées
    await expect(page.getByRole('button', { name: /Toutes/i })).toBeVisible()
    const ongletNouvelles = page.getByRole('button', { name: /Nouvelles/i })
    await expect(ongletNouvelles).toBeVisible()

    await ongletNouvelles.click()
  })

  test('la pagination est affichée et fonctionnelle', async ({ page }) => {
    await page.goto('/espace-artisan/demandes')

    // La pagination doit être visible (totalPages = 3 dans le mock)
    const paginationNav = page.locator('nav[aria-label="Pagination"]')
    await expect(paginationNav).toBeVisible()

    const pageButtons = paginationNav.locator('button')
    expect(await pageButtons.count()).toBeGreaterThan(1)
  })

  test('le bouton export CSV est présent', async ({ page }) => {
    await page.goto('/espace-artisan/demandes')

    const exportButton = page.getByRole('button', { name: /Exporter CSV/i })
    await expect(exportButton).toBeVisible()
  })

  test('la recherche dans les demandes fonctionne', async ({ page }) => {
    await page.goto('/espace-artisan/demandes')

    const searchInput = page.getByLabel('Rechercher dans les demandes')
    await expect(searchInput).toBeVisible()

    await searchInput.fill('fuite')
  })

  test('le badge de zone est affiché pour les leads dans la même ville', async ({ page }) => {
    await page.goto('/espace-artisan/demandes')

    // Le mock renvoie provider_city = 'Lyon' et le lead-001 est à Lyon
    await expect(page.getByText('Dans votre zone').first()).toBeVisible()
  })
})

// ─── Flow 3 : Avis (onglet « Avis » de Ma fiche) ────────────────────────────

test.describe('Flow 3 — Avis reçus (onglet Ma fiche)', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test('/espace-artisan/avis-recus redirige vers /espace-artisan/profil?tab=avis', async ({
    page,
  }) => {
    await page.goto('/espace-artisan/avis-recus')
    await expect(page).toHaveURL(/\/espace-artisan\/profil\?tab=avis/)
  })

  test("l'onglet Avis affiche le titre", async ({ page }) => {
    await page.goto('/espace-artisan/profil?tab=avis')
    // Les anciens h1 sont devenus h2 dans les onglets
    await expect(page.getByRole('heading', { name: /Avis reçus/i })).toBeVisible()
  })

  test("les statistiques d'avis sont affichées", async ({ page }) => {
    await page.goto('/espace-artisan/profil?tab=avis')

    // Moyenne
    await expect(page.getByText('4.7')).toBeVisible()
    // Nombre total d'avis
    await expect(page.getByText(/Basé sur 12 avis/i)).toBeVisible()
    // Distribution par étoiles
    await expect(page.getByText('5 étoiles')).toBeVisible()
    await expect(page.getByText('4 étoiles')).toBeVisible()
  })

  test('la liste des avis est affichée', async ({ page }) => {
    await page.goto('/espace-artisan/profil?tab=avis')

    await expect(page.getByText('Marie Martin')).toBeVisible()
    await expect(page.getByText('Pierre Leroy')).toBeVisible()
    await expect(page.getByText('Sophie Moreau')).toBeVisible()

    await expect(page.getByText('Excellent travail, très professionnel et ponctuel.')).toBeVisible()
  })

  test('le sélecteur de tri est présent et fonctionnel', async ({ page }) => {
    await page.goto('/espace-artisan/profil?tab=avis')

    const sortSelect = page.locator('select').first()
    await expect(sortSelect).toBeVisible()

    await expect(sortSelect.locator('option[value="recent"]')).toHaveText('Récents')
    await expect(sortSelect.locator('option[value="oldest"]')).toHaveText('Anciens')
    await expect(sortSelect.locator('option[value="rating_high"]')).toHaveText('Meilleures notes')
    await expect(sortSelect.locator('option[value="rating_low"]')).toHaveText('Moins bonnes notes')

    await sortSelect.selectOption('rating_high')
  })

  test('la pagination des avis fonctionne', async ({ page }) => {
    await page.goto('/espace-artisan/profil?tab=avis')

    // Le mock renvoie totalPages = 2, donc la pagination doit être visible
    const paginationNav = page.locator('nav[aria-label="Pagination"]')
    await expect(paginationNav).toBeVisible()
  })

  test('une réponse artisan existante est affichée', async ({ page }) => {
    await page.goto('/espace-artisan/profil?tab=avis')

    // L'avis de Marie Martin a une réponse
    await expect(page.getByText('Merci Marie, ce fut un plaisir !')).toBeVisible()
  })

  test('le bouton "Répondre" est affiché pour les avis sans réponse', async ({ page }) => {
    await page.goto('/espace-artisan/profil?tab=avis')

    // 2 avis sans réponse (Pierre et Sophie)
    const repondreButtons = page.getByRole('button', { name: /Répondre/i })
    expect(await repondreButtons.count()).toBe(2)
  })
})

// ─── Flow 4 : Calendrier (gelé → redirect) ──────────────────────────────────

test.describe('Flow 4 — Calendrier gelé', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test('/espace-artisan/calendrier redirige vers /espace-artisan', async ({ page }) => {
    await page.goto('/espace-artisan/calendrier')
    await expect(page).toHaveURL(/\/espace-artisan$/)
  })
})

// ─── Flow 5 : Page « Ma fiche » (4 onglets) ─────────────────────────────────

test.describe('Flow 5 — Page « Ma fiche »', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test('la page affiche le titre "Ma fiche"', async ({ page }) => {
    await page.goto('/espace-artisan/profil')
    await expect(page.getByRole('heading', { name: /Ma fiche/i })).toBeVisible()
  })

  test('les 4 onglets horizontaux sont présents', async ({ page }) => {
    await page.goto('/espace-artisan/profil')

    const tabList = page.locator('[role="tablist"]')
    await expect(tabList).toBeVisible()
    await expect(tabList).toHaveAttribute('aria-orientation', 'horizontal')

    await expect(page.getByRole('tab', { name: /Identité & contact/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Activité & présentation/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Portfolio/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Avis/i })).toBeVisible()
  })

  test('l\'onglet "Identité & contact" est actif par défaut', async ({ page }) => {
    await page.goto('/espace-artisan/profil')

    const identiteTab = page.getByRole('tab', { name: /Identité & contact/i })
    await expect(identiteTab).toHaveAttribute('aria-selected', 'true')

    const tabPanel = page.locator('[role="tabpanel"]#tabpanel-identite')
    await expect(tabPanel).toBeVisible()
  })

  test('cliquer sur "Activité & présentation" affiche le tabpanel correspondant', async ({
    page,
  }) => {
    await page.goto('/espace-artisan/profil')

    const activiteTab = page.getByRole('tab', { name: /Activité & présentation/i })
    await activiteTab.click()

    const activitePanel = page.locator('[role="tabpanel"]#tabpanel-activite')
    await expect(activitePanel).toBeVisible()

    await expect(activiteTab).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tab', { name: /Identité & contact/i })).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  test('la navigation clavier ArrowRight entre onglets fonctionne', async ({ page }) => {
    await page.goto('/espace-artisan/profil')

    const identiteTab = page.getByRole('tab', { name: /Identité & contact/i })
    await identiteTab.focus()

    await page.keyboard.press('ArrowRight')
    const activiteTab = page.getByRole('tab', { name: /Activité & présentation/i })
    await expect(activiteTab).toBeFocused()
    await expect(activiteTab).toHaveAttribute('aria-selected', 'true')
  })

  test('l\'ancien alias ?tab=presentation active l\'onglet "Activité & présentation"', async ({
    page,
  }) => {
    await page.goto('/espace-artisan/profil?tab=presentation')

    await expect(page.getByRole('tab', { name: /Activité & présentation/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await expect(page.locator('[role="tabpanel"]#tabpanel-activite')).toBeVisible()
  })

  test("?tab=portfolio active l'onglet Portfolio", async ({ page }) => {
    await page.goto('/espace-artisan/profil?tab=portfolio')

    await expect(page.getByRole('tab', { name: /Portfolio/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await expect(page.locator('[role="tabpanel"]#tabpanel-portfolio')).toBeVisible()
  })
})

// ─── Flow 6 : Accessibilité espace artisan ──────────────────────────────────

test.describe('Flow 6 — Accessibilité espace artisan', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test("le main landmark est présent avec l'id main-content", async ({ page }) => {
    await page.goto('/espace-artisan')

    const main = page.locator('main#main-content, #main-content')
    await expect(main.first()).toBeVisible()
  })

  test('Tab navigue correctement dans la page', async ({ page }) => {
    await page.goto('/espace-artisan')

    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })

  test('les images ont des attributs alt ou aria-hidden', async ({ page }) => {
    await page.goto('/espace-artisan')

    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < Math.min(count, 15); i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const ariaHidden = await img.getAttribute('aria-hidden')
      expect(alt !== null || ariaHidden === 'true').toBeTruthy()
    }
  })

  test('les boutons ont des noms accessibles', async ({ page }) => {
    await page.goto('/espace-artisan')

    const buttons = page.locator('button')
    const count = await buttons.count()

    for (let i = 0; i < Math.min(count, 20); i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        const text = await button.textContent()
        const ariaLabel = await button.getAttribute('aria-label')
        const title = await button.getAttribute('title')
        expect(text?.trim() || ariaLabel || title).toBeTruthy()
      }
    }
  })

  test('les sections ont des aria-label appropriés', async ({ page }) => {
    await page.goto('/espace-artisan')

    const statsSection = page.locator('section[aria-label="Statistiques"]')
    await expect(statsSection).toBeVisible()

    const demandesSection = page.locator('section[aria-label="Dernières demandes"]')
    await expect(demandesSection).toBeVisible()
  })

  test("les liens de la sidebar pointent vers l'espace artisan", async ({ page }) => {
    await page.goto('/espace-artisan')

    // Le lien « Voir ma fiche publique » pointe vers /services/* (URL publique) —
    // on ne cible que les liens internes à l'espace artisan.
    const sidebarLinks = page.locator(
      'nav a[href^="/espace-artisan"], aside a[href^="/espace-artisan"]'
    )
    const count = await sidebarLinks.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const link = sidebarLinks.nth(i)
      const href = await link.getAttribute('href')
      // L'entrée « Aujourd'hui » est exactement /espace-artisan (sans slash final)
      expect(href).toMatch(/\/espace-artisan(\/|$)/)
    }
  })

  test('les statuts des demandes ont role="status"', async ({ page }) => {
    await page.goto('/espace-artisan')

    const statusBadges = page.locator('[role="status"]')
    const count = await statusBadges.count()
    expect(count).toBeGreaterThan(0)
  })

  test('la page « Ma fiche » respecte le pattern ARIA tablist (horizontal)', async ({ page }) => {
    await page.goto('/espace-artisan/profil')

    const tablist = page.locator('[role="tablist"]')
    await expect(tablist).toBeVisible()
    await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal')

    const selectedTab = page.locator('[role="tab"][aria-selected="true"]')
    const controlsId = await selectedTab.getAttribute('aria-controls')
    expect(controlsId).toBeTruthy()

    const panel = page.locator(`#${controlsId}`)
    await expect(panel).toBeVisible()
  })
})
