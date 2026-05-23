/**
 * Carte du cluster topique "rénovation énergétique" — source de vérité pour le
 * maillage interne dense (signal d'autorité topique). Chaque page reno linke
 * ses sœurs de section + les piliers des autres sections + les hubs croisés
 * (/aides, /rge, /barometre). Câblé une seule fois via le layout reno, donc
 * couvre ~80 pages sans édition page par page.
 *
 * @rule Ahrefs-first SA 2026-05-04 — pages reno existantes, primaryKw indicatif.
 */

const ROOT = '/renovation-energetique'

export type ClusterPage = { path: string; label: string }

export type ClusterSection = {
  slug: string
  label: string
  /** Page pilier de la section (reçoit + distribue le jus). */
  pillar: ClusterPage
  pages: ClusterPage[]
}

/** Pilier principal du cluster (hub rénovation énergétique). */
export const RENO_PILLAR: ClusterPage = { path: ROOT, label: 'Rénovation énergétique' }

/** Hubs croisés (autorité partagée hors arbre /renovation-energetique). */
export const RENO_CROSS_LINKS: ClusterPage[] = [
  { path: '/aides', label: 'Aides à la rénovation 2026' },
  { path: '/rge', label: 'Artisans RGE certifiés' },
  { path: '/barometre/renovation-energetique-2026', label: 'Baromètre rénovation 2026' },
]

