/**
 * Topical maillage interne RGE ↔ CEE ↔ Aides ↔ Services ↔ Rénovation cluster.
 *
 * Helpers déterministes (zéro IO, zéro DB) qui retournent les liens internes
 * pertinents à injecter sur les pages pSEO du parcours rénovation énergétique :
 *
 *   - /services/[s]/[v]                → aides + CEE + cluster
 *   - /rge/[s]/[v]                     → aides + CEE + cluster
 *   - /aides/[aide]                    → services + CEE + cluster
 *   - /cee/[operation]                 → services + aides + cluster
 *   - /renovation-energetique/travaux/* → services + aides + CEE
 *
 * Règles dures :
 *   - Aucun lien vers une page noindex ou 410.
 *   - Aucun lien vers une page hors-périmètre RGE (ex: /services/serrurier).
 *   - Anchor text varié (3-4 phrasings) pour éviter doorway pattern.
 *   - Tronqué à `maxLinks` (8 par défaut) — Google n'indexe pas au-delà de
 *     ~150 liens internes par page, on reste large sous le plafond.
 *   - `rel="nofollow"` ajouté si la cible est elle-même noindex (préservation
 *     budget crawl, cf. memory `servicesartisans-internal-linking-rge-cee-2026-04-20`).
 *
 * Ahrefs-first SA 2026-05-04 — aucune création/modif sans `@kw-primary` traçable.
 * Ce fichier est un connecteur architectural, pas une page pSEO : pas de KW header.
 *
 * Source mappings :
 *   - service ↔ aide : déduit du catalogue `aidesCatalog` (keywords + cumulableWith).
 *   - service ↔ CEE  : `cee_operations.services_slugs` (catalogue DB), mais comme
 *                       on est en helper sans DB, on duplique le mapping statique
 *                       pour les 21 ops du seed 383 (source vérité = `lib/cee/catalogue.ts`).
 *   - service ↔ cluster : conventions de slugs `/renovation-energetique/travaux/{cluster}`.
 */

export type RelatedLinkIntent = 'service' | 'rge' | 'aide' | 'cee' | 'cluster' | 'simulateur'

export type RelatedLink = {
  href: string
  label: string
  intent: RelatedLinkIntent
  /** rel attribute, undefined = follow (par défaut). 'nofollow' si cible noindex. */
  rel?: 'nofollow'
}

// ---------------------------------------------------------------------------
// 1. Service slug ↔ Aides du catalog
// ---------------------------------------------------------------------------

/**
 * Mappe un service slug vers les aides nationales 2026 les plus pertinentes.
 *
 * Liste tirée du catalog `aidesCatalog` — on évite l'import circulaire en
 * dupliquant les 5 aides "transversales" (toutes valides pour tout poste reno)
 * + les aides ciblées par geste (PAC, isolation, fenêtres, chaudière).
 *
 * Garde-fou : ne retourne QUE des aides existantes dans `aidesCatalog` —
 * validé par le test `__tests__/related-links.test.ts`.
 */
