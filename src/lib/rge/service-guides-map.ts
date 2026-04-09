/**
 * service-guides-map — helpers de cross-linking éditorial entre les pages
 * listings RGE (`/rge/[service]`) et les guides éditoriaux (RGE qualif +
 * primes CEE).
 *
 * Ce fichier est un pur mapping en lecture seule construit à partir de deux
 * sources de vérité :
 *   - `RGE_QUALIFICATION_GUIDES` (champ `linkedRgeService`) pour inverser
 *     service → guides qualif
 *   - `CEE_OPERATIONS_WITH_GUIDE` + un mapping statique code CEE → services
 *     RGE concernés, aligné sur les `services_slugs` du seed SQL des
 *     opérations CEE (migration 383). On maintient un mapping local pour
 *     éviter une dépendance DB/async sur le rendu des pages ISR.
 *
 * Règle : jamais de modif des fichiers de contenu sources. Si un nouveau
 * guide RGE ou une nouvelle opération CEE est ajoutée, mettre à jour ce
 * fichier en conséquence.
 */

import {
  RGE_QUALIFICATION_GUIDES,
  type RgeQualificationGuide,
} from './qualification-guides-content'
import { CEE_OPERATIONS_WITH_GUIDE } from '@/lib/cee/operation-guides-content'

/**
 * Sous-ensemble minimal du contenu d'un guide RGE qualif exposé par ce
 * helper pour les besoins du cross-linking — évite de trimballer l'objet
 * guide complet et ses 400+ lignes de contenu inutiles côté consommateur.
 */
export interface RgeGuideLink {
  slug: string
  name: string
  organisme: string
  lede: string
}

/**
 * Libellés courts des opérations CEE — miroir de ceux utilisés dans
 * `ArtisanRgeEnrichedSection` pour cohérence visuelle. On maintient la
 * copie ici pour garder `service-guides-map` auto-suffisant (pas d'import
 * depuis un composant client).
 */
const CEE_SHORT_LABELS: Record<string, string> = {
  // BAR-TH-104 abrogée 01/01/2024 → BAR-TH-171 (PAC air/eau haute performance, SCOP ≥ 4)
  // BAR-TH-106 abrogée 01/01/2024 — chaudières gaz/fioul plus éligibles CEE
  // BAR-TH-160 supprimée 01/08/2025 — pas de remplacement direct
  // BAR-TH-164 abrogée → BAR-TH-174 (rénovation d'ampleur maison individuelle)
  'BAR-TH-171': 'Pompe à chaleur air/eau haute performance',
  'BAR-TH-172': 'Pompe à chaleur eau/eau ou sol/eau',
  'BAR-TH-174': "Rénovation d'ampleur d'une maison individuelle",
  'BAR-TH-112': 'Appareil indépendant de chauffage au bois',
  'BAR-TH-113': 'Chaudière biomasse individuelle',
  'BAR-TH-125': 'Ventilation mécanique double flux',
  'BAR-TH-129': 'Pompe à chaleur air/air',
  'BAR-TH-148': 'Chauffe-eau thermodynamique',
  'BAR-EN-101': 'Isolation des combles ou toitures',
  'BAR-EN-102': 'Isolation des murs',
  'BAR-EN-103': 'Isolation des planchers bas',
  'BAR-EN-104': 'Fenêtres ou baies vitrées',
}

/**
 * Mapping statique code CEE → services RGE concernés. Aligné sur le seed
 * SQL `cee_operations.services_slugs` de la migration 383. Ne lister QUE
 * les services présents dans `RGE_ALLOWED_SERVICES`.
 */
const CEE_CODE_TO_RGE_SERVICES: Record<string, readonly string[]> = {
  // BAR-TH-104 abrogée 01/01/2024 → BAR-TH-171
  // BAR-TH-106 abrogée 01/01/2024 — chaudières gaz/fioul plus éligibles CEE
  // BAR-TH-160 supprimée 01/08/2025 — pas de remplacement direct
  // BAR-TH-164 abrogée → BAR-TH-174
  'BAR-TH-171': ['pompe-a-chaleur', 'chauffagiste'],
  'BAR-TH-172': ['pompe-a-chaleur', 'chauffagiste'],
  'BAR-TH-174': ['isolation-thermique'],
  'BAR-TH-112': ['chauffagiste', 'ramoneur'],
  'BAR-TH-113': ['chauffagiste'],
  'BAR-TH-125': ['climaticien', 'chauffagiste'],
  'BAR-TH-129': ['pompe-a-chaleur', 'climaticien'],
  'BAR-TH-148': ['pompe-a-chaleur', 'chauffagiste', 'plombier'],
  'BAR-EN-101': ['isolation-thermique', 'couvreur'],
  'BAR-EN-102': ['isolation-thermique', 'facadier', 'platrier'],
  'BAR-EN-103': ['isolation-thermique'],
  'BAR-EN-104': ['menuisier'],
}

/**
 * Représentation compacte d'un guide CEE pour le cross-linking.
 */
export interface CeeGuideLink {
  code: string
  label: string
}

/**
 * Retourne la liste des guides RGE qualif éditoriaux pertinents pour un
 * service donné, via inverse mapping de `linkedRgeService`. Pur, synchrone,
 * safe en build.
 */
export function getRgeGuidesForService(serviceSlug: string): RgeGuideLink[] {
  const matches: RgeGuideLink[] = []
  for (const guide of Object.values(RGE_QUALIFICATION_GUIDES) as RgeQualificationGuide[]) {
    if (guide.linkedRgeService === serviceSlug) {
      matches.push({
        slug: guide.slug,
        name: guide.name,
        organisme: guide.organisme,
        lede: guide.lede,
      })
    }
  }
  return matches
}

/**
 * Retourne la liste des guides CEE publiés pertinents pour un service
 * donné. Filtre sur `CEE_OPERATIONS_WITH_GUIDE` pour ne jamais renvoyer
 * un code sans guide éditorial (404 interne). Pur, synchrone.
 */
export function getCeeGuidesForService(serviceSlug: string): CeeGuideLink[] {
  const published = new Set(CEE_OPERATIONS_WITH_GUIDE)
  const matches: CeeGuideLink[] = []
  for (const [code, services] of Object.entries(CEE_CODE_TO_RGE_SERVICES)) {
    if (!published.has(code)) continue
    if (!services.includes(serviceSlug)) continue
    matches.push({
      code,
      label: CEE_SHORT_LABELS[code] ?? code,
    })
  }
  return matches
}