export const RENO_SECTIONS: ClusterSection[] = [
  {
    slug: 'chauffage',
    label: 'Chauffage',
    pillar: { path: `${ROOT}/travaux/chauffage`, label: 'Chauffage : guide complet' },
    pages: [
      {
        path: `${ROOT}/travaux/chauffage/chaudiere-condensation`,
        label: 'Chaudière à condensation',
      },
      { path: `${ROOT}/travaux/chauffage/chaudiere-gaz`, label: 'Chaudière gaz' },
      { path: `${ROOT}/travaux/chauffage/chaudiere-granules`, label: 'Chaudière à granulés' },
      { path: `${ROOT}/travaux/chauffage/chaudiere-bois`, label: 'Chaudière bois' },
      { path: `${ROOT}/travaux/chauffage/poele-granules`, label: 'Poêle à granulés' },
      {
        path: `${ROOT}/travaux/chauffage/chauffe-eau-thermodynamique`,
        label: 'Chauffe-eau thermodynamique',
      },
      { path: `${ROOT}/travaux/chauffage/ramonage`, label: 'Ramonage' },
      { path: `${ROOT}/travaux/chauffage/tubage-cheminee`, label: 'Tubage de cheminée' },
    ],
  },
  {
    slug: 'pompe-a-chaleur',
    label: 'Pompe à chaleur',
    pillar: { path: `${ROOT}/travaux/pompe-a-chaleur`, label: 'Pompe à chaleur : guide' },
    pages: [
      { path: `${ROOT}/travaux/pompe-a-chaleur/fonctionnement`, label: 'Fonctionnement PAC' },
      { path: `${ROOT}/travaux/pompe-a-chaleur/installation`, label: 'Installation PAC' },
      { path: `${ROOT}/travaux/pompe-a-chaleur/puissance`, label: 'Puissance PAC' },
      { path: `${ROOT}/travaux/pompe-a-chaleur/geothermie`, label: 'PAC géothermique' },
      { path: `${ROOT}/travaux/pompe-a-chaleur/hybride`, label: 'PAC hybride' },
      { path: `${ROOT}/travaux/pompe-a-chaleur/marques/daikin`, label: 'PAC Daikin' },
      { path: `${ROOT}/travaux/pompe-a-chaleur/marques/mitsubishi`, label: 'PAC Mitsubishi' },
    ],
  },
  {
    slug: 'solaire',
    label: 'Solaire',
    pillar: { path: `${ROOT}/travaux/solaire`, label: 'Panneaux solaires : guide' },
    pages: [
      { path: `${ROOT}/travaux/solaire/prix`, label: 'Prix panneaux solaires' },
      { path: `${ROOT}/travaux/solaire/installation`, label: 'Installation solaire' },
      { path: `${ROOT}/travaux/solaire/autoconsommation`, label: 'Autoconsommation' },
      { path: `${ROOT}/travaux/solaire/rendement`, label: 'Rendement solaire' },
      { path: `${ROOT}/travaux/solaire/dimension`, label: 'Dimensionnement' },
      { path: `${ROOT}/travaux/solaire/thermique`, label: 'Solaire thermique' },
      { path: `${ROOT}/travaux/solaire/hybride`, label: 'Panneau hybride' },
      { path: `${ROOT}/travaux/solaire/nettoyage`, label: 'Nettoyage panneaux' },
      { path: `${ROOT}/travaux/solaire/panneau-1000w`, label: 'Panneau 1000W' },
      { path: `${ROOT}/travaux/solaire/panneau-piscine`, label: 'Solaire piscine' },
      { path: `${ROOT}/travaux/solaire/panneau-souple`, label: 'Panneau souple' },
    ],
  },
  {
    slug: 'vmc',
    label: 'VMC & ventilation',
    pillar: { path: `${ROOT}/travaux/vmc`, label: 'VMC : guide complet' },
    pages: [
      { path: `${ROOT}/travaux/vmc/simple-flux`, label: 'VMC simple flux' },
      { path: `${ROOT}/travaux/vmc-double-flux`, label: 'VMC double flux' },
      { path: `${ROOT}/travaux/vmc/double-flux-thermodynamique`, label: 'VMC double flux thermo' },
      { path: `${ROOT}/travaux/vmc/hygroreglable`, label: 'VMC hygroréglable' },
      { path: `${ROOT}/travaux/vmc/installation`, label: 'Installation VMC' },
      { path: `${ROOT}/travaux/vmc/branchement-pose`, label: 'Branchement VMC' },
      { path: `${ROOT}/travaux/vmc/entretien`, label: 'Entretien VMC' },
      { path: `${ROOT}/travaux/vmc/salle-de-bain`, label: 'VMC salle de bain' },
      { path: `${ROOT}/travaux/vmi`, label: 'VMI' },
    ],
  },
  {
    slug: 'isolation',
    label: 'Isolation',
    pillar: { path: `${ROOT}/travaux/isolation`, label: 'Isolation : guide complet' },
    pages: [
      { path: `${ROOT}/travaux/isolation/combles`, label: 'Isolation des combles' },
      { path: `${ROOT}/travaux/isolation/exterieure-ite`, label: 'Isolation extérieure (ITE)' },
      { path: `${ROOT}/travaux/isolation/interieure`, label: 'Isolation intérieure' },
      { path: `${ROOT}/travaux/isolation/toiture`, label: 'Isolation toiture' },
      { path: `${ROOT}/travaux/isolation/sol`, label: 'Isolation des sols' },
      { path: `${ROOT}/travaux/isolation/phonique`, label: 'Isolation phonique' },
      { path: `${ROOT}/travaux/isolation/prix`, label: 'Prix isolation' },
      { path: `${ROOT}/travaux/isolation/installation`, label: 'Pose isolation' },
    ],
  },
  {
    slug: 'ballon-thermodynamique',
    label: 'Ballon thermodynamique',
    pillar: { path: `${ROOT}/travaux/ballon-thermodynamique`, label: 'Ballon thermodynamique' },
    pages: [
      { path: `${ROOT}/travaux/ballon-thermodynamique/prix`, label: 'Prix ballon thermo' },
      {
        path: `${ROOT}/travaux/ballon-thermodynamique/installation`,
        label: 'Installation ballon thermo',
      },
    ],
  },
  {
    slug: 'menuiseries',
    label: 'Menuiseries & fenêtres',
    pillar: { path: `${ROOT}/travaux/menuiseries`, label: 'Menuiseries : guide' },
    pages: [
      { path: `${ROOT}/travaux/fenetres-double-vitrage`, label: 'Fenêtres double vitrage' },
      { path: `${ROOT}/travaux/menuiseries/aluminium`, label: 'Menuiseries aluminium' },
      { path: `${ROOT}/travaux/menuiseries/fenetre-de-toit`, label: 'Fenêtre de toit' },
    ],
  },
  {
    slug: 'diagnostic',
    label: 'Diagnostic & DPE',
    pillar: { path: `${ROOT}/diagnostic`, label: 'Diagnostic énergétique' },
    pages: [
      { path: `${ROOT}/diagnostic/dpe`, label: 'DPE' },
      { path: `${ROOT}/diagnostic/dpe/classes`, label: 'Classes DPE A à G' },
      { path: `${ROOT}/diagnostic/dpe/prix`, label: 'Prix DPE' },
      { path: `${ROOT}/diagnostic/dpe/validite`, label: 'Validité DPE' },
      { path: `${ROOT}/diagnostic/dpe/location`, label: 'DPE location' },
      { path: `${ROOT}/diagnostic/audit-energetique`, label: 'Audit énergétique' },
      { path: `${ROOT}/diagnostic/audit-energetique/prix`, label: 'Prix audit énergétique' },
      { path: `${ROOT}/diagnostic/thermographie`, label: 'Thermographie' },
    ],
  },
  {
    slug: 'passoires-thermiques',
    label: 'Passoires thermiques',
    pillar: { path: `${ROOT}/passoires-thermiques`, label: 'Passoires thermiques' },
    pages: [
      {
        path: `${ROOT}/passoires-thermiques/calendrier-2025-2028-2034`,
        label: 'Calendrier interdiction',
      },
      {
        path: `${ROOT}/passoires-thermiques/interdiction-location-g-f`,
        label: 'Interdiction location F/G',
      },
    ],
  },
  {
    slug: 'aides',
    label: 'Aides & financement',
    pillar: { path: `${ROOT}/aides`, label: 'Aides rénovation : guide' },
    pages: [
      { path: `${ROOT}/aides/maprimerenov-2026`, label: "MaPrimeRénov' 2026" },
      { path: `${ROOT}/aides/cee-certificats-economie-energie`, label: 'CEE' },
      { path: `${ROOT}/aides/eco-ptz-pret-zero`, label: 'Éco-PTZ' },
      { path: `${ROOT}/aides/prime-coup-de-pouce`, label: 'Coup de pouce' },
      { path: `${ROOT}/aides/prime-energie`, label: 'Prime énergie' },
      { path: `${ROOT}/aides/pompe-a-chaleur-2026`, label: 'Aides PAC' },
      { path: `${ROOT}/aides/panneau-solaire-2026`, label: 'Aides solaire' },
    ],
  },
]

/**
 * Trouve la section qui contient le pathname courant (match par préfixe le plus
 * long : pilier ou page de section). Retourne null pour le hub racine.
 */
export function findRenoSection(pathname: string): ClusterSection | null {
  let best: { section: ClusterSection; len: number } | null = null
  for (const section of RENO_SECTIONS) {
    const candidates = [section.pillar.path, ...section.pages.map((p) => p.path)]
    for (const path of candidates) {
      if (
        (pathname === path || pathname.startsWith(path + '/')) &&
        (!best || path.length > best.len)
      ) {
        best = { section, len: path.length }
      }
    }
  }
  return best?.section ?? null
}

/** Piliers de toutes les sections — pour le maillage transversal. */
export function getSectionPillars(): ClusterPage[] {
  return RENO_SECTIONS.map((s) => s.pillar)
}