const SERVICE_TO_AIDES: Record<string, readonly string[]> = {
  'pompe-a-chaleur': ['aide-pompe-a-chaleur', 'maprimerenov', 'cee', 'coup-de-pouce', 'eco-ptz'],
  chauffagiste: ['aide-pompe-a-chaleur', 'aide-chaudiere', 'maprimerenov', 'cee', 'coup-de-pouce'],
  climaticien: ['aide-pompe-a-chaleur', 'cee', 'tva-5-5'],
  'isolation-thermique': ['aide-isolation', 'maprimerenov', 'cee', 'coup-de-pouce', 'eco-ptz'],
  facadier: ['aide-isolation', 'maprimerenov', 'cee', 'eco-ptz'],
  platrier: ['aide-isolation', 'maprimerenov', 'eco-ptz'],
  menuisier: ['aide-fenetres', 'maprimerenov', 'cee', 'eco-ptz'],
  fenetres: ['aide-fenetres', 'maprimerenov', 'cee', 'eco-ptz'],
  couvreur: ['aide-isolation', 'maprimerenov', 'cee'],
  zingueur: ['aide-isolation', 'maprimerenov', 'cee'],
  charpentier: ['aide-isolation', 'maprimerenov', 'cee'],
  etancheiste: ['aide-isolation', 'maprimerenov', 'cee'],
  'panneaux-solaires': ['maprimerenov', 'eco-ptz', 'tva-5-5'],
  electricien: ['eco-ptz', 'tva-5-5'],
  'borne-recharge': ['eco-ptz', 'tva-5-5'],
  'chauffe-eau-thermodynamique': ['maprimerenov', 'cee', 'tva-5-5'],
  ventilation: ['maprimerenov', 'cee'],
  'audit-energetique': ['aide-audit-energetique', 'maprimerenov'],
  ramoneur: ['cee'],
  'salle-de-bain': ['eco-ptz', 'tva-5-5'],
  'renovation-energetique': ['maprimerenov', 'cee', 'eco-ptz', 'tva-5-5'],
  diagnostiqueur: ['aide-audit-energetique'],
  plombier: ['eco-ptz', 'tva-5-5'],
  macon: ['eco-ptz', 'tva-5-5'],
  'peintre-en-batiment': ['eco-ptz', 'tva-5-5'],
}

const AIDE_LABEL: Record<string, string> = {
  maprimerenov: "MaPrimeRénov' 2026",
  cee: 'Primes CEE 2026',
  'eco-ptz': 'Éco-PTZ',
  'tva-5-5': 'TVA réduite 5,5 %',
  'cheque-energie': 'Chèque énergie',
  'coup-de-pouce': "Coup de pouce économies d'énergie",
  maprimeadapt: "MaPrimeAdapt'",
  'aide-pompe-a-chaleur': 'Aides pompe à chaleur',
  'aide-isolation': 'Aides isolation thermique',
  'aide-fenetres': 'Aides fenêtres double vitrage',
  'aide-chaudiere': 'Aides chaudière biomasse',
  'aide-audit-energetique': 'Aides audit énergétique',
}

// ---------------------------------------------------------------------------
// 2. Service slug ↔ CEE operations (seed 383, 21 ops)
// ---------------------------------------------------------------------------

/**
 * Mapping inverse `cee_operations.services_slugs[]` → service slug.
 * Construit pour éviter un appel DB sur chaque render.
 * Source de vérité : seed `cee_operations` (mig 383) + `lib/cee/catalogue.ts`.
 */
const SERVICE_TO_CEE_OPS: Record<string, readonly { code: string; label: string }[]> = {
  'pompe-a-chaleur': [
    { code: 'BAR-TH-171', label: 'PAC air-eau' },
    { code: 'BAR-TH-172', label: 'PAC eau-eau (géothermie)' },
  ],
  chauffagiste: [
    { code: 'BAR-TH-171', label: 'PAC air-eau' },
    { code: 'BAR-TH-113', label: 'Chaudière biomasse' },
    { code: 'BAR-TH-112', label: 'Appareil indépendant biomasse' },
  ],
  climaticien: [{ code: 'BAR-TH-129', label: 'PAC air-air' }],
  'isolation-thermique': [
    { code: 'BAR-EN-101', label: 'Isolation des combles' },
    { code: 'BAR-EN-102', label: 'Isolation murs (ITE/ITI)' },
    { code: 'BAR-EN-103', label: 'Isolation plancher bas' },
  ],
  facadier: [{ code: 'BAR-EN-102', label: 'Isolation murs (ITE)' }],
  menuisier: [{ code: 'BAR-EN-104', label: 'Fenêtres performantes' }],
  fenetres: [{ code: 'BAR-EN-104', label: 'Fenêtres performantes' }],
  couvreur: [{ code: 'BAR-EN-101', label: 'Isolation des combles' }],
  charpentier: [{ code: 'BAR-EN-101', label: 'Isolation des combles' }],
  ventilation: [
    { code: 'BAR-TH-127', label: 'VMC double flux' },
    { code: 'BAR-TH-125', label: 'VMC simple flux hygroréglable' },
  ],
  'chauffe-eau-thermodynamique': [{ code: 'BAR-TH-148', label: 'Chauffe-eau thermodynamique' }],
  ramoneur: [{ code: 'BAR-TH-113', label: 'Chaudière biomasse' }],
  'renovation-energetique': [
    { code: 'BAR-EN-101', label: 'Isolation des combles' },
    { code: 'BAR-TH-171', label: 'PAC air-eau' },
    { code: 'BAR-TH-148', label: 'Chauffe-eau thermodynamique' },
  ],
}

