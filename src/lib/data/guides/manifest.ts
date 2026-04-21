/**
 * Guide manifest — auto-derived from directory names under src/app/(public)/guides/.
 *
 * Each guide is tagged by topic clusters inferred from slug keywords so that
 * GuideSeeAlso can suggest 5-6 related guides without maintaining a handwritten
 * cross-link table.
 *
 * Priority order when multiple topics match a slug: first hit in TOPIC_KEYWORDS wins.
 */

export type GuideTopic =
  | 'renovation-energetique'
  | 'rge-cee'
  | 'isolation'
  | 'chauffage'
  | 'plomberie'
  | 'electricite'
  | 'toiture'
  | 'facade'
  | 'menuiserie'
  | 'amenagement'
  | 'devis-artisan'
  | 'administratif-legal'
  | 'divers'

const TOPIC_KEYWORDS: Array<{ topic: GuideTopic; match: (slug: string) => boolean }> = [
  {
    topic: 'rge-cee',
    match: (s) =>
      /(^|-)(rge|cee|maprimerenov|eco-ptz|prime-renov|qualibat|qualipv|qualifelec|qualisol|qualipac|certibat)(-|$)/.test(
        s
      ),
  },
  {
    topic: 'isolation',
    match: (s) => /(^|-)(isolation|combles|ite|passoire|dpe)(-|$)/.test(s),
  },
  {
    topic: 'chauffage',
    match: (s) =>
      /(^|-)(chaudiere|chauffage|pompe-a-chaleur|pac|climatisation|chauffe-eau|radiateur|poele|granule|fioul|gaz|thermodynamique|condensation|climaticien)(-|$)/.test(
        s
      ),
  },
  {
    topic: 'plomberie',
    match: (s) =>
      /(^|-)(plomberie|plombier|fuite|eau|adoucisseur|assainissement|fosse|wc|sanibroyeur|chauffe-eau)(-|$)/.test(
        s
      ),
  },
  {
    topic: 'electricite',
    match: (s) =>
      /(^|-)(electricien|electrique|irve|borne-recharge|domotique|alarme|tableau|norme-nf-c)(-|$)/.test(
        s
      ),
  },
  {
    topic: 'toiture',
    match: (s) => /(^|-)(toiture|couvreur|zingueur|tuile|ardoise)(-|$)/.test(s),
  },
  {
    topic: 'facade',
    match: (s) => /(^|-)(facade|ravalement|crepi|enduit|peintre|peinture)(-|$)/.test(s),
  },
  {
    topic: 'menuiserie',
    match: (s) =>
      /(^|-)(menuisier|fenetre|double-vitrage|porte|vitrier|volet|store|verriere|parquet)(-|$)/.test(
        s
      ),
  },
  {
    topic: 'amenagement',
    match: (s) =>
      /(^|-)(amenagement|extension|combles|garage|veranda|terrasse|cuisine|salle-de-bain|cloison|placo|carrelage|platre|gros-oeuvre|macon|carreleur)(-|$)/.test(
        s
      ),
  },
  {
    topic: 'devis-artisan',
    match: (s) => /(^|-)(devis|artisan|comparer|chantier|acompte|facture)(-|$)/.test(s),
  },
  {
    topic: 'administratif-legal',
    match: (s) =>
      /(^|-)(assurance|recours|garantie|permis|declaration|reglementation|obligation|norme|legal)(-|$)/.test(
        s
      ),
  },
  {
    topic: 'renovation-energetique',
    match: (s) =>
      /(^|-)(renovation-energetique|audit-energetique|aides-renovation|passoire-energetique|ptz|aide-|budget-renovation)(-|$)/.test(
        s
      ),
  },
]

export function guideTopicFor(slug: string): GuideTopic {
  for (const { topic, match } of TOPIC_KEYWORDS) {
    if (match(slug)) return topic
  }
  return 'divers'
}

export function humanizeSlug(slug: string): string {
  const cleaned = slug
    .replace(/-/g, ' ')
    .replace(/\b(\w)/g, (c) => c.toUpperCase())
    .replace(/\bRge\b/g, 'RGE')
    .replace(/\bCee\b/g, 'CEE')
    .replace(/\bMaprimerenov\b/gi, "MaPrimeRénov'")
    .replace(/\bPac\b/g, 'PAC')
    .replace(/\bDpe\b/g, 'DPE')
    .replace(/\bIrve\b/g, 'IRVE')
    .replace(/\bPtz\b/g, 'PTZ')
  return cleaned
}

export const PILLAR_HUB_BY_TOPIC: Record<GuideTopic, { href: string; label: string }> = {
  'rge-cee': { href: '/rge', label: 'Trouver un artisan RGE certifié' },
  isolation: {
    href: '/services/isolation',
    label: 'Artisans isolation qualifiés',
  },
  chauffage: {
    href: '/services/chauffagiste',
    label: 'Chauffagistes qualifiés',
  },
  plomberie: { href: '/services/plombier', label: 'Plombiers qualifiés' },
  electricite: { href: '/services/electricien', label: 'Électriciens qualifiés' },
  toiture: { href: '/services/couvreur', label: 'Couvreurs qualifiés' },
  facade: { href: '/services/facadier', label: 'Façadiers qualifiés' },
  menuiserie: { href: '/services/menuisier', label: 'Menuisiers qualifiés' },
  amenagement: { href: '/services', label: 'Artisans tous corps d’état' },
  'devis-artisan': { href: '/devis', label: 'Obtenir un devis artisan' },
  'administratif-legal': {
    href: '/rge/fraude-rge-comment-verifier',
    label: 'Vérifier un artisan',
  },
  'renovation-energetique': {
    href: '/renovation-energetique',
    label: 'Hub rénovation énergétique',
  },
  divers: { href: '/guides', label: 'Tous nos guides' },
}
