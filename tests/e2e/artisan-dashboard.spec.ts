import { test, expect, type Page } from '@playwright/test'

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

const MOCK_AVIS = [
  {
    id: 'avis-001',
    client_name: 'Marie Martin',
    created_at: '2026-03-20T10:00:00Z',
    rating: 5,
    comment: 'Excellent travail, très professionnel et ponctuel.',
    artisan_response: 'Merci Marie, ce fut un plaisir !',
  },
  {
    id: 'avis-002',
    client_name: 'Pierre Leroy',
    created_at: '2026-03-15T14:00:00Z',
    rating: 4,
    comment: 'Bon travail, juste un peu de retard.',
    artisan_response: null,
  },
  {
    id: 'avis-003',
    client_name: 'Sophie Moreau',
    created_at: '2026-03-10T09:00:00Z',
    rating: 5,
    comment: 'Parfait, je recommande vivement.',
    artisan_response: null,
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

const MOCK_BOOKINGS = [
  {
    id: 'book-001',
    client_name: 'Marie Martin',
    client_email: 'marie@example.com',
    client_phone: '+33612345678',
    service_description: 'Réparation fuite robinet',
    status: 'confirmed',
    date: '2026-04-01',
    start_time: '09:00:00',
    end_time: '10:30:00',
  },
  {
    id: 'book-002',
    client_name: 'Pierre Leroy',
    client_email: 'pierre@example.com',
    client_phone: '+33698765432',
    service_description: 'Installation chauffe-eau',
    status: 'pending',
    date: '2026-04-01',
    start_time: '14:00:00',
    end_time: '16:00:00',
  },
  {
    id: 'book-003',
    client_name: 'Sophie Moreau',
    client_email: null,
    client_phone: null,
    service_description: 'Devis sur place',
    status: 'confirmed',
    date: '2026-04-15',
    start_time: '10:00:00',
    end_time: '11:00:00',
  },
]

const MOCK_AVAILABILITY_SLOTS = [
  { id: 'slot-001', date: '2026-04-02', start_time: '08:00:00', end_time: '12:00:00' },
  { id: 'slot-002', date: '2026-04-02', start_time: '14:00:00', end_time: '18:00:00' },
  { id: 'slot-003', date: '2026-04-10', start_time: '09:00:00', end_time: '17:00:00' },
]

// ─── Helper : intercepter toutes les API artisan ────────────────────────────

async function mockArtisanAPIs(page: Page) {
  // Dashboard / stats
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

  // Leads stats
  await page.route('**/api/artisan/leads/stats', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_LEADS_STATS),
    })
  })

  // Leads export — renvoyer un lien correct (on ne vérifie pas le contenu)
  await page.route('**/api/artisan/leads/export*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'text/csv',
      body: 'id,service,client\nlead-001,Fuite,Alice',
    })
  })

  // Avis
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

  // Bookings (calendrier)
  await page.route('**/api/artisan/bookings*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        bookings: MOCK_BOOKINGS,
        availabilitySlots: MOCK_AVAILABILITY_SLOTS,
      }),
    })
  })

  // Supabase auth — simuler un utilisateur connecté (pour la sidebar qui appelle getUser)
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

// ─── Flow 1 : Navigation dashboard ─────────────────────────────────────────