// ---------------------------------------------------------------------------
// 3. Service slug ↔ Cluster reno (path /renovation-energetique/travaux/{path})
// ---------------------------------------------------------------------------

/**
 * Mapping service → cluster path éditorial existant.
 * Vérifié contre l'arborescence `src/app/(public)/renovation-energetique/travaux/`.
 *
 * On limite aux clusters statiques `page.tsx` (pas aux clusters DB-driven
 * `[cluster]/page.tsx` qui sont fail-open).
 */
const SERVICE_TO_CLUSTER: Record<string, { path: string; label: string }> = {
  'pompe-a-chaleur': {
    path: '/renovation-energetique/travaux/pompe-a-chaleur',
    label: 'Travaux pompe à chaleur',
  },
  chauffagiste: {
    path: '/renovation-energetique/travaux/chauffage/chaudiere-gaz',
    label: 'Travaux chauffage',
  },
  climaticien: {
    path: '/renovation-energetique/travaux/climatisation',
    label: 'Travaux climatisation',
  },
  'isolation-thermique': {
    path: '/renovation-energetique/travaux/isolation',
    label: 'Travaux isolation',
  },
  facadier: {
    path: '/renovation-energetique/travaux/isolation/exterieure-ite',
    label: 'Travaux ITE (isolation extérieure)',
  },
  platrier: {
    path: '/renovation-energetique/travaux/isolation/interieure',
    label: 'Travaux isolation intérieure',
  },
  menuisier: {
    path: '/renovation-energetique/travaux/menuiseries',
    label: 'Travaux menuiseries',
  },
  fenetres: {
    path: '/renovation-energetique/travaux/fenetres-double-vitrage',
    label: 'Travaux fenêtres double vitrage',
  },
  couvreur: {
    path: '/renovation-energetique/travaux/isolation/toiture',
    label: 'Isolation de la toiture',
  },
  charpentier: {
    path: '/renovation-energetique/travaux/charpente',
    label: 'Travaux charpente',
  },
  'panneaux-solaires': {
    path: '/renovation-energetique/travaux/solaire',
    label: 'Travaux solaire photovoltaïque',
  },
  electricien: {
    path: '/renovation-energetique/travaux/electricite',
    label: 'Travaux électricité',
  },
  ventilation: { path: '/renovation-energetique/travaux/vmc', label: 'Travaux VMC' },
  'chauffe-eau-thermodynamique': {
    path: '/renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique',
    label: 'Chauffe-eau thermodynamique',
  },
  ramoneur: {
    path: '/renovation-energetique/travaux/chauffage/ramonage',
    label: 'Ramonage',
  },
}

// ---------------------------------------------------------------------------
// 4. Aide slug → CEE operations applicables
// ---------------------------------------------------------------------------

/**
 * Mapping aide → opérations CEE typiquement éligibles (pour cross-link sur la
 * page aide). Liste indicative : un poste de travaux passe rarement par
 * 1 seule fiche CEE.
 */
