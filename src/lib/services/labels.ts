/**
 * Service slug → label humain (français).
 *
 * Source unique pour les pages SEO qui projettent un slug canonical
 * (cf. `CANONICAL_SERVICE_SLUGS`) vers un libellé affichable côté UI ou
 * JSON-LD. Ne contient QUE les slugs canoniques + quelques alias historiques
 * RGE conservés pour rétro-compat (chauffe-eau-thermodynamique, audit-energetique,
 * fenetres, ventilation) tant que des fiches en DB peuvent encore les porter.
 *
 * Migration 527 (backfill services_offered depuis rge_qualifications) ne
 * produit QUE des slugs canoniques — les alias restent ici pour absorber
 * une éventuelle donnée legacy déjà saisie par un artisan claim.
 */

import { CANONICAL_SERVICE_SLUGS } from '@/lib/services/canonical-slugs'

const CANONICAL_LABELS: Record<(typeof CANONICAL_SERVICE_SLUGS)[number], string> = {
  plombier: 'Plombier',
  electricien: 'Électricien',
  chauffagiste: 'Chauffagiste',
  'peintre-en-batiment': 'Peintre en bâtiment',
  menuisier: 'Menuisier',
  couvreur: 'Couvreur',
  macon: 'Maçon',
  climaticien: 'Climaticien (VMC, climatisation)',
  charpentier: 'Charpentier',
  zingueur: 'Zingueur',
  etancheiste: 'Étanchéiste',
  facadier: 'Façadier',
  platrier: 'Plâtrier',
  'salle-de-bain': 'Rénovation salle de bain',
  'pompe-a-chaleur': 'Pompe à chaleur',
  'panneaux-solaires': 'Panneaux solaires',
  'isolation-thermique': 'Isolation thermique',
  'renovation-energetique': 'Rénovation énergétique',
  'borne-recharge': 'Borne de recharge électrique',
  ramoneur: 'Ramoneur',
  diagnostiqueur: 'Diagnostiqueur énergétique (DPE, audit)',
}

const LEGACY_ALIASES: Record<string, string> = {
  'chauffe-eau-thermodynamique': 'Chauffe-eau thermodynamique',
  'audit-energetique': 'Audit énergétique',
  ventilation: 'Ventilation (VMC)',
  fenetres: 'Fenêtres performantes',
}

const ALL_LABELS: Record<string, string> = {
  ...CANONICAL_LABELS,
  ...LEGACY_ALIASES,
}

/**
 * Retourne le libellé humain pour un slug. Fallback : slug capitalisé
 * (premier char upper + reste tel quel) si inconnu, pour ne JAMAIS émettre
 * de chaîne vide dans le JSON-LD.
 */
export function getServiceLabel(slug: string): string {
  if (ALL_LABELS[slug]) return ALL_LABELS[slug]
  if (slug.length === 0) return slug
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
}

export const SERVICE_LABELS_FR: Readonly<Record<string, string>> = ALL_LABELS