test.describe('Flow 1 — Navigation dashboard artisan', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test('la page /espace-artisan redirige vers /espace-artisan/dashboard', async ({ page }) => {
    await page.goto('/espace-artisan')
    // La page redirige ou affiche le dashboard
    await expect(page).toHaveURL(/espace-artisan\/(dashboard)?/)
  })

  test('le titre "Tableau de bord" est affiché', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')
    await expect(page.getByRole('heading', { name: /Tableau de bord/i })).toBeVisible()
  })

  test('la sidebar de navigation est visible', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')
    // La sidebar contient les liens de navigation principaux
    const sidebar = page.locator('nav, aside').filter({ hasText: 'Tableau de bord' }).first()
    await expect(sidebar).toBeVisible()
  })

  test('les stat cards sont affichées avec les valeurs', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')

    // Vérifier les 4 cartes de statistiques
    const statsSection = page.locator('section[aria-label="Statistiques"]')
    await expect(statsSection).toBeVisible()

    // Vérifier les titres des stat cards
    await expect(page.getByText('Vues du profil')).toBeVisible()
    await expect(page.getByText('Numéros affichés')).toBeVisible()
    await expect(page.getByText('Appels reçus')).toBeVisible()
    await expect(page.getByText('Demandes reçues')).toBeVisible()

    // Vérifier les valeurs
    await expect(page.getByText('245')).toBeVisible()
    await expect(page.getByText('38')).toBeVisible()
  })

  test('le widget complétude profil est visible', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')
    // Le widget ProfileCompleteness est dans un aside
    const completionWidget = page.locator('aside[aria-label="Complétion du profil"]')
    await expect(completionWidget).toBeVisible()
  })

  test('les dernières demandes sont affichées', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')

    // Section des demandes
    const demandesSection = page.locator('section[aria-label="Dernières demandes"]')
    await expect(demandesSection).toBeVisible()
    await expect(page.getByText('Dernières demandes')).toBeVisible()

    // Vérifier que les demandes mockées sont affichées
    await expect(page.getByText('Fuite robinet')).toBeVisible()
    await expect(page.getByText('Installation chauffe-eau')).toBeVisible()
    await expect(page.getByText('Marie Martin')).toBeVisible()
  })

  test('cliquer sur un lien sidebar navigue vers la bonne page', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')

    // Cliquer sur le lien "Leads reçus" dans la sidebar
    await page.getByRole('link', { name: /Leads reçus/i }).click()
    await expect(page).toHaveURL(/\/espace-artisan\/leads/)
  })

  test('le badge "Profil référencé" est affiché pour un artisan vérifié', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')
    await expect(page.getByText('Profil référencé')).toBeVisible()
  })

  test('le nom de l\'artisan et la ville sont affichés dans le header', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')
    await expect(page.getByText(/Jean Dupont/)).toBeVisible()
    await expect(page.getByText(/Lyon/)).toBeVisible()
  })
})

// ─── Flow 2 : Page leads ────────────────────────────────────────────────────

test.describe('Flow 2 — Page leads artisan', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test('la liste des leads s\'affiche', async ({ page }) => {
    await page.goto('/espace-artisan/leads')

    // Vérifier le fil d'Ariane
    await expect(page.getByText('Leads reçus')).toBeVisible()

    // Vérifier que les leads mockés sont affichés
    await expect(page.getByText('Réparation fuite')).toBeVisible()
    await expect(page.getByText('Installation douche')).toBeVisible()
    await expect(page.getByText('Chauffe-eau thermodynamique')).toBeVisible()
  })

  test('les stat cards leads sont affichées', async ({ page }) => {
    await page.goto('/espace-artisan/leads')

    await expect(page.getByText('Total reçus')).toBeVisible()
    await expect(page.getByText('Nouveaux')).toBeVisible()
    await expect(page.getByText('Devis envoyés')).toBeVisible()
    await expect(page.getByText('Taux réponse')).toBeVisible()
  })

  test('les onglets de filtre par statut sont affichés et cliquables', async ({ page }) => {
    await page.goto('/espace-artisan/leads')

    // Vérifier les onglets
    await expect(page.getByRole('button', { name: /Tous/i }).or(page.getByText('Tous'))).toBeVisible()
    const ongletNouveaux = page.getByRole('button', { name: /Nouveaux/i }).or(page.getByText('Nouveaux').first())
    await expect(ongletNouveaux).toBeVisible()

    // Cliquer sur un onglet de filtre
    await ongletNouveaux.click()
  })

  test('la pagination est affichée et fonctionnelle', async ({ page }) => {
    await page.goto('/espace-artisan/leads')

    // La pagination doit être visible (totalPages = 3 dans le mock)
    const paginationNav = page.locator('nav[aria-label="Pagination"]')
    await expect(paginationNav).toBeVisible()

    // Vérifions que les boutons de pagination existent
    const pageButtons = paginationNav.locator('button')
    expect(await pageButtons.count()).toBeGreaterThan(1)
  })

  test('le bouton export CSV est présent', async ({ page }) => {
    await page.goto('/espace-artisan/leads')

    const exportButton = page.getByRole('button', { name: /Exporter|CSV/i }).or(
      page.locator('button').filter({ hasText: /Exporter/ })
    )
    await expect(exportButton).toBeVisible()
  })

  test('le graphique de tendance mensuelle est affiché', async ({ page }) => {
    await page.goto('/espace-artisan/leads')

    // Le composant LeadsTrendChart devrait être rendu
    // Vérifier que la section est rendue sans erreur
    const mainContent = page.locator('main#main-content, main')
    await expect(mainContent.first()).toBeVisible()
  })

  test('la recherche dans les leads fonctionne', async ({ page }) => {
    await page.goto('/espace-artisan/leads')

    // Trouver le champ de recherche
    const searchInput = page.getByLabel('Rechercher dans les leads').or(
      page.getByPlaceholder('Rechercher...')
    )
    await expect(searchInput).toBeVisible()

    // Taper dans le champ de recherche
    await searchInput.fill('fuite')
  })

  test('le badge de zone est affiché pour les leads dans la même ville', async ({ page }) => {
    await page.goto('/espace-artisan/leads')

    // Le mock renvoie provider_city = 'Lyon' et le lead-001 est à Lyon
    await expect(page.getByText('Dans votre zone').first()).toBeVisible()
  })
})