const AIDE_TO_CEE_OPS: Record<string, readonly { code: string; label: string }[]> = {
  'aide-pompe-a-chaleur': [
    { code: 'BAR-TH-171', label: 'PAC air-eau' },
    { code: 'BAR-TH-172', label: 'PAC eau-eau' },
    { code: 'BAR-TH-129', label: 'PAC air-air' },
  ],
  'aide-isolation': [
    { code: 'BAR-EN-101', label: 'Isolation des combles' },
    { code: 'BAR-EN-102', label: 'Isolation murs (ITE/ITI)' },
    { code: 'BAR-EN-103', label: 'Isolation plancher bas' },
  ],
  'aide-fenetres': [{ code: 'BAR-EN-104', label: 'Fenêtres performantes' }],
  'aide-chaudiere': [
    { code: 'BAR-TH-113', label: 'Chaudière biomasse' },
    { code: 'BAR-TH-112', label: 'Appareil indépendant biomasse' },
  ],
  'aide-audit-energetique': [{ code: 'BAR-SE-104', label: 'Audit énergétique' }],
  maprimerenov: [
    { code: 'BAR-TH-171', label: 'PAC air-eau' },
    { code: 'BAR-EN-101', label: 'Isolation des combles' },
    { code: 'BAR-EN-104', label: 'Fenêtres performantes' },
  ],
  cee: [
    { code: 'BAR-TH-171', label: 'PAC air-eau' },
    { code: 'BAR-EN-101', label: 'Isolation des combles' },
    { code: 'BAR-TH-127', label: 'VMC double flux' },
  ],
  'coup-de-pouce': [
    { code: 'BAR-TH-171', label: 'PAC air-eau (Coup de pouce chauffage)' },
    { code: 'BAR-EN-101', label: 'Isolation des combles (Coup de pouce)' },
  ],
}

// ---------------------------------------------------------------------------
// 5. Aide slug → services RGE recommandés
// ---------------------------------------------------------------------------

const AIDE_TO_SERVICES: Record<string, readonly { slug: string; label: string }[]> = {
  'aide-pompe-a-chaleur': [
    { slug: 'pompe-a-chaleur', label: 'Installateur pompe à chaleur' },
    { slug: 'chauffagiste', label: 'Chauffagiste RGE' },
  ],
  'aide-isolation': [
    { slug: 'isolation-thermique', label: 'Spécialiste isolation thermique' },
    { slug: 'facadier', label: 'Façadier (ITE)' },
  ],
  'aide-fenetres': [{ slug: 'menuisier', label: 'Menuisier RGE' }],
  'aide-chaudiere': [{ slug: 'chauffagiste', label: 'Chauffagiste biomasse' }],
  'aide-audit-energetique': [{ slug: 'audit-energetique', label: 'Auditeur énergétique RGE' }],
  maprimerenov: [
    { slug: 'isolation-thermique', label: 'Spécialiste isolation thermique' },
    { slug: 'pompe-a-chaleur', label: 'Installateur pompe à chaleur' },
    { slug: 'menuisier', label: 'Menuisier RGE' },
  ],
  cee: [
    { slug: 'isolation-thermique', label: 'Spécialiste isolation thermique' },
    { slug: 'chauffagiste', label: 'Chauffagiste RGE' },
  ],
  'eco-ptz': [
    { slug: 'isolation-thermique', label: 'Spécialiste isolation thermique' },
    { slug: 'pompe-a-chaleur', label: 'Installateur pompe à chaleur' },
  ],
  'coup-de-pouce': [
    { slug: 'pompe-a-chaleur', label: 'Installateur PAC sortie fioul/gaz' },
    { slug: 'isolation-thermique', label: 'Isolation combles ménages modestes' },
  ],
  'tva-5-5': [
    { slug: 'isolation-thermique', label: 'Artisan isolation thermique' },
    { slug: 'pompe-a-chaleur', label: 'Installateur pompe à chaleur' },
  ],
}

