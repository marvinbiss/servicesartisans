// Navigation data - shared between server and client components

// ---------------------------------------------------------------------------
// SERVICE_WEIGHT — gravity hubs receive more internal links sitewide
// Higher weight = more prominent placement in internal link lists.
// Default weight for unlisted services: 1
// ---------------------------------------------------------------------------

export const SERVICE_WEIGHT: Record<string, number> = {
  plombier: 10,
  electricien: 9,
  serrurier: 8,
  chauffagiste: 8,
  'peintre-en-batiment': 6,
  couvreur: 5,
  macon: 5,
  menuisier: 4,
  carreleur: 3,
  climaticien: 3,
  cuisiniste: 2,
  vitrier: 2,
}

export function getServiceWeight(slug: string): number {
  return SERVICE_WEIGHT[slug] ?? 1
}

export const popularServices = [
  { name: 'Plombier', slug: 'plombier', icon: 'Wrench' },
  { name: 'Électricien', slug: 'electricien', icon: 'Zap' },
  { name: 'Serrurier', slug: 'serrurier', icon: 'Key' },
  { name: 'Chauffagiste', slug: 'chauffagiste', icon: 'Flame' },
  { name: 'Peintre', slug: 'peintre-en-batiment', icon: 'PaintBucket' },
  { name: 'Menuisier', slug: 'menuisier', icon: 'Hammer' },
  { name: 'Maçon', slug: 'macon', icon: 'HardHat' },
  { name: 'Pompe à chaleur', slug: 'pompe-a-chaleur', icon: 'Thermometer' },
]

export const popularCities = [
  { name: 'Paris', slug: 'paris', department: '75' },
  { name: 'Marseille', slug: 'marseille', department: '13' },
  { name: 'Lyon', slug: 'lyon', department: '69' },
  { name: 'Toulouse', slug: 'toulouse', department: '31' },
  { name: 'Nantes', slug: 'nantes', department: '44' },
  { name: 'Bordeaux', slug: 'bordeaux', department: '33' },
]

/**
 * Cross-link suggestions entre services. Pivot RGE 2026-05-01 :
 * 16 métiers Tier C niche supprimés (solier, terrassier, métallier, ferronnier,
 * poseur-de-parquet, miroitier, storiste, architecte-interieur, decorateur,
 * domoticien, pisciniste, antenniste, ascensoriste, geometre, desinsectisation,
 * deratisation).
 *
 * Pivot pure-play BTP énergétique 2026-05-02 : 5 métiers hors thèse retirés
 * (jardinier, paysagiste, nettoyage, alarme-securite, demenageur). Toutes les
 * références ont été retirées des arrays sibling et des entrées sources.
 */
export const relatedServices: Record<string, string[]> = {
  plombier: ['chauffagiste', 'salle-de-bain', 'cuisiniste', 'climaticien', 'pompe-a-chaleur'],
  electricien: ['borne-recharge', 'panneaux-solaires', 'climaticien'],
  serrurier: ['vitrier', 'menuisier'],
  chauffagiste: ['plombier', 'climaticien', 'pompe-a-chaleur', 'ramoneur', 'isolation-thermique'],
  'peintre-en-batiment': ['facadier', 'platrier', 'carreleur', 'menuisier'],
  menuisier: ['charpentier', 'cuisiniste', 'salle-de-bain', 'vitrier'],
  macon: ['charpentier', 'couvreur', 'facadier', 'etancheiste'],
  carreleur: ['salle-de-bain', 'peintre-en-batiment', 'platrier'],
  couvreur: ['charpentier', 'zingueur', 'etancheiste', 'facadier', 'ramoneur'],
  climaticien: [
    'chauffagiste',
    'pompe-a-chaleur',
    'plombier',
    'isolation-thermique',
    'electricien',
  ],
  vitrier: ['menuisier', 'serrurier'],
  cuisiniste: ['plombier', 'electricien', 'salle-de-bain', 'carreleur'],
  charpentier: ['couvreur', 'menuisier', 'macon', 'zingueur'],
  zingueur: ['couvreur', 'charpentier', 'etancheiste', 'facadier', 'plombier'],
  etancheiste: ['couvreur', 'facadier', 'zingueur', 'macon', 'isolation-thermique'],
  facadier: ['peintre-en-batiment', 'etancheiste', 'macon', 'isolation-thermique'],
  platrier: ['peintre-en-batiment', 'carreleur', 'isolation-thermique'],
  'salle-de-bain': ['plombier', 'carreleur', 'electricien', 'cuisiniste'],
  'pompe-a-chaleur': [
    'chauffagiste',
    'climaticien',
    'plombier',
    'isolation-thermique',
    'panneaux-solaires',
  ],
  'panneaux-solaires': [
    'electricien',
    'pompe-a-chaleur',
    'borne-recharge',
    'couvreur',
    'renovation-energetique',
  ],
  'isolation-thermique': [
    'facadier',
    'renovation-energetique',
    'platrier',
    'couvreur',
    'climaticien',
  ],
  'renovation-energetique': [
    'isolation-thermique',
    'pompe-a-chaleur',
    'panneaux-solaires',
    'chauffagiste',
    'diagnostiqueur',
  ],
  'borne-recharge': ['electricien', 'panneaux-solaires'],
  ramoneur: ['chauffagiste', 'couvreur', 'charpentier', 'diagnostiqueur'],
  diagnostiqueur: ['renovation-energetique', 'electricien', 'ramoneur', 'isolation-thermique'],
}

export const popularRegions = [
  { name: 'Île-de-France', slug: 'ile-de-france' },
  { name: 'Auvergne-Rhône-Alpes', slug: 'auvergne-rhone-alpes' },
  { name: "Provence-Alpes-Côte d'Azur", slug: 'provence-alpes-cote-d-azur' },
  { name: 'Occitanie', slug: 'occitanie' },
  { name: 'Nouvelle-Aquitaine', slug: 'nouvelle-aquitaine' },
]