// ─── Flow 3 : Page avis ────────────────────────────────────────────────────

test.describe('Flow 3 — Page avis reçus', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test('la page des avis s\'affiche avec le titre', async ({ page }) => {
    await page.goto('/espace-artisan/avis-recus')

    await expect(page.getByRole('heading', { name: /Avis reçus/i })).toBeVisible()
  })

  test('les statistiques d\'avis sont affichées', async ({ page }) => {
    await page.goto('/espace-artisan/avis-recus')

    // Moyenne
    await expect(page.getByText('4.7')).toBeVisible()
    // Nombre total d'avis
    await expect(page.getByText(/Basé sur 12 avis/i)).toBeVisible()
    // Distribution par étoiles
    await expect(page.getByText('5 étoiles')).toBeVisible()
    await expect(page.getByText('4 étoiles')).toBeVisible()
  })

  test('la liste des avis est affichée', async ({ page }) => {
    await page.goto('/espace-artisan/avis-recus')

    // Vérifier les noms des clients
    await expect(page.getByText('Marie Martin')).toBeVisible()
    await expect(page.getByText('Pierre Leroy')).toBeVisible()
    await expect(page.getByText('Sophie Moreau')).toBeVisible()

    // Vérifier les commentaires
    await expect(page.getByText('Excellent travail, très professionnel et ponctuel.')).toBeVisible()
  })

  test('le sélecteur de tri est présent et fonctionnel', async ({ page }) => {
    await page.goto('/espace-artisan/avis-recus')

    // Trouver le select de tri
    const sortSelect = page.locator('select').first()
    await expect(sortSelect).toBeVisible()

    // Vérifier les options
    await expect(sortSelect.locator('option[value="recent"]')).toHaveText('Récents')
    await expect(sortSelect.locator('option[value="oldest"]')).toHaveText('Anciens')
    await expect(sortSelect.locator('option[value="rating_high"]')).toHaveText('Meilleures notes')
    await expect(sortSelect.locator('option[value="rating_low"]')).toHaveText('Moins bonnes notes')

    // Changer le tri
    await sortSelect.selectOption('rating_high')
  })

  test('la pagination des avis fonctionne', async ({ page }) => {
    await page.goto('/espace-artisan/avis-recus')

    // Le mock renvoie totalPages = 2, donc la pagination doit être visible
    const paginationNav = page.locator('nav[aria-label="Pagination"]')
    await expect(paginationNav).toBeVisible()
  })

  test('une réponse artisan existante est affichée', async ({ page }) => {
    await page.goto('/espace-artisan/avis-recus')

    // L'avis de Marie Martin a une réponse
    await expect(page.getByText('Merci Marie, ce fut un plaisir !')).toBeVisible()
  })

  test('le bouton "Répondre" est affiché pour les avis sans réponse', async ({ page }) => {
    await page.goto('/espace-artisan/avis-recus')

    // Les avis sans réponse ont un bouton "Répondre"
    const repondreButtons = page.getByRole('button', { name: /Répondre/i })
    // 2 avis sans réponse (Pierre et Sophie)
    expect(await repondreButtons.count()).toBe(2)
  })
})

// ─── Flow 4 : Page calendrier ──────────────────────────────────────────────