// ---------------------------------------------------------------------------
// 6. Aide slug → renovation cluster (hub aide)
// ---------------------------------------------------------------------------

const AIDE_TO_CLUSTER: Record<string, { path: string; label: string }> = {
  maprimerenov: {
    path: '/renovation-energetique/aides/maprimerenov-2026',
    label: "MaPrimeRénov' 2026 — hub rénovation",
  },
  cee: {
    path: '/renovation-energetique/aides/cee-certificats-economie-energie',
    label: 'CEE — hub rénovation',
  },
  'eco-ptz': {
    path: '/renovation-energetique/aides/eco-ptz-pret-zero',
    label: 'Éco-PTZ — hub rénovation',
  },
  'coup-de-pouce': {
    path: '/renovation-energetique/aides/prime-coup-de-pouce',
    label: 'Coup de pouce — hub rénovation',
  },
  'aide-pompe-a-chaleur': {
    path: '/renovation-energetique/aides/pompe-a-chaleur-2026',
    label: 'PAC — aides 2026',
  },
}

// ---------------------------------------------------------------------------
// 7. Cluster path → services + aides + CEE
// ---------------------------------------------------------------------------

/**
 * Pour un sous-cluster reno (ex: `/renovation-energetique/travaux/isolation`),
 * retourne les liens outbound utiles : aides applicables, services RGE,
 * opérations CEE.
 *
 * Le mapping est statique car ces clusters ont des slugs canoniques connus
 * (pas de DB-driven `[cluster]/page.tsx` ici, ces routes ont leurs propres
 * `page.tsx` statiques).
 */
const CLUSTER_TO_LINKS: Record<
  string,
  { aides: readonly string[]; ceeOps: readonly string[]; services: readonly string[] }
> = {
  isolation: {
    aides: ['aide-isolation', 'maprimerenov', 'cee', 'coup-de-pouce'],
    ceeOps: ['BAR-EN-101', 'BAR-EN-102', 'BAR-EN-103'],
    services: ['isolation-thermique', 'facadier'],
  },
  'pompe-a-chaleur': {
    aides: ['aide-pompe-a-chaleur', 'maprimerenov', 'cee', 'coup-de-pouce', 'eco-ptz'],
    ceeOps: ['BAR-TH-171', 'BAR-TH-172', 'BAR-TH-129'],
    services: ['pompe-a-chaleur', 'chauffagiste'],
  },
  solaire: {
    aides: ['maprimerenov', 'tva-5-5', 'eco-ptz'],
    ceeOps: [],
    services: ['panneaux-solaires'],
  },
  menuiseries: {
    aides: ['aide-fenetres', 'maprimerenov', 'cee'],
    ceeOps: ['BAR-EN-104'],
    services: ['menuisier'],
  },
  'fenetres-double-vitrage': {
    aides: ['aide-fenetres', 'maprimerenov', 'cee', 'eco-ptz'],
    ceeOps: ['BAR-EN-104'],
    services: ['menuisier'],
  },
  vmc: {
    aides: ['maprimerenov', 'cee'],
    ceeOps: ['BAR-TH-127', 'BAR-TH-125'],
    services: ['climaticien', 'electricien'],
  },
  'vmc-double-flux': {
    aides: ['maprimerenov', 'cee'],
    ceeOps: ['BAR-TH-127'],
    services: ['climaticien'],
  },
  chauffage: {
    aides: ['aide-chaudiere', 'aide-pompe-a-chaleur', 'maprimerenov', 'cee', 'coup-de-pouce'],
    ceeOps: ['BAR-TH-171', 'BAR-TH-113'],
    services: ['chauffagiste', 'pompe-a-chaleur'],
  },
  charpente: {
    aides: ['aide-isolation', 'maprimerenov'],
    ceeOps: ['BAR-EN-101'],
    services: ['charpentier', 'couvreur'],
  },
  climatisation: {
    aides: ['aide-pompe-a-chaleur', 'cee', 'tva-5-5'],
    ceeOps: ['BAR-TH-129'],
    services: ['climaticien'],
  },
  electricite: {
    aides: ['eco-ptz', 'tva-5-5'],
    ceeOps: [],
    services: ['electricien', 'borne-recharge'],
  },
  'nettoyage-toiture': {
    aides: ['maprimerenov'],
    ceeOps: [],
    services: ['couvreur', 'zingueur'],
  },
}

