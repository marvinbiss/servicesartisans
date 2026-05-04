/**
 * Dispatch service slug → Author profile (Tier 5 2026-05-04).
 *
 * Used by templates that emit Article schema for a `service` route mais ne
 * peuvent pas fixer un Person author en const top-level (slug dynamique).
 *
 * Stratégie : préférer l'expert qui a explicitement le métier dans ses
 * `expertise` ou couvre les normes/DTU du domaine (cf. authors.ts methodology).
 * Fallback sophie-martin (rénovation/réglementation transverse) — choix sûr
 * E-E-A-T car elle source ADEME/France Rénov' communs à tous les métiers.
 *
 * Pourquoi pas un map exhaustif : plus de ~80 services, et le mapping doit
 * rester défendable. On mappe explicitement les ~15 grands clusters et on
 * utilise un fallback explicite pour le reste — pas de claim hors couverture.
 */
import { authors, type Author } from './authors'

const SERVICE_AUTHOR_MAP: Record<string, string> = {
  // Plomberie / chauffage / PAC — Jean-Pierre Duval (DTU plomberie/chauffage,
  // QualiPAC, AFG, 20 ans).
  plombier: 'jean-pierre-duval',
  chauffagiste: 'jean-pierre-duval',
  'pompe-a-chaleur': 'jean-pierre-duval',
  'pompe-a-chaleur-air-eau': 'jean-pierre-duval',
  'pompe-a-chaleur-air-air': 'jean-pierre-duval',
  'pompe-a-chaleur-geothermique': 'jean-pierre-duval',
  'chaudiere-gaz': 'jean-pierre-duval',
  'chaudiere-granules': 'jean-pierre-duval',
  'chauffe-eau': 'jean-pierre-duval',
  'chauffe-eau-thermodynamique': 'jean-pierre-duval',
  'poele-bois': 'jean-pierre-duval',
  'poele-granules': 'jean-pierre-duval',

  // Électricité / IRVE / domotique — Marc Lefebvre (NF C 15-100, Consuel,
  // Qualifelec, 18 ans).
  electricien: 'marc-lefebvre',
  electricite: 'marc-lefebvre',
  domotique: 'marc-lefebvre',
  'borne-recharge': 'marc-lefebvre',
  'irve-borne-recharge': 'marc-lefebvre',

  // Peinture / ITE — Isabelle Renault (DTU 59, DTU 45.3, Qualibat peinture,
  // 14 ans).
  peintre: 'isabelle-renault',
  peinture: 'isabelle-renault',
  'isolation-exterieure': 'isabelle-renault',
  ite: 'isabelle-renault',
  ravalement: 'isabelle-renault',

  // Rénovation intérieure / menuiserie — Thomas Bernard (DTU 25.41 plâtrerie,
  // DTU 36.5 menuiserie, DTU 52.1 carrelage, 10 ans).
  menuisier: 'thomas-bernard',
  menuiserie: 'thomas-bernard',
  carreleur: 'thomas-bernard',
  carrelage: 'thomas-bernard',
  cuisiniste: 'thomas-bernard',
  'salle-de-bain': 'thomas-bernard',
  platrier: 'thomas-bernard',

  // Default fallback (autre, multi-trade, généraliste rénovation) résolu
  // en bas via fallbackAuthor.
}

const FALLBACK_AUTHOR_SLUG = 'sophie-martin'

/**
 * Résout l'auteur Person pour un slug de service. Renvoie toujours un Author
 * défendable — soit le spécialiste mappé, soit le généraliste rénovation
 * (sophie-martin) pour les métiers transverses ou non explicitement couverts.
 */
export function getAuthorForServiceSlug(serviceSlug: string): Author {
  const slug = SERVICE_AUTHOR_MAP[serviceSlug] ?? FALLBACK_AUTHOR_SLUG
  return authors[slug] ?? authors[FALLBACK_AUTHOR_SLUG]
}