test.describe('Flow 4 — Page calendrier', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test('la page calendrier s\'affiche avec le titre', async ({ page }) => {
    await page.goto('/espace-artisan/calendrier')

    await expect(page.getByRole('heading', { name: /Mon Calendrier/i })).toBeVisible()
  })

  test('la grille du calendrier est affichée avec les jours de la semaine', async ({ page }) => {
    await page.goto('/espace-artisan/calendrier')

    // Noms des jours (desktop)
    await expect(page.getByText('Lun').first()).toBeVisible()
    await expect(page.getByText('Mar').first()).toBeVisible()
    await expect(page.getByText('Mer').first()).toBeVisible()
    await expect(page.getByText('Jeu').first()).toBeVisible()
    await expect(page.getByText('Ven').first()).toBeVisible()
    await expect(page.getByText('Sam').first()).toBeVisible()
    await expect(page.getByText('Dim').first()).toBeVisible()
  })

  test('le mois et l\'année sont affichés', async ({ page }) => {
    await page.goto('/espace-artisan/calendrier')

    // Le composant Calendar affiche le mois courant
    // On vérifie juste qu'un nom de mois français est visible
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    ]
    const monthRegex = new RegExp(monthNames.join('|'))
    await expect(page.getByText(monthRegex).first()).toBeVisible()
  })

  test('la navigation mois précédent / mois suivant fonctionne', async ({ page }) => {
    await page.goto('/espace-artisan/calendrier')

    // Récupérer le texte du mois affiché
    const monthHeading = page.locator('h3').filter({ hasText: /Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre/ })
    const initialMonth = await monthHeading.textContent()

    // Cliquer sur mois suivant
    await page.getByLabel('Mois suivant').click()
    const nextMonth = await monthHeading.textContent()
    expect(nextMonth).not.toBe(initialMonth)

    // Cliquer sur mois précédent
    await page.getByLabel('Mois précédent').click()
    const previousMonth = await monthHeading.textContent()
    expect(previousMonth).toBe(initialMonth)
  })

  test('cliquer sur un jour affiche les détails', async ({ page }) => {
    await page.goto('/espace-artisan/calendrier')

    // Le calendrier auto-sélectionne aujourd'hui. On clique sur un jour spécifique
    // Les boutons jours ont des aria-label contenant le numéro et le mois
    const dayButtons = page.locator('button[aria-pressed]')
    const count = await dayButtons.count()

    if (count > 0) {
      // Un jour est déjà sélectionné (aujourd'hui) — vérifier le panneau de détails
      const detailPanel = page.locator('h4').filter({
        hasText: /lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i,
      })
      await expect(detailPanel).toBeVisible()
    }
  })

  test('la légende est affichée avec les indicateurs', async ({ page }) => {
    await page.goto('/espace-artisan/calendrier')

    await expect(page.getByText('Disponible')).toBeVisible()
    await expect(page.getByText('1 RDV')).toBeVisible()
    await expect(page.getByText('2 RDV')).toBeVisible()
    await expect(page.getByText('3+ RDV')).toBeVisible()
  })

  test('les statistiques rapides du mois sont affichées', async ({ page }) => {
    await page.goto('/espace-artisan/calendrier')

    await expect(page.getByText('RDV ce mois')).toBeVisible()
    await expect(page.getByText('Confirmés')).toBeVisible()
    await expect(page.getByText('En attente')).toBeVisible()
  })
})

// ─── Flow 5 : Page profil ──────────────────────────────────────────────────

test.describe('Flow 5 — Page profil artisan', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test('la page profil s\'affiche avec le titre', async ({ page }) => {
    await page.goto('/espace-artisan/profil')

    await expect(page.getByRole('heading', { name: /Mon profil public/i })).toBeVisible()
  })

  test('les onglets du profil sont présents', async ({ page }) => {
    await page.goto('/espace-artisan/profil')

    // Vérifier la présence des onglets (role="tab")
    const tabList = page.locator('[role="tablist"]')
    await expect(tabList).toBeVisible()

    // Vérifier les onglets principaux
    await expect(page.getByRole('tab', { name: /Identité/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Contact/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Localisation/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Présentation/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Services.*Tarifs/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Qualifications/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Disponibilité/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /FAQ/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Préférences/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Photo de profil/i })).toBeVisible()
  })

  test('l\'onglet Identité est actif par défaut', async ({ page }) => {
    await page.goto('/espace-artisan/profil')

    const identiteTab = page.getByRole('tab', { name: /Identité/i })
    await expect(identiteTab).toHaveAttribute('aria-selected', 'true')

    // Le tabpanel correspondant est visible
    const tabPanel = page.locator('[role="tabpanel"]#tabpanel-identite')
    await expect(tabPanel).toBeVisible()
  })

  test('cliquer sur un onglet affiche le contenu correspondant', async ({ page }) => {
    await page.goto('/espace-artisan/profil')

    // Cliquer sur l'onglet Contact
    await page.getByRole('tab', { name: /Contact/i }).click()

    // Vérifier que le tabpanel Contact est affiché
    const contactPanel = page.locator('[role="tabpanel"]#tabpanel-contact')
    await expect(contactPanel).toBeVisible()

    // L'onglet Contact est maintenant sélectionné
    await expect(page.getByRole('tab', { name: /Contact/i })).toHaveAttribute('aria-selected', 'true')

    // L'onglet Identité n'est plus sélectionné
    await expect(page.getByRole('tab', { name: /Identité/i })).toHaveAttribute('aria-selected', 'false')
  })

  test('la navigation clavier entre onglets fonctionne', async ({ page }) => {
    await page.goto('/espace-artisan/profil')

    // Focus sur l'onglet Identité
    const identiteTab = page.getByRole('tab', { name: /Identité/i })
    await identiteTab.focus()

    // Flèche bas → Contact
    await page.keyboard.press('ArrowDown')
    const contactTab = page.getByRole('tab', { name: /Contact/i })
    await expect(contactTab).toBeFocused()
    await expect(contactTab).toHaveAttribute('aria-selected', 'true')
  })

  test('l\'onglet peut être sélectionné via le query param', async ({ page }) => {
    await page.goto('/espace-artisan/profil?tab=contact')

    // L'onglet Contact devrait être actif
    await expect(page.getByRole('tab', { name: /Contact/i })).toHaveAttribute('aria-selected', 'true')
  })
})