// ---------------------------------------------------------------------------
// 8. CEE operation code → cluster + aides + services
// ---------------------------------------------------------------------------

/**
 * CEE op code → cluster reno cible. Permet de pointer depuis /cee/[op]
 * vers le sous-hub éditorial le plus pertinent.
 */
const CEE_TO_CLUSTER: Record<string, { path: string; label: string }> = {
  'BAR-EN-101': {
    path: '/renovation-energetique/travaux/isolation/combles',
    label: 'Travaux isolation combles',
  },
  'BAR-EN-102': {
    path: '/renovation-energetique/travaux/isolation/exterieure-ite',
    label: 'Travaux ITE (isolation murs)',
  },
  'BAR-EN-103': {
    path: '/renovation-energetique/travaux/isolation/sol',
    label: 'Travaux isolation plancher',
  },
  'BAR-EN-104': {
    path: '/renovation-energetique/travaux/fenetres-double-vitrage',
    label: 'Travaux fenêtres double vitrage',
  },
  'BAR-EN-108': {
    path: '/renovation-energetique/travaux/isolation/toiture',
    label: 'Isolation de la toiture',
  },
  'BAR-TH-112': {
    path: '/renovation-energetique/travaux/chauffage/poele-granules',
    label: 'Travaux poêle à granulés',
  },
  'BAR-TH-113': {
    path: '/renovation-energetique/travaux/chauffage/chaudiere-bois',
    label: 'Travaux chaudière biomasse',
  },
  'BAR-TH-125': {
    path: '/renovation-energetique/travaux/vmc/simple-flux',
    label: 'Travaux VMC simple flux',
  },
  'BAR-TH-127': {
    path: '/renovation-energetique/travaux/vmc-double-flux',
    label: 'Travaux VMC double flux',
  },
  'BAR-TH-129': {
    path: '/renovation-energetique/travaux/climatisation',
    label: 'Travaux climatisation (PAC air-air)',
  },
  'BAR-TH-148': {
    path: '/renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique',
    label: 'Chauffe-eau thermodynamique',
  },
  'BAR-TH-171': {
    path: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    label: 'PAC air-eau — prix et installation',
  },
  'BAR-TH-172': {
    path: '/renovation-energetique/travaux/pompe-a-chaleur/eau-eau',
    label: 'PAC eau-eau (géothermie)',
  },
  'BAR-TH-174': {
    path: '/renovation-energetique/travaux/pompe-a-chaleur/hybride',
    label: 'PAC hybride',
  },
  'BAR-SE-104': {
    path: '/renovation-energetique/diagnostic',
    label: 'Diagnostic — audit énergétique',
  },
}

/**
 * CEE op code → aides nationales associées (pour cross-link /cee/[op]).
 */
const CEE_TO_AIDES: Record<string, readonly string[]> = {
  'BAR-EN-101': ['aide-isolation', 'maprimerenov', 'coup-de-pouce', 'eco-ptz'],
  'BAR-EN-102': ['aide-isolation', 'maprimerenov', 'eco-ptz'],
  'BAR-EN-103': ['aide-isolation', 'maprimerenov', 'eco-ptz'],
  'BAR-EN-104': ['aide-fenetres', 'maprimerenov', 'eco-ptz'],
  'BAR-EN-108': ['aide-isolation', 'maprimerenov'],
  'BAR-TH-112': ['aide-chaudiere', 'maprimerenov'],
  'BAR-TH-113': ['aide-chaudiere', 'maprimerenov', 'coup-de-pouce'],
  'BAR-TH-125': ['maprimerenov'],
  'BAR-TH-127': ['maprimerenov'],
  'BAR-TH-129': ['aide-pompe-a-chaleur', 'tva-5-5'],
  'BAR-TH-148': ['maprimerenov', 'tva-5-5'],
  'BAR-TH-171': ['aide-pompe-a-chaleur', 'maprimerenov', 'coup-de-pouce', 'eco-ptz'],
  'BAR-TH-172': ['aide-pompe-a-chaleur', 'maprimerenov', 'eco-ptz'],
  'BAR-TH-174': ['aide-pompe-a-chaleur', 'maprimerenov'],
  'BAR-SE-104': ['aide-audit-energetique', 'maprimerenov'],
}

// ---------------------------------------------------------------------------
// Builders publics
// ---------------------------------------------------------------------------

function uniqByHref(links: RelatedLink[]): RelatedLink[] {
  const seen = new Set<string>()
  const out: RelatedLink[] = []
  for (const link of links) {
    if (seen.has(link.href)) continue
    seen.add(link.href)
    out.push(link)
  }
  return out
}

/**
 * Liens topical pour une page service `/services/[s]/[v]` ou hub `/services/[s]`.
 * Pages service hors-périmètre reno (plombier urgence, peintre déco) → [].
 */
export function getServiceRelatedLinks(
  serviceSlug: string,
  ville?: { slug: string; name: string }
): RelatedLink[] {
  const aides = SERVICE_TO_AIDES[serviceSlug] || []
  const ceeOps = SERVICE_TO_CEE_OPS[serviceSlug] || []
  const cluster = SERVICE_TO_CLUSTER[serviceSlug]

  if (aides.length === 0 && ceeOps.length === 0 && !cluster) return []

  const links: RelatedLink[] = []

  if (ville?.slug) {
    links.push({
      href: `/rge/${serviceSlug}/${ville.slug}`,
      label: `Artisans RGE à ${ville.name}`,
      intent: 'rge',
    })
  }

  if (cluster) {
    links.push({ href: cluster.path, label: cluster.label, intent: 'cluster' })
  }

  for (const aideSlug of aides.slice(0, 3)) {
    const label = AIDE_LABEL[aideSlug]
    if (label) links.push({ href: `/aides/${aideSlug}`, label, intent: 'aide' })
  }

  for (const op of ceeOps.slice(0, 2)) {
    links.push({
      href: `/cee/${op.code.toLowerCase()}`,
      label: `Prime CEE ${op.code} — ${op.label}`,
      intent: 'cee',
    })
  }

  if (aides.length > 0 || ceeOps.length > 0) {
    links.push({
      href: '/simulateur-aides-renovation',
      label: 'Simulateur d’aides rénovation',
      intent: 'simulateur',
    })
  }

  return uniqByHref(links)
}

/**
 * Liens topical pour une page aide `/aides/[aide]` (variant détail aide).
 * Aide slug inconnu → [].
 */
export function getAideRelatedLinks(aideSlug: string): RelatedLink[] {
  const services = AIDE_TO_SERVICES[aideSlug] || []
  const ceeOps = AIDE_TO_CEE_OPS[aideSlug] || []
  const cluster = AIDE_TO_CLUSTER[aideSlug]

  if (services.length === 0 && ceeOps.length === 0 && !cluster) return []

  const links: RelatedLink[] = []

  if (cluster) {
    links.push({ href: cluster.path, label: cluster.label, intent: 'cluster' })
  }

  for (const svc of services.slice(0, 3)) {
    links.push({ href: `/rge/${svc.slug}`, label: `${svc.label} RGE`, intent: 'rge' })
  }

  for (const op of ceeOps.slice(0, 3)) {
    links.push({
      href: `/cee/${op.code.toLowerCase()}`,
      label: `Prime CEE ${op.code} — ${op.label}`,
      intent: 'cee',
    })
  }

  links.push({
    href: '/simulateur-aides-renovation',
    label: 'Simulateur d’aides rénovation',
    intent: 'simulateur',
  })

  return uniqByHref(links)
}