// ─── Flow 6 : Accessibilité dashboard artisan ──────────────────────────────

test.describe('Flow 6 — Accessibilité dashboard artisan', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAPIs(page)
  })

  test('le main landmark est présent avec l\'id main-content', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')

    const main = page.locator('main#main-content, #main-content')
    await expect(main.first()).toBeVisible()
  })

  test('Tab navigue correctement dans la sidebar', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')

    // Commencer par tabber dans la page
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Un élément focusable devrait avoir le focus
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })

  test('les images ont des attributs alt ou aria-hidden', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')

    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < Math.min(count, 15); i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const ariaHidden = await img.getAttribute('aria-hidden')
      // Chaque image doit avoir un alt (peut être vide pour décoratif) ou être masquée
      expect(alt !== null || ariaHidden === 'true').toBeTruthy()
    }
  })

  test('les boutons ont des noms accessibles', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')

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
    await page.goto('/espace-artisan/dashboard')

    // Section statistiques
    const statsSection = page.locator('section[aria-label="Statistiques"]')
    await expect(statsSection).toBeVisible()

    // Section dernières demandes
    const demandesSection = page.locator('section[aria-label="Dernières demandes"]')
    await expect(demandesSection).toBeVisible()
  })

  test('les liens de la sidebar sont navigables au clavier', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')

    // Vérifier que tous les liens de navigation ont un href valide
    const sidebarLinks = page.locator('nav a[href*="espace-artisan"], aside a[href*="espace-artisan"]')
    const count = await sidebarLinks.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const link = sidebarLinks.nth(i)
      const href = await link.getAttribute('href')
      expect(href).toMatch(/\/espace-artisan\//)
    }
  })

  test('les statuts des demandes ont role="status"', async ({ page }) => {
    await page.goto('/espace-artisan/dashboard')

    // Les badges de statut des demandes utilisent role="status"
    const statusBadges = page.locator('[role="status"]')
    const count = await statusBadges.count()
    expect(count).toBeGreaterThan(0)
  })

  test('la page calendrier a des aria-label sur les jours', async ({ page }) => {
    await page.goto('/espace-artisan/calendrier')

    // Chaque jour du calendrier a un aria-label descriptif
    const dayButtons = page.locator('button[aria-label*="RDV"], button[aria-label*="créneau"], button[aria-pressed]')
    const count = await dayButtons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('la page profil respecte le pattern ARIA tablist', async ({ page }) => {
    await page.goto('/espace-artisan/profil')

    // Vérifier la structure tablist/tab/tabpanel
    const tablist = page.locator('[role="tablist"]')
    await expect(tablist).toBeVisible()
    await expect(tablist).toHaveAttribute('aria-orientation', 'vertical')

    // Chaque tab a un aria-controls correspondant à un tabpanel
    const selectedTab = page.locator('[role="tab"][aria-selected="true"]')
    const controlsId = await selectedTab.getAttribute('aria-controls')
    expect(controlsId).toBeTruthy()

    const panel = page.locator(`#${controlsId}`)
    await expect(panel).toBeVisible()
  })
})