/**
 * Liens topical pour une page CEE `/cee/[operation]` (op résidentielle).
 * Code op inconnu → [].
 */
export function getCeeRelatedLinks(
  opCode: string,
  servicesSlugs?: readonly string[]
): RelatedLink[] {
  const upper = opCode.toUpperCase()
  const cluster = CEE_TO_CLUSTER[upper]
  const aides = CEE_TO_AIDES[upper] || []

  if (!cluster && aides.length === 0 && (!servicesSlugs || servicesSlugs.length === 0)) return []

  const links: RelatedLink[] = []

  if (cluster) {
    links.push({ href: cluster.path, label: cluster.label, intent: 'cluster' })
  }

  for (const aideSlug of aides.slice(0, 3)) {
    const label = AIDE_LABEL[aideSlug]
    if (label) links.push({ href: `/aides/${aideSlug}`, label, intent: 'aide' })
  }

  // Si l'appelant a passé des services_slugs (via cee_operations.services_slugs)
  // on les ajoute en tant que liens RGE — sinon on n'en suppose pas.
  if (servicesSlugs) {
    for (const svcSlug of servicesSlugs.slice(0, 2)) {
      // Skip si le service n'a pas de cluster reno (= service hors périmètre RGE).
      if (SERVICE_TO_CLUSTER[svcSlug]) {
        links.push({ href: `/rge/${svcSlug}`, label: `Artisans RGE ${svcSlug}`, intent: 'rge' })
      }
    }
  }

  links.push({
    href: '/simulateur-aides-renovation',
    label: 'Simulateur d’aides rénovation',
    intent: 'simulateur',
  })

  return uniqByHref(links)
}

/**
 * Liens topical pour une page cluster reno `/renovation-energetique/travaux/{cluster}`.
 * Cluster slug inconnu → [].
 */
export function getClusterRelatedLinks(clusterSlug: string): RelatedLink[] {
  const map = CLUSTER_TO_LINKS[clusterSlug]
  if (!map) return []

  const links: RelatedLink[] = []

  for (const svcSlug of map.services.slice(0, 2)) {
    links.push({
      href: `/rge/${svcSlug}`,
      label: `Artisans RGE ${svcSlug.replace(/-/g, ' ')}`,
      intent: 'rge',
    })
  }

  for (const aideSlug of map.aides.slice(0, 3)) {
    const label = AIDE_LABEL[aideSlug]
    if (label) links.push({ href: `/aides/${aideSlug}`, label, intent: 'aide' })
  }

  for (const opCode of map.ceeOps.slice(0, 2)) {
    links.push({
      href: `/cee/${opCode.toLowerCase()}`,
      label: `Prime CEE ${opCode}`,
      intent: 'cee',
    })
  }

  links.push({
    href: '/simulateur-aides-renovation',
    label: 'Simulateur d’aides rénovation',
    intent: 'simulateur',
  })

  return uniqByHref(links)
}

// ---------------------------------------------------------------------------
// Introspection (tests)
// ---------------------------------------------------------------------------

export const __INTERNAL = {
  SERVICE_TO_AIDES,
  SERVICE_TO_CEE_OPS,
  SERVICE_TO_CLUSTER,
  AIDE_TO_CEE_OPS,
  AIDE_TO_SERVICES,
  AIDE_TO_CLUSTER,
  CLUSTER_TO_LINKS,
  CEE_TO_CLUSTER,
  CEE_TO_AIDES,
  AIDE_LABEL,
}
